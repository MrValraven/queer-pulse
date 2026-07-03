import type { SentInviteDTO } from "./api/invite.api";

/** Demo-mode sample of invites the current member has already sent — so the
 *  sent-invites list renders fully with no backend. Mirrors {@link SentInviteDTO}. */
export const SENT_INVITES: SentInviteDTO[] = [
  {
    code: "QP-7F3K-2026",
    status: "used",
    createdAt: "2026-06-18T10:42:00.000Z",
    expiresAt: "2026-06-25T10:42:00.000Z",
    note: "You'd genuinely belong here — no ads, no algorithm.",
    acceptedBy: {
      slug: "marco",
      firstName: "Marco",
      lastName: "Vieira",
    },
  },
  {
    code: "QP-9A2M-2026",
    status: "valid",
    createdAt: "2026-07-01T14:10:00.000Z",
    expiresAt: "2026-07-08T14:10:00.000Z",
    note: "Thought of you the moment I joined this.",
  },
  {
    code: "QP-4C8T-2026",
    status: "expired",
    createdAt: "2026-05-30T09:00:00.000Z",
    expiresAt: "2026-06-06T09:00:00.000Z",
  },
];
