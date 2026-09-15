import { useCallback, useMemo, useState } from "react";
import type { ForumDraftStatus } from "../useForumComposerDraft";
import {
  COMPOSE_BODY_READY_LENGTH,
  COMPOSE_TITLE_READY_LENGTH,
  type ComposeAudience,
  type ComposeBlocker,
  type ComposeChecklistItem,
  type ComposeNudge,
  type ComposeThreadState,
} from "./composeThread.types";
import { TAG_SUGGESTIONS } from "./composeCategories.data";
import {
  buildComposeChecklist,
  composeTitleTip,
  suggestedCategoryFor,
  suggestedTagsFor,
  type ComposeTitleTip,
} from "./composeChecklist";
import { composeBlockers } from "./composeBlockers";
import { composeNudges } from "./composeNudges";
import { countWords, toPlainText } from "./composeText";
import {
  useComposePhotos,
  type ComposePhotosController,
} from "./useComposePhotos";
import {
  useComposeThreadState,
  type ComposeThreadSetters,
} from "./useComposeThreadState";
import { useComposeThreadPageDraft } from "./useComposeThreadPageDraft";
import {
  useSimilarThreads,
  type SimilarThreadsResult,
} from "./useSimilarThreads";

// ── The one hook `/forum/new` uses ──────────────────────────────────────────
// It composes four smaller ones (state, photos, autosave, similar threads) and
// derives everything the page renders around them. Deliberately the ONLY thing
// the page component talks to: the page is a large tree of sections, and every
// one of them reading its own hook is how a composer ends up with four
// disagreeing copies of "can this publish yet".

export interface UseComposeThreadPageOptions {
  /**
   * Where this member may post, town square excluded (the town square is the
   * empty slug and needs no entry). Used to resolve the selected audience for
   * the private-community nudge and the rail's audience line.
   */
  communities?: readonly ComposeAudience[];
  /** Seeds the title, from the first-post prompt's starter chips. */
  initialTitle?: string;
  /** Seeds the tags, from a topic page's "Write a post" CTA. */
  initialTags?: readonly string[];
  /** Seeds the audience, from a community's own "Post here" CTA. */
  initialCommunitySlug?: string;
}

export interface ComposeThreadPage {
  /** The whole draft, photos folded in. What the publish call reads. */
  state: ComposeThreadState;
  setters: ComposeThreadSetters;
  photos: ComposePhotosController;
  /** The audience the post is going to, or null for the town square. */
  community: ComposeAudience | null;
  checklist: ComposeChecklistItem[];
  titleTip: ComposeTitleTip;
  /** Words of prose in the body, markdown-lite markers excluded. */
  wordCount: number;
  /** The category the draft sounds like, or null. */
  suggestedCategory: string | null;
  /** Tag chips worth offering right now. */
  suggestedTags: string[];
  nudges: ComposeNudge[];
  blockers: ComposeBlocker[];
  /** True when the three required rows are ticked and nothing blocks. */
  canPublish: boolean;
  similar: SimilarThreadsResult;
  /** Hides one dismissible nudge. The crisis row comes back on new matching
   *  text, because its dismissal is keyed on the wording that raised it. */
  dismissNudge: (nudge: ComposeNudge) => void;
  /** Ticks the doxxing nudge's acknowledgement, which clears its blocker. */
  setDoxxingAcknowledged: (isAcknowledged: boolean) => void;
  isDoxxingAcknowledged: boolean;
  /** What the footer says about the autosave. */
  draftStatus: ForumDraftStatus;
  /** Discards the draft. Call once the post it holds has really published. */
  clearDraft: () => Promise<void>;
}

export function useComposeThreadPage(
  options: UseComposeThreadPageOptions = {},
): ComposeThreadPage {
  const {
    communities = [],
    initialTitle,
    initialTags,
    initialCommunitySlug,
  } = options;

  const { core, setters } = useComposeThreadState(
    useMemo(
      () => ({
        ...(initialTitle ? { title: initialTitle } : {}),
        ...(initialTags?.length ? { tags: [...initialTags] } : {}),
        ...(initialCommunitySlug
          ? { communitySlug: initialCommunitySlug }
          : {}),
      }),
      [initialTitle, initialTags, initialCommunitySlug],
    ),
  );
  const photos = useComposePhotos();
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);
  const [isDoxxingAcknowledged, setDoxxingAcknowledged] = useState(false);

  const { status: draftStatus, clearDraft } = useComposeThreadPageDraft({
    core,
    setters,
    photos,
  });

  const state = useMemo<ComposeThreadState>(
    () => ({ ...core, photos: photos.photos }),
    [core, photos.photos],
  );

  const community = useMemo(
    () =>
      core.communitySlug
        ? (communities.find(
            (candidate) => candidate.slug === core.communitySlug,
          ) ?? null)
        : null,
    [communities, core.communitySlug],
  );

  const similar = useSimilarThreads(core.title);

  const derived = useComposeThreadDerived({
    state,
    community,
    dismissedKeys,
    isDoxxingAcknowledged,
    similar,
  });

  const dismissNudge = useCallback((nudge: ComposeNudge) => {
    if (!nudge.isDismissible) return;
    setDismissedKeys((previous) =>
      previous.includes(nudge.dismissKey)
        ? previous
        : [...previous, nudge.dismissKey],
    );
  }, []);

  return {
    state,
    setters,
    photos,
    community,
    similar,
    dismissNudge,
    setDoxxingAcknowledged,
    isDoxxingAcknowledged,
    draftStatus,
    clearDraft,
    ...derived,
  };
}

interface DerivedInput {
  state: ComposeThreadState;
  community: ComposeAudience | null;
  dismissedKeys: readonly string[];
  isDoxxingAcknowledged: boolean;
  similar: SimilarThreadsResult;
}

/**
 * Everything the page reads that is a pure function of the draft. Split out so
 * the hook above stays inside the 200-line budget `max-lines-per-function`
 * enforces, and so each readout memoizes on the narrowest thing it depends on.
 */
function useComposeThreadDerived({
  state,
  community,
  dismissedKeys,
  isDoxxingAcknowledged,
  similar,
}: DerivedInput) {
  const plainBody = useMemo(() => toPlainText(state.body), [state.body]);

  const checklist = useMemo(
    () => buildComposeChecklist(state, plainBody),
    [state, plainBody],
  );

  const nudges = useMemo(
    () => composeNudges({ state, community, dismissedKeys }),
    [state, community, dismissedKeys],
  );

  const blockers = useMemo(
    () =>
      composeBlockers({
        state,
        isDuplicateTitle: similar.isDuplicate,
        duplicateTitle: similar.duplicateTitle,
        isDoxxingAcknowledged,
      }),
    [state, similar.isDuplicate, similar.duplicateTitle, isDoxxingAcknowledged],
  );

  const canPublish =
    state.title.trim().length >= COMPOSE_TITLE_READY_LENGTH &&
    plainBody.length >= COMPOSE_BODY_READY_LENGTH &&
    !!state.category &&
    blockers.length === 0;

  return {
    checklist,
    titleTip: composeTitleTip(state.title, state.kind),
    wordCount: countWords(plainBody),
    suggestedCategory: suggestedCategoryFor(state),
    suggestedTags: suggestedTagsFor(state, TAG_SUGGESTIONS),
    nudges,
    blockers,
    canPublish,
  };
}
