import { getPlan } from "@/lib/plans";

export const REFERENCE_PREFIX = "cts";

export function buildReference(planId: string) {
  return `${REFERENCE_PREFIX}-${planId}-${Date.now()}`;
}

export function parseReference(reference: string) {
  const parts = reference.split("-");
  const timestamp = parts.at(-1);
  if (!timestamp || !/^\d+$/.test(timestamp)) return null;
  const planId = parts.slice(1, -1).join("-");
  const plan = getPlan(planId);
  if (parts[0] !== REFERENCE_PREFIX || !plan) return null;
  return { plan, timestamp: Number(timestamp) };
}

export function isCotaSeguraReference(reference: string) {
  return reference.startsWith(`${REFERENCE_PREFIX}-`);
}
