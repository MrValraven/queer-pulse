/**
 * Closed set of reason keys a reviewer picks when declining a join request
 * (guideline audit D5/E5). Mirrors `joinRequestSource.ts`'s append-only
 * contract exactly: this is the wire contract with the backend's nullable
 * `decline_reason varchar(64)` column, so add a new key when a new reason is
 * needed, never rename an existing one — old rows would stop resolving to a
 * label.
 */
export const DECLINE_REASONS = [
  "spam_pattern",
  "underage",
  "implausible",
  "safety_concern",
  "other",
] as const;

export type DeclineReason = (typeof DECLINE_REASONS)[number];

const KNOWN = new Set<string>(DECLINE_REASONS);

export function parseDeclineReason(
  raw: string | null | undefined,
): DeclineReason | null {
  return raw && KNOWN.has(raw) ? (raw as DeclineReason) : null;
}

/**
 * The i18n key for a decline reason's admin-facing label. Unknown/legacy
 * values fall back to a neutral catalog entry rather than rendering a raw
 * key.
 */
export function declineReasonLabelKey(reason: string | null): string {
  if (reason && KNOWN.has(reason)) {
    return `admin:members.verify.declineReason.${reason}`;
  }
  return "admin:members.verify.declineReason.other";
}
