import type { SentInviteDTO } from "./api/invite.api";

/** Demo-mode sample of invites the current member has already sent — so the
 *  sent-invites list renders fully with no backend. Mirrors the finalized
 *  {@link SentInviteDTO} (`MyInviteView`): real `id`, `acceptedBy` only on a
 *  `used` row, and `note`/`vouch`/`email` present-or-null. */
export const SENT_INVITES: SentInviteDTO[] = [
  {
    id: "d1f7a0c2-1a2b-4c3d-8e4f-000000000001",
    code: "QP-7F3K-2026",
    status: "used",
    note: "You'd genuinely belong here: no ads, no algorithm.",
    vouch: null,
    email: null,
    createdAt: "2026-06-18T10:42:00.000Z",
    expiresAt: "2026-06-25T10:42:00.000Z",
    acceptedBy: {
      firstName: "Marco",
      lastName: "Vieira",
      slug: "marco",
      avatarUrl: null,
    },
  },
  {
    id: "d1f7a0c2-1a2b-4c3d-8e4f-000000000002",
    code: "QP-9A2M-2026",
    status: "valid",
    note: "Thought of you the moment I joined this.",
    vouch: null,
    // Pinned: only this address can redeem it, so the row reads as addressed.
    email: "ines.pereira@example.com",
    createdAt: "2026-07-01T14:10:00.000Z",
    expiresAt: "2026-07-08T14:10:00.000Z",
    acceptedBy: null,
  },
  {
    id: "d1f7a0c2-1a2b-4c3d-8e4f-000000000003",
    code: "QP-4C8T-2026",
    status: "expired",
    note: null,
    vouch: null,
    email: null,
    createdAt: "2026-05-30T09:00:00.000Z",
    expiresAt: "2026-06-06T09:00:00.000Z",
    acceptedBy: null,
  },
  {
    id: "d1f7a0c2-1a2b-4c3d-8e4f-000000000004",
    code: "QP-2H6R-2026",
    status: "valid",
    note: null,
    vouch: null,
    // Unpinned: a bearer link, so the row reads "anyone with the link".
    email: null,
    createdAt: "2026-07-04T18:25:00.000Z",
    expiresAt: "2026-07-11T18:25:00.000Z",
    acceptedBy: null,
  },
];
