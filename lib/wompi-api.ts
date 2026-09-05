import { getPublicWompiKey, getServerWompiConfig, wompiBaseUrl } from "@/lib/wompi-env";
import { signIntegrity } from "@/lib/wompi";

interface AcceptanceItem { acceptance_token: string; permalink: string; }
interface AcceptanceResponse { data?: { presigned_acceptance?: AcceptanceItem; presigned_personal_data_auth?: AcceptanceItem; }; }
export interface PublicAcceptanceLinks { terms: string; personalData: string; }

export interface WompiTransaction {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  customer_email?: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  status_message?: string | null;
  payment_method_type?: string;
  payment_method?: { type?: string; extra?: { processor_response_code?: string | null; return_code?: string | null; brand?: string | null; last_four?: string | null; }; };
}

interface TransactionResponse { data?: WompiTransaction; error?: unknown; }

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text) as unknown; }
  catch { return { error: { reason: text } }; }
}

function hasAcceptanceTokens(data: AcceptanceResponse["data"]): data is NonNullable<AcceptanceResponse["data"]> & { presigned_acceptance: AcceptanceItem; presigned_personal_data_auth: AcceptanceItem } {
  return Boolean(data?.presigned_acceptance?.acceptance_token && data.presigned_acceptance.permalink && data.presigned_personal_data_auth?.acceptance_token && data.presigned_personal_data_auth.permalink);
}

export async function getAcceptanceTokens() {
  const publicKey = getPublicWompiKey();
  const baseUrl = wompiBaseUrl(publicKey);
  const response = await fetch(`${baseUrl}/merchants/info`, { headers: { "x-merchant-public-key": publicKey }, cache: "no-store" });
  const payload = (await readJson(response)) as AcceptanceResponse;
  if (!response.ok || !hasAcceptanceTokens(payload.data)) throw new Error("Wompi no devolvió los contratos de aceptación.");
  return {
    acceptanceToken: payload.data.presigned_acceptance.acceptance_token,
    personalDataToken: payload.data.presigned_personal_data_auth.acceptance_token,
    links: { terms: payload.data.presigned_acceptance.permalink, personalData: payload.data.presigned_personal_data_auth.permalink } satisfies PublicAcceptanceLinks,
  };
}

export function signTransaction(reference: string, amountInCents: number, currency = "COP") {
  const { integritySecret } = getServerWompiConfig();
  // Esta composición debe volver a verificarse contra la documentación vigente antes de producción.
  return signIntegrity(reference, amountInCents, currency, integritySecret);
}

export interface CreateTransactionInput { token: string; email: string; fullName: string; reference: string; amountInCents: number; }

export async function createTransaction(input: CreateTransactionInput) {
  const { baseUrl, privateKey } = getServerWompiConfig();
  const acceptance = await getAcceptanceTokens();
  const body = {
    acceptance_token: acceptance.acceptanceToken,
    accept_personal_auth: acceptance.personalDataToken,
    amount_in_cents: input.amountInCents,
    currency: "COP",
    customer_email: input.email,
    reference: input.reference,
    signature: signTransaction(input.reference, input.amountInCents),
    payment_method_type: "CARD",
    payment_method: { type: "CARD", token: input.token, installments: 1 },
    customer_data: { full_name: input.fullName },
  };
  const response = await fetch(`${baseUrl}/transactions`, { method: "POST", headers: { Authorization: `Bearer ${privateKey}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const payload = (await readJson(response)) as TransactionResponse;
  return { ok: response.ok, statusCode: response.status, payload };
}

export async function getTransaction(transactionId: string) {
  const { baseUrl, privateKey } = getServerWompiConfig();
  const response = await fetch(`${baseUrl}/transactions/${encodeURIComponent(transactionId)}`, { headers: { Authorization: `Bearer ${privateKey}` }, cache: "no-store" });
  const payload = (await readJson(response)) as TransactionResponse;
  return { ok: response.ok, statusCode: response.status, payload };
}

export function transactionForBrowser(transaction: WompiTransaction) {
  return {
    id: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
    status_message: transaction.status_message ?? null,
    processor_response_code: transaction.payment_method?.extra?.processor_response_code ?? transaction.payment_method?.extra?.return_code ?? null,
  };
}

export function collectLeafMessages(value: unknown): string[] {
  const messages: string[] = [];
  const visit = (node: unknown) => {
    if (typeof node === "string") messages.push(node);
    else if (Array.isArray(node)) node.forEach(visit);
    else if (node && typeof node === "object") Object.values(node as Record<string, unknown>).forEach(visit);
  };
  visit(value);
  return [...new Set(messages)].slice(0, 8);
}
