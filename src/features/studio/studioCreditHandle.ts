/** The handle as the lookup reads it: trimmed, one leading @ dropped and
 *  lowercased, so "@NightForm" and "nightform" share one read. The server
 *  normalises it again with its own handle rules. */
export function normalizeCreditHandle(input: string): string {
  return input.trim().replace(/^@/, "").toLowerCase();
}
