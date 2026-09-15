import type { IconType } from "react-icons";
import { FiHelpCircle, FiBookOpen, FiShare2 } from "react-icons/fi";
import { LuMegaphone } from "react-icons/lu";
import type { PostKind } from "./composeThread.types";

// ── The four kinds of post ───────────────────────────────────────────────────
// Picking a kind is the first thing the page asks for, because it changes four
// things at once: what the title field asks for, what the body field asks for,
// the tip under the chips, and the outline the "Start from an outline" pill
// drops into an empty body.
//
// Same i18n Pattern A the rest of the forum uses: `id` is the canonical value
// the state, the draft and the publish call all carry, and never translated;
// every word a member reads is a catalog key.

export interface ComposeKind {
  id: PostKind;
  icon: IconType;
  /** The chip's own label. */
  nameKey: string;
  /** What the title field asks for while this kind is chosen. */
  titlePlaceholderKey: string;
  /** What the body field asks for while this kind is chosen. */
  bodyPlaceholderKey: string;
  /** The line under the kind chips, explaining what this kind is good at. */
  tipKey: string;
  /**
   * The outline dropped into an empty body, or null for a kind that wants no
   * scaffold. The catalog value carries real newlines and `**Heading**`
   * markers, which is exactly what the body field stores.
   */
  scaffoldKey: string | null;
}

export const COMPOSE_KINDS: readonly ComposeKind[] = [
  {
    id: "question",
    icon: FiHelpCircle,
    nameKey: "forum:composePage.kind.question.name",
    titlePlaceholderKey: "forum:composePage.kind.question.titlePlaceholder",
    bodyPlaceholderKey: "forum:composePage.kind.question.bodyPlaceholder",
    tipKey: "forum:composePage.kind.question.tip",
    scaffoldKey: "forum:composePage.kind.question.scaffold",
  },
  {
    id: "guide",
    icon: FiBookOpen,
    nameKey: "forum:composePage.kind.guide.name",
    titlePlaceholderKey: "forum:composePage.kind.guide.titlePlaceholder",
    bodyPlaceholderKey: "forum:composePage.kind.guide.bodyPlaceholder",
    tipKey: "forum:composePage.kind.guide.tip",
    scaffoldKey: "forum:composePage.kind.guide.scaffold",
  },
  {
    id: "proposal",
    icon: LuMegaphone,
    nameKey: "forum:composePage.kind.proposal.name",
    titlePlaceholderKey: "forum:composePage.kind.proposal.titlePlaceholder",
    bodyPlaceholderKey: "forum:composePage.kind.proposal.bodyPlaceholder",
    tipKey: "forum:composePage.kind.proposal.tip",
    scaffoldKey: "forum:composePage.kind.proposal.scaffold",
  },
  {
    id: "share",
    icon: FiShare2,
    nameKey: "forum:composePage.kind.share.name",
    titlePlaceholderKey: "forum:composePage.kind.share.titlePlaceholder",
    bodyPlaceholderKey: "forum:composePage.kind.share.bodyPlaceholder",
    tipKey: "forum:composePage.kind.share.tip",
    // A share is a link, a photo, a thing somebody noticed. An outline would
    // be in the way.
    scaffoldKey: null,
  },
];

/** The kind's whole definition, or undefined before one is picked. */
export function composeKindById(
  kind: PostKind | null,
): ComposeKind | undefined {
  if (!kind) return undefined;
  return COMPOSE_KINDS.find((entry) => entry.id === kind);
}

/**
 * The category a kind files itself under, applied only while the member has
 * chosen none. Two of the four have an obvious home and the other two do not,
 * so this is a partial map rather than a full one.
 */
export const KIND_DEFAULT_CATEGORY: Partial<Record<PostKind, string>> = {
  guide: "guides",
  proposal: "activism",
};

/** The placeholders and tip shown before a kind is picked. */
export const COMPOSE_KIND_FALLBACK = {
  titlePlaceholderKey: "forum:composePage.kind.none.titlePlaceholder",
  bodyPlaceholderKey: "forum:composePage.kind.none.bodyPlaceholder",
  tipKey: "forum:composePage.kind.none.tip",
} as const;
