/**
 * A stored finance quarter ("2026-Q3") as its parts, for the localised
 * `quarterLabel` keys on the public Governance page and the admin Finances
 * tab. Null for anything that is not a quarter.
 */
export function parseQuarter(
  quarter: string | null,
): { year: number; quarter: number } | null {
  const match = quarter ? /^(\d{4})-Q([1-4])$/.exec(quarter) : null;
  return match ? { year: Number(match[1]), quarter: Number(match[2]) } : null;
}
