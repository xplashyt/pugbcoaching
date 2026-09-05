"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FieldGlyph } from "@/components/FieldGlyph";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";
import { buildReference } from "@/lib/orders";
import { formatCOP, type Plan } from "@/lib/plans";
import { formatCardNumber, formatExpiry, isCardFormValid, tokenizeCard, WompiClientError } from "@/lib/wompi-client";

type Phase = "form" | "procesando" | "aprobado" | "rechazado" | "expirado";
type TransactionStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

interface BrowserTransaction { id: string; reference: string; status: TransactionStatus; status_message?: string | null; processor_response_code?: string | null; }
interface AcceptanceLinks { terms: string; personalData: string; }
interface AcceptancePayload extends Partial<AcceptanceLinks> { code?: "WOMPI_NOT_CONFIGURED" | "WOMPI_UNAVAILABLE"; }
interface ApiPayload extends Partial<BrowserTransaction> { message?: string; details?: string[]; }
interface FailureInfo { title: string; raw: string; explanation: string; details: string[]; code?: string | null; }

function failureInfo(rawMessage: string, code?: string | null, details: string[] = []): FailureInfo {
  const raw = rawMessage || "La pasarela no devolvió un motivo específico.";
  const text = `${code ?? ""} ${raw}`.toLowerCase();
  if (/ws05|por motivos de seguridad|security/.test(text)) return { title: "Pago rechazado por seguridad", raw, code, details, explanation: "Este código no significa necesariamente que falten fondos ni confirma que exista fraude. Corrige los datos o prueba una sola vez con otra tarjeta." };
  if (/fondos|cupo|insufficient|\b51\b/.test(text)) return { title: "Fondos o cupo insuficiente", raw, code, details, explanation: "El banco no autorizó el valor. Revisa el cupo disponible o utiliza otra tarjeta." };
  if (/vencid|expired|\b54\b/.test(text)) return { title: "Tarjeta vencida", raw, code, details, explanation: "Comprueba la fecha o utiliza una tarjeta vigente." };
  if (/cvc|cvv|security code|\bn7\b/.test(text)) return { title: "Revisa el código de seguridad", raw, code, details, explanation: "Vuelve a los campos y escribe el CVC/CVV de la tarjeta." };
  if (/bloquead|blocked|not permitted|no permitida|\b57\b/.test(text)) return { title: "Operación no permitida", raw, code, details, explanation: "Consulta con tu banco si la tarjeta está habilitada para compras por internet." };
  if (/sandbox|ambiente de pruebas|test card/.test(text)) return { title: "La tarjeta no corresponde al ambiente", raw, code, details, explanation: "Las tarjetas reales requieren las cuatro llaves de producción. Las llaves de prueba solo admiten tarjetas de sandbox." };
  if (/fraud|riesgo|risk/.test(text)) return { title: "Revisión de seguridad", raw, code, details, explanation: "La ruta de pago aplicó un control antifraude. Esto no confirma fraude; prueba una sola vez con otra tarjeta o consulta con el banco." };
  return { title: "El pago no fue aprobado", raw, code, details, explanation: "Revisa los datos, intenta una sola vez con otra tarjeta y conserva la referencia si necesitas soporte." };
}

