import type { InviteQuotaDTO } from "./api/invite.api";

/** Demo-mode invite allowance, so the quota panel renders fully with no backend.
 *  A fixed illustrative reset instant (1 Aug 2026, UTC) keeps the demo stable —
 *  the live path computes the real date. Mirrors {@link InviteQuotaDTO}.
 *
 *  Kept consistent with `SENT_INVITES` (./sentInvites.data): the backend counts
 *  invites created since the start of the current UTC month regardless of
 *  status, and exactly one demo invite (QP-9A2M, created 2026-07-01) falls in
 *  July 2026 — the demo's "now". So `used` is 1, not the 3 total rows shown in
 *  the sent list. Update these together if either mock's July dates change. */
export const INVITE_QUOTA: InviteQuotaDTO = {
  limit: 5,
  used: 1,
  remaining: 4,
  resetsAt: "2026-08-01T00:00:00.000Z",
  // Matches the fixed illustrative size used elsewhere in demo mode (see
  // `demoInvite` in `api/useInvite.ts`).
  memberCount: 247,
};
