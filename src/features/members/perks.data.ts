export type PerkState = "available" | "locked" | "claimed";

export type PerkFooter =
  | { type: "active-auto"; autoLabel: string }
  | { type: "button"; label: string; toast: string }
  | { type: "link-auto"; label: string; to: string; autoLabel: string }
  | { type: "lock"; label: string }
  | { type: "claimed"; date: string };

export interface Perk {
  /** Stable catalogue key, and the path segment the claim endpoint takes. */
  key: string;
  category: string;
  title: string;
  description: string;
  state: PerkState;
  footer: PerkFooter;
}

export interface PerkGroup {
  label: string;
  perks: Perk[];
}

/**
 * DEMO fixtures only. They mirror the backend's `PERK_CATALOG`, which SUS-04
 * cut down to the perks the backend really enforces: `early-rsvp` (no RSVP
 * window exists, and QueerPulse sends no email), `trusted-lounge` (no such
 * community) and `host-without-approval` (there is no host review to skip)
 * were deleted rather than advertised. What is left is vouch access, which
 * every active member genuinely has, and the two invite-quota rungs, which
 * `invites.service.ts` enforces once claimed.
 *
 * The invite numbers here are the demo deployment's: live mode never reads
 * this file, it renders the numbers the backend computed from its own
 * configured quota.
 */
export const perkGroups: PerkGroup[] = [
  {
    label: "Available to claim",
    perks: [
      {
        key: "invite-quota-level-4",
        category: "Membership",
        title: "More invites each month",
        description:
          "Claim it and your monthly invite allowance goes from 5 to 7. Invites reset on the first of each month.",
        state: "available",
        footer: {
          type: "button",
          label: "Claim the higher allowance",
          toast: "Claimed. Your monthly invite allowance is higher from now on",
        },
      },
    ],
  },
  {
    label: "Coming at Level 5 · Trusted",
    perks: [
      {
        key: "invite-quota-level-5",
        category: "Membership",
        title: "The highest invite allowance",
        description:
          "Claim it and your monthly invite allowance goes from 5 to 10. The community grows because of people like you.",
        state: "locked",
        footer: { type: "lock", label: "Unlocks at Level 5 · Trusted" },
      },
    ],
  },
  {
    label: "Already claimed",
    perks: [
      {
        key: "vouch-access",
        category: "Community",
        // Matches the backend catalogue: vouching has no level gate — every
        // active member already has this from day one (COM-15).
        title: "Vouch access",
        description:
          "The ability to vouch for other members, a trust signal that helps them stand out. Every active member has it from day one.",
        state: "claimed",
        footer: { type: "claimed", date: "Claimed 14 Feb 2026" },
      },
    ],
  },
];

/** Number of perks currently available to redeem. */
export const availableCount = perkGroups[0]!.perks.length;

export const sidebarCopy = {
  explain:
    "Perks aren't a loyalty programme. They're our way of making sure the members who show up get a little more back. Each level reflects something real: time invested, gatherings attended, people connected. The platform grows because you do.",
  suggestPrompt:
    "What would make being a long-term member feel genuinely valuable?",
  suggestToast: "Suggestion sent. Thank you",
};
