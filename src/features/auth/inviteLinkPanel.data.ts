export const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** Format the live `expiresAt`; demo mode sends '' so we fall back to the 7-day line. */
export function expiryLabel(iso: string): string {
  if (!iso) return "Expires in 7 days";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Expires in 7 days";
  return `Expires ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
}
