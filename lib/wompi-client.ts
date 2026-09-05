import { getPublicWompiKey, wompiBaseUrl } from "@/lib/wompi-env";

export interface CardInput { number: string; cvc: string; expMonth: string; expYear: string; cardHolder: string; }
interface TokenizationKeyResponse { data?: { publicKey?: string | JsonWebKey; public_key?: string | JsonWebKey; }; error?: unknown; }
interface TokenResponse { status?: string; data?: { id?: string }; error?: unknown; }

export class WompiClientError extends Error {
  details: string[];
  constructor(message: string, details: string[]) { super(message); this.name = "WompiClientError"; this.details = details; }
}

function toBase64Url(data: Uint8Array) {
  let binary = "";
  data.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function textToBase64Url(value: string) { return toBase64Url(new TextEncoder().encode(value)); }
function pemToBuffer(pem: string) {
  const encoded = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

async function importRsaKey(key: string | JsonWebKey) {
  if (typeof key === "string") return crypto.subtle.importKey("spki", pemToBuffer(key), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  return crypto.subtle.importKey("jwk", key, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}

async function encryptCardPayload(publicKey: string | JsonWebKey, payload: Record<string, string>) {
  const header = textToBase64Url(JSON.stringify({ alg: "RSA-OAEP-256", enc: "A256GCM" }));
  const contentKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const rsaKey = await importRsaKey(publicKey);
  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, contentKey);
  const aesKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(header), tagLength: 128 }, aesKey, new TextEncoder().encode(JSON.stringify(payload))));
  const tag = encrypted.slice(-16);
  const ciphertext = encrypted.slice(0, -16);
  return [header, toBase64Url(new Uint8Array(encryptedKey)), toBase64Url(iv), toBase64Url(ciphertext), toBase64Url(tag)].join(".");
}

function leafMessages(value: unknown): string[] {
  const messages: string[] = [];
  const visit = (node: unknown) => {
    if (typeof node === "string") messages.push(node);
    else if (Array.isArray(node)) node.forEach(visit);
    else if (node && typeof node === "object") Object.values(node as Record<string, unknown>).forEach(visit);
  };
  visit(value);
  return [...new Set(messages)];
}

export async function tokenizeCard(card: CardInput) {
  const publicKey = getPublicWompiKey();
  const baseUrl = wompiBaseUrl(publicKey);
  const keyResponse = await fetch(`${baseUrl}/tokens/keys/tokenization`, { headers: { Authorization: `Bearer ${publicKey}` } });
  const keyPayload = (await keyResponse.json()) as TokenizationKeyResponse;
  const tokenizationKey = keyPayload.data?.publicKey ?? keyPayload.data?.public_key;
  if (!keyResponse.ok || !tokenizationKey) {
    console.error("[WOMPI TOKENIZATION KEY]", keyPayload.error);
    const details = leafMessages(keyPayload.error);
    throw new WompiClientError(details[0] ?? "No fue posible preparar el pago seguro con Wompi.", details);
  }

  // La tarjeta se cifra y tokeniza en el navegador; nunca se envía a nuestro servidor.
  const payload = await encryptCardPayload(tokenizationKey, {
    number: card.number.replace(/\D/g, ""), cvc: card.cvc, exp_month: card.expMonth, exp_year: card.expYear, card_holder: card.cardHolder.trim(),
  });
  const response = await fetch(`${baseUrl}/tokens/cards`, { method: "POST", headers: { Authorization: `Bearer ${publicKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ payload }) });
  const result = (await response.json()) as TokenResponse;
  if (!response.ok || result.status !== "CREATED" || !result.data?.id) {
    console.error("[WOMPI TOKEN]", result.error);
    const details = leafMessages(result.error);
    throw new WompiClientError(details[0] ?? "Wompi no pudo validar los datos de la tarjeta. Revísalos e intenta de nuevo.", details);
  }
  return result.data.id;
}

export function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim(); }
export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}
export function isCardFormValid(card: CardInput, email: string) {
  const number = card.number.replace(/\D/g, "");
  const month = Number(card.expMonth);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && card.cardHolder.trim().length >= 3 && number.length >= 13 && number.length <= 19 && month >= 1 && month <= 12 && /^\d{2}$/.test(card.expYear) && /^\d{3,4}$/.test(card.cvc);
}
