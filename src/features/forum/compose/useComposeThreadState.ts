import { useCallback, useMemo, useState } from "react";
import {
  COMPOSE_POLL_MAX_OPTIONS,
  COMPOSE_POLL_MIN_OPTIONS,
  COMPOSE_TAG_LIMIT,
  COMPOSE_TITLE_MAX_LENGTH,
  EMPTY_COMPOSE_THREAD_STATE,
  type CloseAfter,
  type ComposePoll,
  type ComposeThreadState,
  type PollCloses,
  type PostKind,
  type PostLanguage,
} from "./composeThread.types";
import {
  ANONYMOUS_CATEGORIES,
  CLOSE_AFTER_CATEGORIES,
  NEIGHBOURHOOD_CATEGORIES,
} from "./composeCategories.data";
import { KIND_DEFAULT_CATEGORY } from "./composeKinds.data";

// ── The composer's fields, and the one way to change each of them ───────────
// Photos are the one field NOT held here: they carry an upload in flight, an
// error line and a file input, so they live in `useComposePhotos` and are
// folded back in by `useComposeThreadPage`.
//
// Three of the optional detail fields are offered only for certain categories
// (see `composeCategories.data.ts`). Clearing them lives in `setCategory`
// rather than in the component that renders the row, so a field the member can
// no longer see can never still be riding along on publish.

/** Everything the composer holds except the photos. */
export type ComposeThreadCoreState = Omit<ComposeThreadState, "photos">;

/** The tag characters a thread is filed under. */
const TAG_ALLOWED = /[^a-z0-9à-ú-]/g;

/** Longest a single tag may be. */
const TAG_MAX_LENGTH = 24;

/** Turns whatever the member typed into a tag, or "" when nothing survives. */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(TAG_ALLOWED, "")
    .slice(0, TAG_MAX_LENGTH);
}

/** A fresh poll: two blank rows, which is what the member fills in. */
export function emptyPoll(): ComposePoll {
  return {
    options: Array.from({ length: COMPOSE_POLL_MIN_OPTIONS }, () => ""),
    allowMultiple: false,
    closes: "never",
  };
}

export interface ComposeThreadSetters {
  setKind: (kind: PostKind | null) => void;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setCategory: (category: string | null) => void;
  setCommunitySlug: (communitySlug: string) => void;
  setCrossPost: (crossPost: boolean) => void;
  setTags: (tags: string[]) => void;
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
  setIsOfficial: (isOfficial: boolean) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setCoAuthorSlug: (coAuthorSlug: string | null) => void;
  setContentWarnings: (contentWarnings: string[]) => void;
  toggleContentWarning: (id: string) => void;
  setPoll: (poll: ComposePoll | null) => void;
  setPollOption: (index: number, option: string) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
  setPollAllowMultiple: (allowMultiple: boolean) => void;
  setPollCloses: (closes: PollCloses) => void;
  setLanguage: (language: PostLanguage) => void;
  setNeighbourhood: (neighbourhood: string | null) => void;
  setCloseAfter: (closeAfter: CloseAfter) => void;
  /** Merges a restored draft in, applying each field only where the composer
   *  is still untouched. */
  mergeRestored: (
    merge: (current: ComposeThreadCoreState) => ComposeThreadCoreState,
  ) => void;
  /** Back to an empty composer, after a publish or a "start fresh". */
  reset: () => void;
}

export function useComposeThreadState(
  initial?: Partial<ComposeThreadCoreState>,
): { core: ComposeThreadCoreState; setters: ComposeThreadSetters } {
  const [core, setCore] = useState<ComposeThreadCoreState>(() => ({
    ...toCoreState(EMPTY_COMPOSE_THREAD_STATE),
    ...initial,
  }));

  const update = useCallback(
    (patch: (current: ComposeThreadCoreState) => ComposeThreadCoreState) =>
      setCore(patch),
    [],
  );

  const setters = useMemo<ComposeThreadSetters>(
    () => buildSetters(update),
    [update],
  );

  return { core, setters };
}

function toCoreState(state: ComposeThreadState): ComposeThreadCoreState {
  const { photos: _photos, ...core } = state;
  return core;
}

type Update = (
  patch: (current: ComposeThreadCoreState) => ComposeThreadCoreState,
) => void;

function buildSetters(update: Update): ComposeThreadSetters {
  return {
    ...buildFieldSetters(update),
    ...buildTagSetters(update),
    ...buildPollSetters(update),
    mergeRestored: (merge) => update(merge),
    reset: () => update(() => toCoreState(EMPTY_COMPOSE_THREAD_STATE)),
  };
}

