import { NextResponse } from "next/server";
import { getPublicWompiKey, wompiBaseUrl } from "@/lib/wompi-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicKey = getPublicWompiKey();
    // Wompi no incluye CORS en esta respuesta. Solo mediamos la llave pública;
    // la tarjeta se cifra y tokeniza directamente desde el navegador.
    const response = await fetch(`${wompiBaseUrl(publicKey)}/tokens/keys/tokenization`, {
      headers: { Authorization: `Bearer ${publicKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json() as {
      data?: { publicKey?: string | JsonWebKey; public_key?: string | JsonWebKey };
    };
    const encryptionKey = payload.data?.publicKey ?? payload.data?.public_key;
    if (!response.ok || !encryptionKey) {
      return NextResponse.json(
        { error: { message: "No se pudo obtener la llave de cifrado de Wompi. El pago no se ha iniciado." } },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { data: { publicKey: encryptionKey } },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { error: { message: "No se pudo conectar con Wompi para preparar el pago. El pago no se ha iniciado." } },
      { status: 502 },
    );
  }
}
