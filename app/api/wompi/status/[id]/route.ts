import { NextResponse } from "next/server";
import { getTransaction, transactionForBrowser } from "@/lib/wompi-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\w[\w-]{8,120}$/.test(id)) return NextResponse.json({ message: "El id de la transacción no es válido." }, { status: 400 });
  try {
    const result = await getTransaction(id);
    if (!result.ok || !result.payload.data) return NextResponse.json({ message: "No fue posible consultar la transacción." }, { status: result.statusCode === 404 ? 404 : 502 });
    return NextResponse.json(transactionForBrowser(result.payload.data), { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible consultar la transacción.";
    console.error("[WOMPI STATUS]", message);
    return NextResponse.json({ message }, { status: 502 });
  }
}