function buildFieldSetters(update: Update) {
  return {
    setKind: (kind: PostKind | null) =>
      update((current) => ({
        ...current,
        kind,
        // Two of the four kinds have an obvious home. Applied only while the
        // member has chosen no category of their own.
        category:
          current.category ??
          (kind ? (KIND_DEFAULT_CATEGORY[kind] ?? null) : null),
      })),
    setTitle: (title: string) =>
      update((current) => ({
        ...current,
        title: title.slice(0, COMPOSE_TITLE_MAX_LENGTH),
      })),
    setBody: (body: string) => update((current) => ({ ...current, body })),
    setCategory: (category: string | null) =>
      update((current) => applyCategory(current, category)),
    setCommunitySlug: (communitySlug: string) =>
      update((current) => ({
        ...current,
        communitySlug,
        // Cross-posting is meaningless from the town square, and a stale true
        // would be sent on publish.
        crossPost: communitySlug ? current.crossPost : false,
      })),
    setCrossPost: (crossPost: boolean) =>
      update((current) => ({ ...current, crossPost })),
    setIsOfficial: (isOfficial: boolean) =>
      update((current) => ({
        ...current,
        isOfficial,
        // An official post carries the platform's name. Hiding the author
        // behind it at the same time says two contradictory things.
        isAnonymous: isOfficial ? false : current.isAnonymous,
      })),
    setIsAnonymous: (isAnonymous: boolean) =>
      update((current) => ({
        ...current,
        isAnonymous,
        // A credited co-author on an unsigned post names the person the
        // anonymity was meant to cover.
        coAuthorSlug: isAnonymous ? null : current.coAuthorSlug,
      })),
    setCoAuthorSlug: (coAuthorSlug: string | null) =>
      update((current) => ({ ...current, coAuthorSlug })),
    setContentWarnings: (contentWarnings: string[]) =>
      update((current) => ({ ...current, contentWarnings })),
    toggleContentWarning: (id: string) =>
      update((current) => ({
        ...current,
        contentWarnings: current.contentWarnings.includes(id)
          ? current.contentWarnings.filter((warning) => warning !== id)
          : [...current.contentWarnings, id],
      })),
    setLanguage: (language: PostLanguage) =>
      update((current) => ({ ...current, language })),
    setNeighbourhood: (neighbourhood: string | null) =>
      update((current) => ({ ...current, neighbourhood })),
    setCloseAfter: (closeAfter: CloseAfter) =>
      update((current) => ({ ...current, closeAfter })),
  };
}

/**
 * Moving to another category drops the detail fields that category does not
 * offer. Enforced HERE, on the one write path that can invalidate them, so no
 * rendering surface has to remember to do it and none can forget.
 */
function applyCategory(
  current: ComposeThreadCoreState,
  category: string | null,
): ComposeThreadCoreState {
  const offersNeighbourhood =
    !!category && NEIGHBOURHOOD_CATEGORIES.includes(category);
  const offersCloseAfter =
    !!category && CLOSE_AFTER_CATEGORIES.includes(category);
  const offersAnonymous = !!category && ANONYMOUS_CATEGORIES.includes(category);
  return {
    ...current,
    category,
    neighbourhood: offersNeighbourhood ? current.neighbourhood : null,
    // A poll-tied close survives, because it belongs to the poll rather than
    // to the category.
    closeAfter:
      offersCloseAfter || current.closeAfter === "poll"
        ? current.closeAfter
        : "never",
    isAnonymous: offersAnonymous ? current.isAnonymous : false,
  };
}

function buildTagSetters(update: Update) {
  return {
    setTags: (tags: string[]) => update((current) => ({ ...current, tags })),
    addTag: (raw: string) =>
      update((current) => {
        const tag = normalizeTag(raw);
        if (!tag) return current;
        if (current.tags.includes(tag)) return current;
        if (current.tags.length >= COMPOSE_TAG_LIMIT) return current;
        return { ...current, tags: [...current.tags, tag] };
      }),
    removeTag: (tag: string) =>
      update((current) => ({
        ...current,
        tags: current.tags.filter((entry) => entry !== tag),
      })),
  };
}

function buildPollSetters(update: Update) {
  return {
    setPoll: (poll: ComposePoll | null) =>
      update((current) => ({
        ...current,
        poll,
        // An auto-close tied to a poll that no longer exists would close the
        // thread on a date nothing sets.
        closeAfter:
          !poll && current.closeAfter === "poll" ? "never" : current.closeAfter,
      })),
    setPollOption: (index: number, option: string) =>
      update((current) =>
        current.poll
          ? {
              ...current,
              poll: {
                ...current.poll,
                options: current.poll.options.map((entry, position) =>
                  position === index ? option : entry,
                ),
              },
            }
          : current,
      ),
    addPollOption: () =>
      update((current) =>
        current.poll && current.poll.options.length < COMPOSE_POLL_MAX_OPTIONS
          ? {
              ...current,
              poll: { ...current.poll, options: [...current.poll.options, ""] },
            }
          : current,
      ),
    removePollOption: (index: number) =>
      update((current) =>
        current.poll && current.poll.options.length > COMPOSE_POLL_MIN_OPTIONS
          ? {
              ...current,
              poll: {
                ...current.poll,
                options: current.poll.options.filter(
                  (_option, position) => position !== index,
                ),
              },
            }
          : current,
      ),
    setPollAllowMultiple: (allowMultiple: boolean) =>
      update((current) =>
        current.poll
          ? { ...current, poll: { ...current.poll, allowMultiple } }
          : current,
      ),
    setPollCloses: (closes: PollCloses) =>
      update((current) =>
        current.poll
          ? { ...current, poll: { ...current.poll, closes } }
          : current,
      ),
  };
}