export function CheckoutPouch({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  return plan ? <CheckoutContent key={plan.id} plan={plan} onClose={onClose} /> : null;
}

function CheckoutContent({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptance, setAcceptance] = useState<AcceptanceLinks | null>(null);
  const [acceptanceState, setAcceptanceState] = useState<"loading" | "preview" | "error">("loading");
  const [transaction, setTransaction] = useState<BrowserTransaction | null>(null);
  const [failure, setFailure] = useState<FailureInfo | null>(null);
  const [reference, setReference] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const [expMonth = "", expYear = ""] = expiry.split("/");
  const card = useMemo(() => ({ number: cardNumber, cvc, expMonth, expYear, cardHolder }), [cardNumber, cvc, expMonth, expYear, cardHolder]);
  const canPay = Boolean(acceptedTerms && acceptance && isCardFormValid(card, email));

  useEffect(() => {
    const frame = requestAnimationFrame(() => emailRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/wompi/acceptance", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as AcceptancePayload;
        if (!response.ok || !data.terms || !data.personalData) {
          setAcceptanceState(data.code === "WOMPI_NOT_CONFIGURED" ? "preview" : "error");
          return;
        }
        setAcceptance({ terms: data.terms, personalData: data.personalData });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAcceptanceState("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (phase !== "procesando") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "procesando" || transaction?.status !== "PENDING") return;
    let active = true;
    let timer: number | undefined;
    const started = Date.now();
    const check = async () => {
      if (!active) return;
      if (Date.now() - started >= 5 * 60 * 1000) { setPhase("expirado"); return; }
      try {
        const response = await fetch(`/api/wompi/status/${encodeURIComponent(transaction.id)}`, { cache: "no-store" });
        const data = (await response.json()) as ApiPayload;
        if (response.ok && data.id && data.status) {
          const next = data as BrowserTransaction;
          setTransaction(next);
          if (next.status === "APPROVED") setPhase("aprobado");
          if (["DECLINED", "VOIDED", "ERROR"].includes(next.status)) { setFailure(failureInfo(next.status_message ?? "", next.processor_response_code)); setPhase("rechazado"); }
        }
      } catch {
        // La consulta continúa hasta recibir un estado final o completar cinco minutos.
      }
      if (active) timer = window.setTimeout(check, 2500);
    };
    timer = window.setTimeout(check, 2500);
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [phase, transaction?.id, transaction?.status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPay) return;
    setPhase("procesando");
    setElapsed(0);
    setFailure(null);
    const nextReference = buildReference(plan.id);
    setReference(nextReference);
    try {
      const token = await tokenizeCard(card);
      const response = await fetch("/api/wompi/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, fullName: cardHolder.trim(), email: email.trim(), reference: nextReference, acceptedTerms: true }) });
      const data = (await response.json()) as ApiPayload;
      if (!response.ok || !data.id || !data.status) { setFailure(failureInfo(data.message ?? "Wompi no pudo crear la transacción.", data.processor_response_code, data.details)); setPhase("rechazado"); return; }
      const next = data as BrowserTransaction;
      setTransaction(next);
      if (next.status === "APPROVED") setPhase("aprobado");
      else if (next.status === "PENDING") setPhase("procesando");
      else { setFailure(failureInfo(next.status_message ?? "", next.processor_response_code)); setPhase("rechazado"); }
    } catch (error) {
      const raw = error instanceof Error ? error.message : "No fue posible iniciar el pago.";
      const safe = raw.includes("NEXT_PUBLIC_WOMPI") ? "El pago todavía no está configurado." : raw;
      const details = error instanceof WompiClientError ? error.details : [];
      setFailure(failureInfo(safe, null, details));
      setPhase("rechazado");
    }
  }

  async function copyReference() {
    if (!reference) return;
    await navigator.clipboard.writeText(reference);
    setCopied(true);
  }

  const transactionId = transaction?.id ?? "Pendiente de asignación";
  const extraDetails = failure?.details.filter((detail) => detail !== failure.raw) ?? [];

  return (
    <section className="fixed inset-0 z-50 flex items-end bg-ink/45" aria-label="Capa de pago">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pouch-title" className="pouch-sheet relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[42px] bg-chalk text-ink shadow-[0_-24px_70px_rgba(24,32,25,.28)]">
        <div className="sticky top-0 z-10 bg-chalk/95 px-5 pt-3 sm:px-9"><span className="mx-auto block h-1.5 w-24 rounded-full bg-forest/25" /><div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 py-5"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-beacon">Bolsa de compra · pago único</p><h2 id="pouch-title" className="truncate font-display text-2xl font-semibold tracking-[-.04em] sm:text-3xl">{plan.name}</h2></div><div className="flex shrink-0 items-center gap-4"><strong className="font-body text-xl font-semibold tabular-nums text-forest sm:text-2xl">{formatCOP(plan.priceCOP)}</strong><button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-forest text-xl" aria-label="Cerrar pago">×</button></div></div></div>

        {phase === "form" && <form onSubmit={submit} className="mx-auto max-w-[1320px] px-5 pb-10 sm:px-9">
          <div className="mb-7 grid gap-4 rounded-[28px] bg-mist p-5 sm:grid-cols-[1fr_auto] sm:items-center"><p className="max-w-3xl leading-6 text-ink/65">{plan.summary} Recibirás <strong className="text-ink">{plan.deliverable.toLowerCase()}</strong>; coordinaremos la entrega por el correo que escribas abajo.</p><span className="text-sm font-semibold text-forest">{plan.duration} · {plan.drills} prácticas</span></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <label className="pouch-field lg:col-span-2"><span>Correo para coordinar la entrega</span><input ref={emailRef} name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" /></label>
            <label className="pouch-field lg:col-span-2"><span>Nombre del titular</span><input name="card-holder" type="text" autoComplete="cc-name" required value={cardHolder} onChange={(event) => setCardHolder(event.target.value)} placeholder="Como aparece en la tarjeta" /></label>
            <label className="pouch-field lg:col-span-2"><span>Número de tarjeta</span><input name="card-number" type="text" inputMode="numeric" autoComplete="cc-number" required value={cardNumber} onChange={(event) => setCardNumber(formatCardNumber(event.target.value))} placeholder="0000 0000 0000 0000" maxLength={23} /></label>
            <label className="pouch-field lg:col-span-1"><span>Vencimiento</span><input name="card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp" required value={expiry} onChange={(event) => setExpiry(formatExpiry(event.target.value))} placeholder="MM/AA" maxLength={5} /></label>
            <label className="pouch-field lg:col-span-1"><span>CVC / CVV</span><input name="card-cvc" type="password" inputMode="numeric" autoComplete="cc-csc" required value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" maxLength={4} /></label>
            <div className="flex min-h-[86px] items-center rounded-[22px] bg-white/60 px-5 py-4 text-sm leading-5 md:col-span-2 lg:col-span-3" aria-live="polite">{acceptance ? <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#E75B3D]" /><span>Acepto los <a href={acceptance.terms} target="_blank" rel="noreferrer" className="font-semibold underline">términos de Wompi</a> y la <a href={acceptance.personalData} target="_blank" rel="noreferrer" className="font-semibold underline">autorización de datos</a>.</span></label> : acceptanceState === "preview" ? <p className="text-ink/55">Vista previa del formulario. Al colocar las cuatro llaves de Wompi, los contratos y el pago se activan sin cambiar el código.</p> : acceptanceState === "error" ? <p className="font-semibold text-beacon">No pudimos conectar con Wompi en este momento. Vuelve a abrir el formulario para reintentar o <a href={`mailto:${CORREO_CONTACTO}`} className="underline">contacta soporte</a>.</p> : <p className="text-ink/55">Cargando contratos de pago…</p>}</div>
            <button type="submit" disabled={!canPay} className="flex min-h-[86px] items-center justify-center gap-3 rounded-[22px] bg-forest px-6 py-4 font-display text-lg font-semibold text-white enabled:hover:bg-beacon disabled:cursor-not-allowed disabled:opacity-35 md:col-span-2 lg:col-span-1"><FieldGlyph name="card" />Pagar</button>
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/50">El número y el CVC se cifran en este navegador y se envían directamente a Wompi. Cota Segura no los recibe ni almacena.</p>
        </form>}

        {phase === "procesando" && <ResultShell><p className="text-xs font-bold uppercase tracking-[.18em] text-beacon">Autorización en curso · {elapsed}s</p><h3 className="mt-4 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Wompi está confirmando el pago.</h3><p className="mt-5 max-w-2xl text-lg leading-8 text-ink/62">No cierres la bolsa ni repitas el cobro. El tiempo mostrado no es una barra de progreso.</p>{reference && <p className="mt-7 break-all text-xs font-semibold">Ref. {reference}</p>}</ResultShell>}

        {phase === "aprobado" && <ResultShell><p className="text-xs font-bold uppercase tracking-[.18em] text-forest">Aterrizaje confirmado</p><h3 className="mt-4 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Pago aprobado.</h3><p className="mt-5 max-w-2xl text-lg leading-8">Recibimos tu pago. Nos comunicaremos contigo a este correo para coordinar la entrega, en máximo {HORAS_DE_ENTREGA} horas hábiles.</p><Receipt plan={plan} email={email} reference={reference} transactionId={transactionId} /><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={copyReference} className="rounded-full bg-forest px-6 py-3 font-semibold text-white">{copied ? "Referencia copiada" : "Copiar referencia"}</button><a href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(`Pago ${reference}`)}`} className="rounded-full border border-forest px-6 py-3 text-center font-semibold">Contactar soporte</a></div><p className="mt-5 text-sm leading-6 text-ink/55">Si no recibes contacto dentro del plazo, escribe a <a href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(`Pago ${reference}`)}`} className="font-semibold underline">{CORREO_CONTACTO}</a> con la referencia o el comprobante. No se envió un correo automático.</p></ResultShell>}

        {phase === "rechazado" && failure && <ResultShell><p className="text-xs font-bold uppercase tracking-[.18em] text-beacon">No autorizado</p><h3 className="mt-4 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">{failure.title}</h3><p className="mt-5 max-w-2xl text-lg font-semibold leading-8">{failure.explanation}</p><div className="mt-7 rounded-[26px] bg-mist p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-beacon">Mensaje exacto de la pasarela</p><p className="mt-2 whitespace-pre-wrap leading-6">{failure.raw}</p>{failure.code && <p className="mt-3 text-sm font-semibold">Código: {failure.code}</p>}{extraDetails.length > 0 && <ul className="mt-4 list-inside list-disc space-y-1 text-sm">{extraDetails.map((detail) => <li key={detail}>{detail}</li>)}</ul>}</div>{reference && <p className="mt-5 break-all text-xs font-semibold">Ref. {reference}</p>}<div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setPhase("form")} className="rounded-full bg-forest px-6 py-3 font-semibold text-white">Corregir datos</button><a href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(`Ayuda con pago ${reference}`)}`} className="rounded-full border border-forest px-6 py-3 text-center font-semibold">Pedir ayuda</a></div></ResultShell>}

        {phase === "expirado" && <ResultShell><p className="text-xs font-bold uppercase tracking-[.18em] text-ochre">Confirmación pendiente</p><h3 className="mt-4 font-display text-4xl font-semibold tracking-[-.05em] sm:text-6xl">El pago sigue en proceso.</h3><p className="mt-5 max-w-2xl text-lg leading-8 text-ink/62">La consulta llegó a cinco minutos; eso no significa que haya fallado. Cuando Wompi confirme, nos comunicaremos al correo registrado. Conserva la referencia.</p><p className="mt-7 break-all rounded-[22px] bg-mist p-4 text-sm font-semibold">{reference}</p><a href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(`Pago pendiente ${reference}`)}`} className="mt-6 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-white">Contactar soporte</a></ResultShell>}
      </div>
    </section>
  );
}

function ResultShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[980px] px-5 pb-14 pt-5 sm:px-9 sm:pb-20" aria-live="polite">{children}</div>;
}

function Receipt({ plan, email, reference, transactionId }: { plan: Plan; email: string; reference: string; transactionId: string }) {
  const rows = [["Entrenamiento", plan.name], ["Correo", email], ["Referencia", reference], ["ID Wompi", transactionId], ["Total", formatCOP(plan.priceCOP)]];
  return <dl className="mt-8 grid overflow-hidden rounded-[26px] bg-mist sm:grid-cols-2">{rows.map(([label, value], index) => <div key={label} className={`p-5 ${index === rows.length - 1 ? "sm:col-span-2" : ""}`}><dt className="text-[10px] uppercase tracking-[.14em] text-ink/45">{label}</dt><dd className="mt-1 break-all font-semibold">{value}</dd></div>)}</dl>;
}
