import { NextRequest, NextResponse } from "next/server";
import { CORREO_CONTACTO } from "@/lib/contacto";
import { isCotaSeguraReference, parseReference } from "@/lib/orders";
import { getServerWompiConfig } from "@/lib/wompi-env";
import { verifyEventSignature } from "@/lib/wompi";
import type { WompiTransaction } from "@/lib/wompi-api";

export const runtime = "nodejs";

interface WompiEvent {
  event?: string;
  data?: { transaction?: WompiTransaction; [key: string]: unknown };
  environment?: string;
  timestamp?: number;
  signature?: { properties?: string[]; checksum?: string };
}

const reportedTransactions = new Set<string>();

function validChecksum(event: WompiEvent, headerChecksum: string | null, secret: string) {
  const properties = event.signature?.properties;
  const checksum = headerChecksum ?? event.signature?.checksum;
  if (!properties?.length || !checksum || !event.data || event.timestamp === undefined) return false;
  return verifyEventSignature({ data: event.data as Record<string, unknown>, timestamp: event.timestamp, properties, checksum, secret });
}

export async function POST(request: NextRequest) {
  let event: WompiEvent;
  try { event = (await request.json()) as WompiEvent; }
  catch { return NextResponse.json({ received: false }, { status: 400 }); }

  try {
    const config = getServerWompiConfig();
    if (!validChecksum(event, request.headers.get("x-event-checksum"), config.eventsSecret)) return NextResponse.json({ received: false }, { status: 401 });
    const expectedEnvironment = config.environment === "test" ? "test" : "prod";
    if (event.environment && !event.environment.toLowerCase().includes(expectedEnvironment)) return NextResponse.json({ received: true });

    const transaction = event.data?.transaction;
    if (!transaction || typeof transaction.reference !== "string" || !isCotaSeguraReference(transaction.reference)) return NextResponse.json({ received: true });
    const order = parseReference(transaction.reference);
    const matchesOrder = order && transaction.amount_in_cents === order.plan.priceCOP * 100 && transaction.currency === "COP";

    if (event.event === "transaction.updated" && transaction.status === "APPROVED" && matchesOrder && !reportedTransactions.has(transaction.id)) {
      reportedTransactions.add(transaction.id);
      // Este Set evita duplicados en una instancia, pero no reemplaza persistencia compartida.
      console.log("[VENTA PAGADA]", JSON.stringify({ curso: order.plan.name, referencia: transaction.reference, transaccion: transaction.id, correo: transaction.customer_email, monto: transaction.amount_in_cents, medio: transaction.payment_method_type ?? transaction.payment_method?.type, soporte: CORREO_CONTACTO }));
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible verificar el evento.";
    console.error("[WOMPI WEBHOOK]", message);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
