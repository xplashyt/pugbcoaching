import { FieldGlyph } from "@/components/FieldGlyph";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";

const steps = [
  { icon: "canopy" as const, title: "Eliges", text: "Comparas el problema, duración, prácticas, plataforma y entregable." },
  { icon: "card" as const, title: "Wompi procesa", text: "La tarjeta se tokeniza en el navegador y el servidor calcula el valor real." },
  { icon: "mail" as const, title: "Coordinamos", text: `Con el pago aprobado, te escribimos en máximo ${HORAS_DE_ENTREGA} horas hábiles.` },
];

export function DeliveryPath() {
  return (
    <section id="entrega" className="py-24 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-9 lg:px-14">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-beacon">Compra y entrega</p>
        <h2 className="mt-5 max-w-4xl font-display text-[clamp(3rem,5.5vw,6rem)] font-semibold leading-[.94] tracking-[-.06em]">El pago termina en pantalla. El contacto empieza por correo.</h2>
        <ol className="delivery-arc mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((step) => <li key={step.title} className="relative pt-10"><span className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full bg-ochre text-ink"><FieldGlyph name={step.icon} /></span><h3 className="font-display text-2xl font-semibold">{step.title}</h3><p className="mt-3 max-w-sm leading-7 text-ink/60">{step.text}</p></li>)}
        </ol>
        <div className="mt-20 grid gap-8 rounded-[40px] bg-forest p-7 text-white sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center"><FieldGlyph name="shield" className="h-12 w-12 text-ochre" /><div><h3 className="font-display text-3xl font-semibold">Tu cuenta no se entrega.</h3><p className="mt-2 leading-7 text-white/65">No pedimos credenciales, no jugamos Ranked por ti, no hacemos boosting y no usamos macros, adaptadores o programas externos no autorizados.</p></div><a href={`mailto:${CORREO_CONTACTO}`} className="rounded-full bg-chalk px-6 py-3 text-center text-sm font-bold text-forest">Consultar antes de pagar</a></div>
      </div>
    </section>
  );
}
