import type { SentInviteDTO } from "./api/invite.api";

const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;
/** The newest generated invite; each one after it was sent four days earlier. */
const GENERATED_NEWEST_AT = Date.UTC(2026, 4, 26, 11, 15);

/** Lifecycle of each generated invite, newest first. */
const GENERATED_STATUSES: SentInviteDTO["status"][] = [
  "used",
  "expired",
  "revoked",
  "used",
  "valid",
  "expired",
  "used",
  "used",
  "revoked",
  "expired",
  "used",
  "valid",
  "expired",
  "used",
  "revoked",
  "used",
  "expired",
  "used",
  "valid",
  "expired",
  "used",
  "revoked",
];

/** Who redeemed each generated `used` invite, in order. */
const ACCEPTED_NAMES: [firstName: string, lastName: string][] = [
  ["Rita", "Lopes"],
  ["Miguel", "Faria"],
  ["Joana", "Matos"],
  ["Duarte", "Reis"],
  ["Beatriz", "Cunha"],
  ["Noah", "Almeida"],
  ["Sara", "Pinto"],
  ["Leonor", "Costa"],
  ["Kai", "Moreira"],
];

/** One older generated invite. Ids and `QP-XXXX-2026` codes are unique per
 *  position; every third one is pinned to an address. A pending one has no
 *  set expiry, so it still reads Pending in the demo's July. */
function buildGeneratedInvite(
  status: SentInviteDTO["status"],
  position: number,
): SentInviteDTO {
  const createdAt = GENERATED_NEWEST_AT - position * 4 * DAY_MS;
  const acceptedIndex = GENERATED_STATUSES.slice(0, position).filter(
    (earlierStatus) => earlierStatus === "used",
  ).length;
  const acceptedName = ACCEPTED_NAMES[acceptedIndex % ACCEPTED_NAMES.length];
  return {
    id: `d1f7a0c2-1a2b-4c3d-8e4f-${String(position + 5).padStart(12, "0")}`,
    code: `QP-${(46656 + position * 1777).toString(36).toUpperCase()}-2026`,
    status,
    note: null,
    vouch: null,
    email: position % 3 === 0 ? `guest.${position + 5}@example.com` : null,
    createdAt: new Date(createdAt).toISOString(),
    expiresAt:
      status === "valid"
        ? null
        : new Date(createdAt + SEVEN_DAYS_MS).toISOString(),
    acceptedBy:
      status === "used" && acceptedName
        ? {
            firstName: acceptedName[0],
            lastName: acceptedName[1],
            slug: acceptedName[0].toLowerCase(),
            avatarUrl: null,
          }
        : null,
  };
}

/** The 22 older invites behind the hand-written ones, newest first. */
const GENERATED_INVITES: SentInviteDTO[] = GENERATED_STATUSES.map(
  (status, position) => buildGeneratedInvite(status, position),
);

/** Demo-mode sample of invites the current member has already sent, so the
 *  sent-invites list renders fully with no backend. Mirrors the finalized
 *  {@link SentInviteDTO} (`MyInviteView`): real `id`, `acceptedBy` only on a
 *  `used` row, and `note`/`vouch`/`email` present-or-null.
 *
 *  The four hand-written rows lead; {@link GENERATED_INVITES} adds older ones
 *  so the list runs past one 20-row page and "Show more" has something to
 *  load. The generated rows all predate July 2026 (the demo's "now"), so the
 *  monthly quota in `inviteQuota.data.ts` still counts the same invites. */
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
  ...GENERATED_INVITES,
];
