/* ===========================================================
   Start a Community — static option data, types, helpers.
   The community counterpart to List Your Business: a warm,
   narrative wizard that founds a member-owned community.
   =========================================================== */

import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { CommunityType } from "../../homepage/data/types";
import type { AccessTier } from "../membership.types";

export const TOTAL_STEPS = 9;

export type TintKey = "coral" | "jade" | "plum";

/** A person helping run the space (owner or co-steward). */
export interface Steward {
  key: string;
  name: string;
  initials: string;
  tint: TintKey;
  role: "owner" | "mod";
}

export interface CommunityDraft {
  /** Chapter 1 — why */
  name: string;
  purpose: string;
  type: CommunityType | "";
  /** Chapter 2 — who */
  whoFor: string;
  /** Chapter 3 — safety */
  accessTier: AccessTier | "";
  rosterVisible: boolean;
  /** Chapter 4 — running */
  stewards: Steward[];
  features: string[]; // FEATURE_OPTIONS ids
  /** Chapter 5 — tone */
  rules: string[];
  /** Chapter 6 — feeling */
  tint: TintKey;
  tagline: string;
  /** Chapter 7 — people */
  invites: string[]; // INVITE_CANDIDATES keys
  /** Chapter 8 — confirm */
  handle: string;
  consent: boolean;
}

/** A community founded this session (persisted in CreatedCommunitiesProvider). */
export interface CreatedCommunity extends CommunityDraft {
  type: CommunityType;
  accessTier: AccessTier;
  slug: string;
  ref: string; // e.g. QP-C-0003
  ownerSlug: string;
  createdAt: string; // human label, e.g. "just now"
}

/* ---------- Panel metadata ---------- */

export interface PanelMeta {
  key: string;
  thread: string; // short label on the founding-thread rail
  eyebrow: string;
  /** Title text; the segment wrapped in ⟪ ⟫ renders as a coral <em>. */
  title: string;
  lead: string;
}

export const PANELS: PanelMeta[] = [
  {
    key: "open",
    thread: "Open",
    eyebrow: "Founding a space",
    title: "Every community started with ⟪one person⟫ opening a door.",
    lead: "This is yours to open. Take it a step at a time — nothing goes live until the very end, and you can leave and come back whenever you like.",
  },
  {
    key: "why",
    thread: "Why",
    eyebrow: "Chapter one · the heart",
    title: "Let's start with ⟪why.⟫",
    lead: "Before anything practical — what is this space for, and who is it for? Say it plainly. This is what people read first.",
  },
  {
    key: "who",
    thread: "Who",
    eyebrow: "Chapter two · the people",
    title: "Who are you ⟪gathering?⟫",
    lead: "The people this space is meant to hold. Be specific and be welcoming — this helps the right people know it's for them.",
  },
  {
    key: "safety",
    thread: "Safety",
    eyebrow: "Chapter three · the door",
    title: "Who can ⟪find⟫ this space?",
    lead: "The most important choice you'll make. It decides who can see the community, and how someone gets in. You can change it later.",
  },
  {
    key: "running",
    thread: "Running",
    eyebrow: "Chapter four · the hands",
    title: "Who ⟪holds the keys?⟫",
    lead: "Most spaces run better with more than one pair of hands. Add co-stewards, and choose what the community can do.",
  },
  {
    key: "tone",
    thread: "Tone",
    eyebrow: "Chapter five · the culture",
    title: "Set ⟪the tone.⟫",
    lead: "Every space has a culture. Here's a short covenant to start from — keep what fits, add your own words.",
  },
  {
    key: "feeling",
    thread: "Feeling",
    eyebrow: "Chapter six · the feel",
    title: "Give it ⟪a feeling.⟫",
    lead: "A colour and a line that capture the heart of the place. Small touches, but they're what make it feel like somewhere.",
  },
  {
    key: "people",
    thread: "People",
    eyebrow: "Chapter seven · the first few",
    title: "Don't open to ⟪an empty room.⟫",
    lead: "A space feels alive when someone's already there. Invite a few people you'd love to see in the doorway on day one.",
  },
  {
    key: "confirm",
    thread: "Confirm",
    eyebrow: "The last step",
    title: "Ready to ⟪open the doors?⟫",
    lead: "Here's the whole space, in one glance. Nothing here is fixed — you can change all of it once you're inside.",
  },
];

/* ---------- Category options ---------- */

export interface CategoryOption {
  type: CommunityType;
  label: string;
  typeLabel: string;
}
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { type: "social", label: "Social", typeLabel: "Social club" },
  { type: "arts", label: "Arts & culture", typeLabel: "Arts collective" },
  { type: "activism", label: "Activism", typeLabel: "Activist group" },
  { type: "support", label: "Support", typeLabel: "Support circle" },
  { type: "sports", label: "Sports & movement", typeLabel: "Sports team" },
  {
    type: "professional",
    label: "Professional",
    typeLabel: "Professional network",
  },
];

