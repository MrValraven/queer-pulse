import {
  COMPOSE_BODY_READY_LENGTH,
  COMPOSE_TITLE_READY_LENGTH,
  type ComposeChecklistItem,
  type ComposeThreadState,
} from "./composeThread.types";
import { SUGGESTABLE_CATEGORIES } from "./composeCategories.data";

// ── The derived readouts ────────────────────────────────────────────────────
// The rail's "Ready to post" list, the live tip under the title, and the
// "Sounds like Housing" chip. All three are pure functions of the draft, so
// they live beside the state rather than inside the hook: the hook is already
// carrying the state, the autosave, the photos and the similarity search, and
// `max-lines-per-function` is an error at 200.

/** ALL CAPS for long enough that it reads as shouting. */
const SHOUTING_TITLE = /^[A-Z\s!?]{12,}$/;

/** A title that opens by announcing that help is wanted, before saying about
 *  what. Matched in both languages. */
const ASKS_BEFORE_SAYING = /^(help|question|urgent|please|ajuda)\b/i;

/** Under this many characters, "help with…" has still said nothing. */
const ASKS_BEFORE_SAYING_MAX_LENGTH = 20;

/** The live advice under the title field. */
export interface ComposeTitleTip {
  /** Catalog key, or null while the field is empty and has nothing to say. */
  messageKey: string | null;
  /** True when the tip is confirming the title is good, so it can read as a
   *  tick rather than a correction. */
  isPositive: boolean;
}

export function composeTitleTip(
  title: string,
  kind: ComposeThreadState["kind"],
): ComposeTitleTip {
  const trimmed = title.trim();
  if (title.length === 0) return { messageKey: null, isPositive: false };
  if (title.length < COMPOSE_TITLE_READY_LENGTH)
    return {
      messageKey: "forum:composePage.titleTip.keepGoing",
      isPositive: false,
    };
  if (SHOUTING_TITLE.test(trimmed))
    return {
      messageKey: "forum:composePage.titleTip.shouting",
      isPositive: false,
    };
  if (kind === "question" && !trimmed.includes("?"))
    return {
      messageKey: "forum:composePage.titleTip.questionMark",
      isPositive: false,
    };
  if (
    ASKS_BEFORE_SAYING.test(trimmed) &&
    title.length < ASKS_BEFORE_SAYING_MAX_LENGTH
  )
    return {
      messageKey: "forum:composePage.titleTip.sayTheSubject",
      isPositive: false,
    };
  return { messageKey: "forum:composePage.titleTip.clear", isPositive: true };
}

/**
 * The rail's readiness list. Three rows gate publishing; the last two are
 * advice that makes a thread findable, and a member who skips them can still
 * post.
 */
export function buildComposeChecklist(
  state: ComposeThreadState,
  plainBody: string,
): ComposeChecklistItem[] {
  const charactersLeft = Math.max(
    0,
    COMPOSE_BODY_READY_LENGTH - plainBody.length,
  );
  return [
    {
      id: "title",
      labelKey: "forum:composePage.checklist.title",
      isDone: state.title.trim().length >= COMPOSE_TITLE_READY_LENGTH,
      isRequired: true,
    },
    {
      id: "body",
      labelKey: "forum:composePage.checklist.body",
      isDone: plainBody.length >= COMPOSE_BODY_READY_LENGTH,
      isRequired: true,
      // Only once there is something to count down from: "40 more characters"
      // under an untouched field is noise.
      hintKey:
        plainBody.length > 0 && charactersLeft > 0
          ? "forum:composePage.checklist.bodyHint"
          : undefined,
      hintValues:
        plainBody.length > 0 && charactersLeft > 0
          ? { count: charactersLeft }
          : undefined,
    },
    {
      id: "category",
      labelKey: "forum:composePage.checklist.category",
      isDone: !!state.category,
      isRequired: true,
    },
    {
      id: "kind",
      labelKey: "forum:composePage.checklist.kind",
      isDone: !!state.kind,
      isRequired: false,
    },
    {
      id: "tag",
      labelKey: "forum:composePage.checklist.tag",
      isDone: state.tags.length > 0,
      isRequired: false,
    },
  ];
}

/** Below this much text, the keywords are guessing rather than reading. */
const SUGGESTION_MIN_LENGTH = 10;

/**
 * The category the draft sounds like, or null when nothing matches, the draft
 * is still too short to read, or the member has already filed it there.
 * First match in `SUGGESTABLE_CATEGORIES` order wins.
 */
export function suggestedCategoryFor(state: ComposeThreadState): string | null {
  const searched = `${state.title.trim()} ${state.body}`;
  if (searched.trim().length <= SUGGESTION_MIN_LENGTH) return null;
  const match = SUGGESTABLE_CATEGORIES.find((category) =>
    category.keyword.test(searched),
  );
  if (!match || match.id === state.category) return null;
  return match.id;
}

/**
 * Tags worth offering right now: the chosen category's suggestions, plus the
 * kind itself when it names something a reader would browse by. Already-added
 * tags are dropped, and the list is capped at five chips.
 */
export function suggestedTagsFor(
  state: ComposeThreadState,
  tagsByCategory: Record<string, readonly string[]>,
): string[] {
  const fromCategory = state.category
    ? (tagsByCategory[state.category] ?? [])
    : [];
  // "share" is not a tag anybody browses by; the other three are.
  const fromKind = state.kind && state.kind !== "share" ? [state.kind] : [];
  const pool = [...fromCategory, ...fromKind];
  return [...new Set(pool)]
    .filter((tag) => !state.tags.includes(tag))
    .slice(0, 5);
}
