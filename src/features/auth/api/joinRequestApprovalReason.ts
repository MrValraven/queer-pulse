/**
 * Closed set of reason keys a reviewer picks when approving a join request,
 * the approval-side twin of `joinRequestDeclineReason.ts`. Same append-only
 * contract: this is the wire format of the backend's nullable
 * `approval_reason varchar(64)` column, so add a new key when a new reason is
 * needed, never rename an existing one, or old rows stop resolving to a label.
 *
 * STAFF-ONLY. The applicant never sees why they were approved; the reason is
 * there so the people working the queue can read each other's calls against
 * one bar, the same job the decline reason does.
 */
export const APPROVAL_REASONS = [
  "member_vouched",
  "clear_request",
  "known_to_team",
  "partner_or_event",
  "other",
] as const;

export type ApprovalReason = (typeof APPROVAL_REASONS)[number];

const KNOWN = new Set<string>(APPROVAL_REASONS);

export function parseApprovalReason(
  raw: string | null | undefined,
): ApprovalReason | null {
  return raw && KNOWN.has(raw) ? (raw as ApprovalReason) : null;
}

/**
 * The i18n key for an approval reason's admin-facing label, or null when the
 * row carries none. Approvals made before reasons existed have a null column,
 * and the caller renders "No reason recorded" for them rather than guessing.
 * An unknown key from a newer frontend falls back to "Other".
 */
export function approvalReasonLabelKey(reason: string | null): string | null {
  if (!reason) return null;
  return KNOWN.has(reason)
    ? `admin:members.verify.approvalReason.${reason}`
    : "admin:members.verify.approvalReason.other";
}

/** The one-line detail shown under each label in the approve picker. */
export function approvalReasonDetailKey(reason: ApprovalReason): string {
  return `admin:members.verify.approvalReasonDetail.${reason}`;
}
