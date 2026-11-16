import type { Formatters } from "../../shared/i18n/format";

/**
 * The one money format for Reports and Governance: a whole amount reads
 * without decimals (€34,370) and an amount with cents shows them (€12.50).
 * Every finance figure on both pages goes through here, so the same quarter
 * reads the same wherever it appears.
 */
export function formatEuro(fmt: Formatters, value: number): string {
  const isWhole = Math.abs(value - Math.round(value)) < 0.005;
  return fmt.currency(
    isWhole ? Math.round(value) : value,
    "EUR",
    isWhole ? { maximumFractionDigits: 0 } : undefined,
  );
}
