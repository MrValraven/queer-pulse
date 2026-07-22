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
  /** Member slug — set for co-stewards picked from your connections; the owner may omit it. */
  slug?: string;
  name: string;
  initials: string;
  /** Profile photo, when the person has one; falls back to initials. */
  src?: string;
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
  invites: string[]; // member slugs of connections you're inviting
  /** Chapter 8 — confirm */
  handle: string;
  consent: boolean;
}

/** A community founded this session (demo only — see createdCommunities.store.ts). */
export interface CreatedCommunity extends CommunityDraft {
  type: CommunityType;
  accessTier: AccessTier;
  slug: string;
  ref: string; // e.g. QP-C-0003
  ownerSlug: string;
  createdAt: string; // human label, e.g. "just now"
}

/* ---------- Panel metadata ---------- */

/**
 * i18n Pattern A/B hybrid. The rail label/eyebrow/lead resolve as plain `t()`
 * keys; `titleKey` resolves through `t()` too, but the resulting string still
 * carries the source's own `⟪ ⟫` coral-emphasis markers (kept, rather than
 * switched to `<Translation>`'s `<em>` convention, so the catalog value can be
 * split by the existing `renderTitle()` in `StartCommunityChrome.tsx` without
 * a second markup dialect). See `docs/i18n/glossary-pt.md` for the pt-PT copy.
 */
export interface PanelMeta {
  key: string;
  threadKey: string; // short label on the founding-thread rail
  eyebrowKey: string;
  /** Resolves to a string still containing ⟪ ⟫ markers — see note above. */
  titleKey: string;
  leadKey: string;
}

export const PANELS: PanelMeta[] = [
  {
    key: "open",
    threadKey: "communities:start.panel.open.thread",
    eyebrowKey: "communities:start.panel.open.eyebrow",
    titleKey: "communities:start.panel.open.title",
    leadKey: "communities:start.panel.open.lead",
  },
  {
    key: "why",
    threadKey: "communities:start.panel.why.thread",
    eyebrowKey: "communities:start.panel.why.eyebrow",
    titleKey: "communities:start.panel.why.title",
    leadKey: "communities:start.panel.why.lead",
  },
  {
    key: "who",
    threadKey: "communities:start.panel.who.thread",
    eyebrowKey: "communities:start.panel.who.eyebrow",
    titleKey: "communities:start.panel.who.title",
    leadKey: "communities:start.panel.who.lead",
  },
  {
    key: "safety",
    threadKey: "communities:start.panel.safety.thread",
    eyebrowKey: "communities:start.panel.safety.eyebrow",
    titleKey: "communities:start.panel.safety.title",
    leadKey: "communities:start.panel.safety.lead",
  },
  {
    key: "running",
    threadKey: "communities:start.panel.running.thread",
    eyebrowKey: "communities:start.panel.running.eyebrow",
    titleKey: "communities:start.panel.running.title",
    leadKey: "communities:start.panel.running.lead",
  },
  {
    key: "tone",
    threadKey: "communities:start.panel.tone.thread",
    eyebrowKey: "communities:start.panel.tone.eyebrow",
    titleKey: "communities:start.panel.tone.title",
    leadKey: "communities:start.panel.tone.lead",
  },
  {
    key: "feeling",
    threadKey: "communities:start.panel.feeling.thread",
    eyebrowKey: "communities:start.panel.feeling.eyebrow",
    titleKey: "communities:start.panel.feeling.title",
    leadKey: "communities:start.panel.feeling.lead",
  },
  {
    key: "people",
    threadKey: "communities:start.panel.people.thread",
    eyebrowKey: "communities:start.panel.people.eyebrow",
    titleKey: "communities:start.panel.people.title",
    leadKey: "communities:start.panel.people.lead",
  },
  {
    key: "confirm",
    threadKey: "communities:start.panel.confirm.thread",
    eyebrowKey: "communities:start.panel.confirm.eyebrow",
    titleKey: "communities:start.panel.confirm.title",
    leadKey: "communities:start.panel.confirm.lead",
  },
];

/* ---------- Category options ---------- */

/**
 * i18n note: `labelKey`/`badgeKey` are wizard chrome (the "what kind of
 * space?" chip label, and the live-preview/confirm badge) — translated.
 * `typeLabel` is the plain-string field stored on the eventual community
 * record and read verbatim by already-shipped, untranslated consumers
 * (`CommunityCard.tsx`'s `community.typeLabel`, `useAllCommunities.ts`) —
 * kept as-is so a freshly founded community's badge matches every other
 * community's badge rendering.
 */
