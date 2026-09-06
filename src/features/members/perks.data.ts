export type PerkState = "available" | "locked" | "claimed";

/**
 * Mirrors `PerkFooterDTO`. Every English string on a footer is a FALLBACK:
 * the words the page renders come from `perkCatalog.data.ts`, keyed on the
 * perk's stable id, so an id this build does not know still reads as English
 * rather than as an identifier.
 */
export type PerkFooter =
  | { type: "active-auto"; autoLabel: string }
  | { type: "button"; label: string; toast: string }
  | { type: "link-auto"; label: string; to: string; autoLabel: string }
  | { type: "lock"; label: string; unlockLevel: number }
  /** ISO timestamp. The card formats and phrases it locally. */
  | { type: "claimed"; date: string };

/** Monthly invite allowance before and after claiming an invite-quota perk,
 *  so the card interpolates its own sentence with the numbers the backend
 *  really enforces. Absent on every other perk. */
export interface PerkInviteQuota {
  base: number;
  total: number;
}

export interface Perk {
  /** Stable catalogue key, the path segment the claim endpoint takes, and the
   *  id the card resolves its category, title, description and footer copy
   *  from. Persisted on `recognition_perk_claims.perk_key`: never rename one. */
  key: string;
  category: string;
  title: string;
  description: string;
  state: PerkState;
  footer: PerkFooter;
  inviteQuota?: PerkInviteQuota;
}

export type PerkGroupKind = "available" | "coming" | "claimed";

export interface PerkGroup {
  kind: PerkGroupKind;
  /** Set only on a `coming` group: the level its perks unlock at. The heading
   *  names that level with the frontend's own level names. */
  unlockLevel?: number;
  /** English fallback for the heading. */
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
    kind: "available",
    label: "Available to claim",
    perks: [
      {
        key: "invite-quota-level-4",
        category: "Membership",
        title: "More invites each month",
        description:
          "Claim it and your monthly invite allowance goes from 5 to 7. Invites reset on the first of each month.",
        state: "available",
        inviteQuota: { base: 5, total: 7 },
        footer: {
          type: "button",
          label: "Claim the higher allowance",
          toast: "Claimed. Your monthly invite allowance is higher from now on",
        },
      },
    ],
  },
  {
    kind: "coming",
    unlockLevel: 5,
    label: "Coming at Level 5 · Trusted",
    perks: [
      {
        key: "invite-quota-level-5",
        category: "Membership",
        title: "The highest invite allowance",
        description:
          "Claim it and your monthly invite allowance goes from 5 to 10. The community grows because of people like you.",
        state: "locked",
        inviteQuota: { base: 5, total: 10 },
        footer: {
          type: "lock",
          label: "Unlocks at Level 5 · Trusted",
          unlockLevel: 5,
        },
      },
    ],
  },
  {
    kind: "claimed",
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
        footer: { type: "claimed", date: "2026-02-14T00:00:00.000Z" },
      },
    ],
  },
];

/** Number of perks currently available to redeem. */
export const availableCount = perkGroups[0]!.perks.length;

/**
 * DEMO fixtures, like everything else in this file. The sidebar used to read
 * `explain` and a `suggestPrompt` unconditionally, so a live member read demo
 * prose as the perks explainer and as the label of the suggestion box. Live
 * mode now renders translated copy of its own and the textarea is labelled
 * from the catalogue in either mode, so `suggestPrompt` is gone; what is left
 * is read only behind a `demoMode` branch, which keeps the standalone
 * prototype reading the way it always has.
 */
export const sidebarCopy = {
  explain:
    "Perks aren't a loyalty programme. They're our way of making sure the members who show up get a little more back. Each level reflects something real: time invested, gatherings attended, people connected. The platform grows because you do.",
  suggestToast: "Suggestion sent. Thank you",
};
