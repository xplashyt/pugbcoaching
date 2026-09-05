import { createHash, timingSafeEqual } from "node:crypto";

export function signIntegrity(reference: string, amountInCents: number, currency: string, secret: string) {
  return createHash("sha256").update(`${reference}${amountInCents}${currency}${secret}`, "utf8").digest("hex");
}

function resolvePath(source: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

export function verifyEventSignature(input: { data: Record<string, unknown>; timestamp: number; properties: string[]; checksum: string; secret: string }) {
  const values = input.properties.map((path) => resolvePath(input.data, path));
  if (values.some((value) => value === null || value === undefined)) return false;
  const payload = `${values.map(String).join("")}${String(input.timestamp)}${input.secret}`;
  const expected = createHash("sha256").update(payload, "utf8").digest("hex");
  const receivedBuffer = Buffer.from(input.checksum.toLowerCase(), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}