export interface CategoryOption {
  type: CommunityType;
  labelKey: string;
  badgeKey: string;
  typeLabel: string;
}
export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    type: "social",
    labelKey: "communities:start.category.social.label",
    badgeKey: "communities:start.category.social.badge",
    typeLabel: "Social club",
  },
  {
    type: "arts",
    labelKey: "communities:start.category.arts.label",
    badgeKey: "communities:start.category.arts.badge",
    typeLabel: "Arts collective",
  },
  {
    type: "activism",
    labelKey: "communities:start.category.activism.label",
    badgeKey: "communities:start.category.activism.badge",
    typeLabel: "Activist group",
  },
  {
    type: "support",
    labelKey: "communities:start.category.support.label",
    badgeKey: "communities:start.category.support.badge",
    typeLabel: "Support circle",
  },
  {
    type: "sports",
    labelKey: "communities:start.category.sports.label",
    badgeKey: "communities:start.category.sports.badge",
    typeLabel: "Sports team",
  },
  {
    type: "professional",
    labelKey: "communities:start.category.professional.label",
    badgeKey: "communities:start.category.professional.badge",
    typeLabel: "Professional network",
  },
];

export function typeLabelFor(type: CommunityType | ""): string {
  return (
    CATEGORY_OPTIONS.find((c) => c.type === type)?.typeLabel ?? "Community"
  );
}

/** Chrome counterpart of {@link typeLabelFor}, for the wizard's own preview/
 *  confirm screens (translated), as distinct from the plain-string
 *  `typeLabel` used post-creation. */
export function typeBadgeKeyFor(type: CommunityType | ""): string {
  return (
    CATEGORY_OPTIONS.find((c) => c.type === type)?.badgeKey ??
    "communities:start.category.fallbackBadge"
  );
}

/* ---------- Access tiers ---------- */

export interface AccessOption {
  tier: AccessTier;
  nameKey: string;
  findKey: string;
  joinKey: string;
  noteKey: string;
  private?: boolean;
}
export const ACCESS_OPTIONS: AccessOption[] = [
  {
    tier: "public",
    nameKey: "communities:start.access.public.name",
    findKey: "communities:start.access.public.find",
    joinKey: "communities:start.access.public.join",
    noteKey: "communities:start.access.public.note",
  },
  {
    tier: "request",
    nameKey: "communities:start.access.request.name",
    findKey: "communities:start.access.request.find",
    joinKey: "communities:start.access.request.join",
    noteKey: "communities:start.access.request.note",
  },
  {
    tier: "invite",
    nameKey: "communities:start.access.invite.name",
    findKey: "communities:start.access.invite.find",
    joinKey: "communities:start.access.invite.join",
    noteKey: "communities:start.access.invite.note",
  },
  {
    tier: "private",
    nameKey: "communities:start.access.private.name",
    findKey: "communities:start.access.private.find",
    joinKey: "communities:start.access.private.join",
    noteKey: "communities:start.access.private.note",
    private: true,
  },
];

/* ---------- Features ---------- */

export interface FeatureOption {
  id: string;
  labelKey: string;
  descKey: string;
  locked?: boolean;
}
export const FEATURE_OPTIONS: FeatureOption[] = [
  {
    id: "discussion",
    labelKey: "communities:start.feature.discussion.label",
    descKey: "communities:start.feature.discussion.desc",
    locked: true,
  },
  {
    id: "events",
    labelKey: "communities:start.feature.events.label",
    descKey: "communities:start.feature.events.desc",
  },
  {
    id: "rooms",
    labelKey: "communities:start.feature.rooms.label",
    descKey: "communities:start.feature.rooms.desc",
  },
  {
    id: "roster",
    labelKey: "communities:start.feature.roster.label",
    descKey: "communities:start.feature.roster.desc",
  },
  {
    id: "library",
    labelKey: "communities:start.feature.library.label",
    descKey: "communities:start.feature.library.desc",
  },
];

/* ---------- Covenant rule presets ---------- */

export const RULE_PRESET_KEYS: string[] = [
  "communities:start.rulePreset.warmth",
  "communities:start.rulePreset.confidentiality",
  "communities:start.rulePreset.consent",
  "communities:start.rulePreset.welcome",
];

/** The enforcement ladder, shown as static context on the Tone chapter. */
export interface LadderStep {
  titleKey: string;
  descKey: string;
}
export const ENFORCEMENT_LADDER: LadderStep[] = [
  {
    titleKey: "communities:start.ladder.quietWord.title",
    descKey: "communities:start.ladder.quietWord.desc",
  },
  {
    titleKey: "communities:start.ladder.reminder.title",
    descKey: "communities:start.ladder.reminder.desc",
  },
  {
    titleKey: "communities:start.ladder.pause.title",
    descKey: "communities:start.ladder.pause.desc",
  },
];

/* ---------- Tints ---------- */

export interface TintOption {
  key: TintKey;
  labelKey: string;
}
export const TINT_OPTIONS: TintOption[] = [
  { key: "coral", labelKey: "communities:start.tint.coral" },
  { key: "jade", labelKey: "communities:start.tint.jade" },
  { key: "plum", labelKey: "communities:start.tint.plum" },
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
