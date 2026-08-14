import type { JoinRequestDTO } from "../../auth/api/joinRequest.api";

/** Demo-mode sample of incoming platform join requests, so the mod review queue
 *  renders fully with no backend. Mirrors {@link JoinRequestDTO} exactly — name,
 *  email, city, message and the 18+ attestation record a reviewer needs. */
export const JOIN_REQUESTS: JoinRequestDTO[] = [
  {
    id: "jr-marco",
    name: "Marco Vieira",
    email: "marco@example.com",
    city: "Porto",
    status: "pending",
    createdAt: "2026-07-01T09:12:00.000Z",
    ageAttestedAt: "2026-07-01T09:11:40.000Z",
    termsVersion: "2.4",
    source: "homepage_hero",
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message:
      "I run a small queer zine in Porto and keep hearing this is where the good people are. I'd love a quieter place to actually talk.",
  },
  {
    id: "jr-rui",
    name: "Rui Antunes",
    email: "rui@example.com",
    city: "Lisboa",
    status: "pending",
    createdAt: "2026-06-30T18:40:00.000Z",
    ageAttestedAt: "2026-06-30T18:39:12.000Z",
    termsVersion: "2.4",
    source: "skills",
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message:
      "New to Lisbon and looking for community that isn't just nightlife. A friend mentioned Devon here.",
  },
  {
    id: "jr-nadia",
    name: "Nadia Lopes",
    email: "nadia@example.com",
    // Left blank on the form — city is optional, so demo covers the null branch.
    city: null,
    status: "pending",
    createdAt: "2026-06-28T11:05:00.000Z",
    ageAttestedAt: "2026-06-28T11:04:31.000Z",
    termsVersion: "2.4",
    // No source — went straight to the request page, so demo covers the
    // "Opened the invite page directly" fallback.
    source: null,
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message:
      "Trans organiser, been doing mutual-aid work for years. I want somewhere I can be off the clock and still queer.",
  },
];

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * A plausible, stable invite code for demo-mode approvals — the same shape the
 * backend issues (`QP-7F3K-2026`). Deterministic from the request id so the
 * copied link doesn't change between renders.
 */
export function demoInviteCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  let block = "";
  for (let i = 0; i < 4; i++) {
    block += CODE_ALPHABET[h % CODE_ALPHABET.length];
    h = Math.floor(h / CODE_ALPHABET.length) + 7;
  }
  return `QP-${block}-2026`;
}
