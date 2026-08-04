import type { AdminInviteDTO } from "./api/adminInvites.api";

/**
 * Demo-mode sample of platform-wide invites for the admin oversight page, so it
 * renders fully with no backend. Fabricated data — it must never appear as
 * platform truth in live mode (the hook only serves this when `demoMode` is on).
 * Mirrors {@link AdminInviteDTO}.
 */
export const ADMIN_INVITES: AdminInviteDTO[] = [
  {
    id: "inv_1001",
    code: "QP-7F3K-2026",
    status: "used",
    inviter: { slug: "tiago", name: "Tiago Costa" },
    invitee: { slug: "marco", name: "Marco Vieira" },
    createdAt: "2026-06-18T10:42:00.000Z",
    expiresAt: "2026-06-25T10:42:00.000Z",
  },
  {
    id: "inv_1002",
    code: "QP-9A2M-2026",
    status: "valid",
    inviter: { slug: "ines", name: "Inês Marques" },
    email: "someone@example.pt",
    createdAt: "2026-07-01T14:10:00.000Z",
    expiresAt: "2026-07-08T14:10:00.000Z",
  },
  {
    id: "inv_1003",
    code: "QP-4C8T-2026",
    status: "expired",
    inviter: { slug: "joana", name: "Joana Reis" },
    createdAt: "2026-05-30T09:00:00.000Z",
    expiresAt: "2026-06-06T09:00:00.000Z",
  },
  {
    id: "inv_1004",
    code: "QP-2H6P-2026",
    status: "revoked",
    inviter: { slug: "tiago", name: "Tiago Costa" },
    email: "changed-my-mind@example.pt",
    createdAt: "2026-07-04T18:20:00.000Z",
    expiresAt: "2026-07-11T18:20:00.000Z",
  },
  {
    id: "inv_1005",
    code: "QP-5X1B-2026",
    status: "valid",
    inviter: { slug: "rui", name: "Rui Santos" },
    createdAt: "2026-07-20T08:05:00.000Z",
    expiresAt: "2026-07-27T08:05:00.000Z",
  },
  {
    id: "inv_1006",
    code: "QP-8D4L-2026",
    status: "used",
    inviter: { slug: "ines", name: "Inês Marques" },
    invitee: { slug: "sofia", name: "Sofia Antunes" },
    createdAt: "2026-06-02T12:00:00.000Z",
    expiresAt: "2026-06-09T12:00:00.000Z",
  },
];
