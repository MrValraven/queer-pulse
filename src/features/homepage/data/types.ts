import type { IconType } from "react-icons";
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
}

/** Warm (belonging/build) vs. safe (heavier safety/rights) styling. */
export type BuiltStepTone = "warm" | "safe";

/**
 * One illustrative voice in a step's conversation. The lines are written by us;
 * the faces are the showcase's DEMO personas (see `voice()` in
 * `data/painPoints.ts`), never the real people in `realMembers.ts`, and the
 * card says under the thread that the exchange is illustrative.
 */
export interface BuiltVoice {
  name: string;
  initials: string;
  tint: AvatarTint;
  photo?: string;
}

/**
 * One thing we built, shown as an icon on the "why we built this" card and
 * unfolding as a short conversation: two voices naming the gap, our answer,
 * then the first voice on what changed.
 *
 * i18n Pattern A. All copy here is platform-authored marketing chrome (a
 * rhetorical "overheard community question" + our answer), identical in demo
 * and live mode, so every field holds a catalog key rather than a literal
 * string. `headingKey` carries the prefix + coral-italic accent + optional
 * suffix as one rich-text catalog entry (`<Translation components={{ em:
 * <em /> }} />`), mirroring the `<em>` idiom used elsewhere instead of three
 * separate keys.
 */
export interface BuiltStep {
  key: string;
  /** react-icons component naming the step on the rail / tile. */
  icon: IconType;
  /** Short rail label ("The vouch network"). */
  labelKey: string;
  /** Opens the conversation and comes back at the end with the payoff. */
  firstVoice: BuiltVoice;
  /** Answers the first voice, naming the same gap from another angle. */
  secondVoice: BuiltVoice;
  /** The overheard community question, from `firstVoice`. */
  questionKey: string;
  /** The second voice picking the question up. */
  question2Key: string;
  /** Rich-text heading: prefix + `<em>accent</em>` + optional suffix. */
  headingKey: string;
  bodyKey: string;
  /** `firstVoice` again, weeks later, on what having this changed. */
  payoffKey: string;
  /** `secondVoice` closing the thread. */
  payoff2Key: string;
  ctaLabelKey: string;
  href: string;
  tone: BuiltStepTone;
  /**
   * False while the thing itself is still being built (Skill swaps, Cinema,
   * Studio). The rail greys the row and marks it "Soon", so the board never
   * shows a launched pillar and an unbuilt one in the same colour. The step's
   * own copy says the same thing in words, since colour alone must not carry
   * it.
   */
  isLaunched: boolean;
}

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

/**
 * Cross-feature domain types now live in the shared layer; re-exported here so
 * the ~19 existing importers (communities/members/auth/feed) keep working. New
 * code should import these from `src/shared/types/domain` directly.
 */
export type { Community, CommunityType } from "../../../shared/types/domain";
