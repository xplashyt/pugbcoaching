import { NextRequest, NextResponse } from "next/server";
import { collectLeafMessages, createTransaction, transactionForBrowser } from "@/lib/wompi-api";
import { parseReference } from "@/lib/orders";

export const runtime = "nodejs";

interface PayRequest { token?: string; fullName?: string; email?: string; reference?: string; acceptedTerms?: boolean; }

export async function POST(request: NextRequest) {
  let input: PayRequest;
  try { input = (await request.json()) as PayRequest; }
  catch { return NextResponse.json({ message: "La solicitud de pago no es válida." }, { status: 400 }); }

  const email = input.email?.trim().toLowerCase() ?? "";
  const fullName = input.fullName?.trim() ?? "";
  const reference = input.reference ?? "";
  const parsed = parseReference(reference);
  if (!input.acceptedTerms) return NextResponse.json({ message: "Debes aceptar los contratos de Wompi." }, { status: 400 });
  if (!input.token?.startsWith("tok_") || !parsed) return NextResponse.json({ message: "El entrenamiento o el token de pago no es válido." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 3) return NextResponse.json({ message: "Revisa el correo y el nombre del titular." }, { status: 400 });

  const amountInCents = parsed.plan.priceCOP * 100;
  try {
    const result = await createTransaction({ token: input.token, email, fullName, reference, amountInCents });
    if (!result.ok || !result.payload.data) {
      const details = collectLeafMessages(result.payload.error);
      console.error("[WOMPI PAY]", result.statusCode, JSON.stringify({ error: result.payload.error }));
      return NextResponse.json({ message: details[0] ?? "Wompi no pudo crear la transacción.", details }, { status: result.statusCode >= 400 && result.statusCode < 500 ? 422 : 502 });
    }
    const transaction = result.payload.data;
    if (transaction.reference !== reference || transaction.amount_in_cents !== amountInCents || transaction.currency !== "COP") {
      console.error("[WOMPI PAY] La respuesta no coincide con la orden esperada.");
      return NextResponse.json({ message: "No pudimos verificar la respuesta del pago." }, { status: 502 });
    }
    return NextResponse.json(transactionForBrowser(transaction), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible conectar con Wompi.";
    console.error("[WOMPI PAY]", message);
    return NextResponse.json({ message }, { status: 502 });
  }
}
