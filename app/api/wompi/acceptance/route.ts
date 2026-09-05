import { NextResponse } from "next/server";
import { getAcceptanceTokens } from "@/lib/wompi-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { links } = await getAcceptanceTokens();
    return NextResponse.json(links, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cargar los contratos de Wompi.";
    const notConfigured = message.includes("Falta configurar") || message.includes("Faltan las llaves");
    console.error("[WOMPI ACCEPTANCE]", message);
    return NextResponse.json({ message, code: notConfigured ? "WOMPI_NOT_CONFIGURED" : "WOMPI_UNAVAILABLE" }, { status: notConfigured ? 503 : 502 });
  }
}
