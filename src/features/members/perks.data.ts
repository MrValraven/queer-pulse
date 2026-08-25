export type PerkState = "available" | "locked" | "claimed";

export type PerkFooter =
  | { type: "active-auto"; autoLabel: string }
  | { type: "button"; label: string; toast: string }
  | { type: "link-auto"; label: string; to: string; autoLabel: string }
  | { type: "lock"; label: string }
  | { type: "claimed"; date: string };

export interface Perk {
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

export const perkGroups: PerkGroup[] = [
  {
    label: "Available to claim",
    perks: [
      {
        category: "Early Access",
        title: "Early RSVP Access",
        description:
          "Get 48-hour early access to all new gathering RSVPs before they open to the community. You'll receive an email the moment a new gathering is approved, before the public link goes live.",
        state: "available",
        footer: {
          type: "active-auto",
          autoLabel: "Applied automatically at Level 4",
        },
      },
      {
        category: "Community",
        title: "Trusted Lounge",
        description:
          "Access to the Trusted members-only community: a smaller, quieter space for Level 4+ members to connect. Less noise, more depth. Not indexed or visible to the general directory.",
        state: "available",
        footer: {
          type: "button",
          label: "Join the lounge",
          toast: "Welcome to the Trusted Lounge",
        },
      },
      {
        category: "Membership",
        title: "Increased Invite Quota",
        description:
          "Your monthly invite allowance increases from 1 to 2. You know people who belong here. Now you can bring more of them in. Invites reset on the first of each month.",
        state: "available",
        footer: {
          type: "link-auto",
          label: "Send an invite",
          to: "/auth/invite",
          autoLabel: "Requires action",
        },
      },
    ],
  },
  {
    label: "Coming at Level 5 · Trusted",
    perks: [
      {
        category: "Hosting",
        title: "Host without approval",
        description:
          "Skip the host application review. Your gatherings go live immediately. You've earned the trust. We're just formalising it.",
        state: "locked",
        footer: { type: "lock", label: "Unlocks at Level 5 · Trusted" },
      },
      {
        category: "Membership",
        title: "Invite quota increases to 3",
        description:
          "Bring even more people in. At Level 5, your monthly quota goes to 3 invites. The community grows because of people like you.",
        state: "locked",
        footer: { type: "lock", label: "Unlocks at Level 5 · Trusted" },
      },
    ],
  },
  {
    label: "Already claimed",
    perks: [
      {
        category: "Community",
        title: "Vouch access",
        // Matches the backend catalog: vouching has no level gate — every
        // active member already has this from day one (COM-15). Kept in the
        // "claimed" demo state purely to showcase that UI variant; the copy
        // itself no longer claims a Level 3 unlock that never existed.
        description:
          "The ability to vouch for other members, a trust signal that helps them stand out. Available to every active member from day one, no level required.",
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
