/**
 * Static seed + types for the IVA threshold tracker. All real state lives in
 * localStorage via `useLocalStorage` — this just gives a first-run example so
 * the progress bar isn't empty on the very first visit.
 */

/** One invoiced amount counting toward the art. 53.º exemption threshold. */
export interface IvaEntry {
  /** Stable client-side id (crypto.randomUUID, with a fallback). */
  id: string;
  /** What the invoice was for. */
  label: string;
  /** Invoiced amount in euros (gross, before any retention). */
  amount: number;
  /** ISO date string (YYYY-MM-DD) the invoice was issued. */
  date: string;
}

/** Generate a stable id, falling back when crypto.randomUUID is unavailable. */
export function newId(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore — fall through to the manual fallback
  }
  return (
    "iva-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * First-run sample so the tracker reads as a real, in-progress year rather than
 * an empty void. Persisted under `qp.economy.ivaEntries` on first visit, then
 * fully editable.
 */
export const IVA_SEED: IvaEntry[] = [
  {
    id: "seed-brand-studio",
    label: "Brand identity — Lupa Studio",
    amount: 3200,
    date: "2026-02-12",
  },
  {
    id: "seed-zine-layout",
    label: "Zine layout & typesetting",
    amount: 1450,
    date: "2026-04-03",
  },
];