export function typeLabelFor(type: CommunityType | ""): string {
  return (
    CATEGORY_OPTIONS.find((c) => c.type === type)?.typeLabel ?? "Community"
  );
}

/* ---------- Access tiers ---------- */

export interface AccessOption {
  tier: AccessTier;
  name: string;
  find: string;
  join: string;
  note: string;
  private?: boolean;
}
export const ACCESS_OPTIONS: AccessOption[] = [
  {
    tier: "public",
    name: "Open to all",
    find: "Anyone on QueerPulse can find it in Discover.",
    join: "They join instantly and are in.",
    note: "Best for social clubs, sports, and anything that grows by word of mouth.",
  },
  {
    tier: "request",
    name: "Request to join",
    find: "Listed in Discover, so people can find it.",
    join: "They send a request; you or a co-steward let them in.",
    note: "A gentle gate. Good when you want to say hello before someone's inside.",
  },
  {
    tier: "invite",
    name: "Invite only",
    find: "Listed, but the door needs a code or an invite link.",
    join: "Only people you've invited can get in.",
    note: "For tighter circles that still want to be visible.",
  },
  {
    tier: "private",
    name: "Private & unlisted",
    find: "Hidden from Discover entirely. Members share it person to person.",
    join: "Invite only, and no one outside can see it exists.",
    note: "For spaces where being found is itself a risk — coming-out groups, survivors, people not yet out.",
    private: true,
  },
];

/* ---------- Features ---------- */

export interface FeatureOption {
  id: string;
  label: string;
  desc: string;
  locked?: boolean;
}
export const FEATURE_OPTIONS: FeatureOption[] = [
  {
    id: "discussion",
    label: "Discussion",
    desc: "A shared board for threads.",
    locked: true,
  },
  { id: "events", label: "Events", desc: "Gatherings and a calendar." },
  { id: "rooms", label: "Rooms", desc: "Sub-channels for topics." },
  {
    id: "roster",
    label: "Member roster",
    desc: "A visible list of who's here.",
  },
  { id: "library", label: "Resources", desc: "Shared files and links." },
];

/* ---------- Covenant rule presets ---------- */

export const RULE_PRESETS: string[] = [
  "Treat everyone with warmth and respect — no bigotry, ever.",
  "What's shared here stays here. No screenshots, no outing.",
  "Consent first. Ask before photos, tags, or intros.",
  "Newcomers get a welcome, not a test.",
];

/** The enforcement ladder, shown as static context on the Tone chapter. */
export interface LadderStep {
  title: string;
  desc: string;
}
export const ENFORCEMENT_LADDER: LadderStep[] = [
  { title: "A quiet word", desc: "A steward reaches out privately first." },
  {
    title: "A visible reminder",
    desc: "The covenant is restated to the group.",
  },
  {
    title: "A pause or a goodbye",
    desc: "Repeat harm means time out, or out.",
  },
];

/* ---------- Tints ---------- */

export interface TintOption {
  key: TintKey;
  label: string;
}
export const TINT_OPTIONS: TintOption[] = [
  { key: "coral", label: "Warm coral" },
  { key: "jade", label: "Calm jade" },
  { key: "plum", label: "Deep plum" },
];

/* ---------- Invite-seed candidates ---------- */

export const INVITE_CANDIDATES: Steward[] = [
  {
    key: "sofia",
    name: "Sofia Almeida",
    initials: "SA",
    tint: "jade",
    role: "mod",
  },
  { key: "rui", name: "Rui Mendes", initials: "RM", tint: "plum", role: "mod" },
  {
    key: "tomas",
    name: "Tomás Brito",
    initials: "TB",
    tint: "coral",
    role: "mod",
  },
  {
    key: "ana",
    name: "Ana Quintela",
    initials: "AQ",
    tint: "jade",
    role: "mod",
  },
  {
    key: "camila",
    name: "Camila Nunes",
    initials: "CN",
    tint: "coral",
    role: "mod",
  },
  {
    key: "bea",
    name: "Beatriz Pinto",
    initials: "BP",
    tint: "plum",
    role: "mod",
  },
];

/* ---------- Helpers ---------- */

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "your-community"
  );
}

export function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "•"
  );
}

/** Build a reference like QP-C-0003 from a numeric seed. */
export function makeRef(seq: number): string {
  return `QP-C-${String(seq).padStart(4, "0")}`;
}

/** Avatar tint fallback (Community/Member tint union is a superset of ours). */
export function toAvatarTint(t: TintKey): AvatarTint {
  return t as AvatarTint;
}
