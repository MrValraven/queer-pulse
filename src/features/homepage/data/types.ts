import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { VisibilityMode } from "../../../shared/components/ui/VisibilityBadge";

export type MemberCategory =
  "design" | "tech" | "film" | "music" | "food" | "craft" | "care";

export interface Member {
  key: string;
  name: string;
  role: string;
  hood: string;
  category: MemberCategory;
  tags: string[];
  verified: boolean;
  visibility: VisibilityMode;
  initials: string;
  tint: AvatarTint;
  /** Profile photo URL; falls back to initials when absent. */
  photo?: string;
  vouchedBy: string;
}

export interface Gathering {
  id: string;
  day: string;
  month: string;
  type: string;
  title: string;
  hood: string;
  detail: string;
  /** i18n Pattern A — "seats left" / "going" / "spots left" / "Casual" chrome. */
  spotsLabelKey: string;
  spotsValue?: string;
  /** i18n Pattern A — "Reserve a seat" / "I'll be there" / etc. chrome. */
  ctaLabelKey: string;
}

/** Warm (belonging/build) vs. safe (heavier safety/rights) styling. */
export type GapTone = "warm" | "safe";

/**
 * i18n Pattern A. All copy here is platform-authored marketing chrome
 * (rhetorical "overheard community question" + answer), identical in demo and
 * live mode, so every field holds a catalog key rather than a literal string.
 * `headingKey` carries the prefix + coral-italic accent + optional suffix as
 * one rich-text catalog entry (`<Translation components={{ em: <em /> }} />`),
 * mirroring the `<em>` idiom used elsewhere instead of three separate keys.
 */
interface GapAnswer {
  /** The overheard community question. */
  questionKey: string;
  /** Rich-text heading: prefix + `<em>accent</em>` + optional suffix. */
  headingKey: string;
  bodyKey: string;
  ctaLabelKey: string;
  href: string;
}

/** A full-width plum hero panel that interrupts the thread at a pivotal beat. */
export interface GapHero extends GapAnswer {
  kind: "hero";
  /** Small uppercase label above the question ("The gap we felt first"). */
  eyebrowKey: string;
  /** Jade "we built this" beat ("So we built the network"). */
  builtLabelKey: string;
}

/** A light conversational exchange row, alternating down the central line. */
export interface GapExchange extends GapAnswer {
  kind: "exchange";
  tone: GapTone;
}

/** A small serif "chapter" label between beats. */
export interface GapMarker {
  kind: "marker";
  labelKey: string;
}

export type GapThreadItem = GapHero | GapExchange | GapMarker;

export interface StoryFeature {
  category: string;
  title: string;
  excerpt: string;
  bylineInitials: string;
  byline: string;
  href: string;
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export interface StoryCard {
  category: string;
  title: string;
  bylineInitials: string;
  byline: string;
  href: string;
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export interface ChangeMaker {
  key: string;
  cause: string;
  name: string;
  blurb: string;
  tags: string[];
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export type CommunityType =
  "social" | "arts" | "activism" | "support" | "sports" | "professional";

export interface Community {
  href: string;
  type: CommunityType;
  typeLabel: string;
  name: string;
  description: string;
  count: string;
  joinLabel: string;
  dashed?: boolean;
  privateBadge?: boolean;
  /** Stable slug for the community detail route (`/community/:slug`). */
  slug?: string;
}

export interface DigestPreviewItem {
  tag: string;
  title: string;
  meta: string;
}
