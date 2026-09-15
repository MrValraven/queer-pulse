import { useCallback, useMemo } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { NEW_THREAD_DRAFT_ID } from "../api/forumDrafts.api";
import { useForumComposerDraft } from "../useForumComposerDraft";
import { type ForumThreadDraftSnapshot } from "../forumDraftSnapshot";
import {
  type CloseAfter,
  type ComposePhoto,
  type PollCloses,
  type PostKind,
  type PostLanguage,
} from "./composeThread.types";
import { COMPOSE_CATEGORY_IDS } from "./composeCategories.data";
import { CONTENT_WARNING_IDS } from "./composeWarnings.data";
import { NEIGHBOURHOOD_IDS } from "./composeNeighbourhoods.data";
import type { ComposePhotosController } from "./useComposePhotos";
import type {
  ComposeThreadCoreState,
  ComposeThreadSetters,
} from "./useComposeThreadState";

// ── Autosave for the full page ──────────────────────────────────────────────
// The same `/me/drafts` row the modal wrote, through the same
// `useForumComposerDraft`, carrying the same `ForumThreadDraftSnapshot` shape.
// The only thing that changed is how much of it the page fills in: the modal
// kept five fields, this keeps eighteen. `FORUM_DRAFT_SNAPSHOT_VERSION` is
// bumped for exactly that, so a version-1 payload is discarded rather than
// half-understood.

const KINDS: readonly string[] = ["question", "guide", "proposal", "share"];
const LANGUAGES: readonly string[] = ["auto", "pt", "en", "both"];
const CLOSE_AFTERS: readonly string[] = ["never", "2w", "30d", "90d", "poll"];
const POLL_CLOSES: readonly string[] = ["never", "3d", "1w", "2w"];

/**
 * Whether a stored preview URL still renders.
 *
 * A staged photo's preview is a `blob:` URL, scoped to the document that made
 * it: it survives leaving and returning to the page within a session, and dies
 * on a reload. Nothing in the frontend turns a storage key back into a
 * fetchable URL, so a dead preview cannot be re-derived. Probing it is how the
 * composer tells the two cases apart without rendering a broken image, and it
 * is the same probe the modal composer ran for its single photo, before this
 * page replaced it.
 */
function canRenderImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = url;
  });
}

export interface ComposeThreadPageDraftOptions {
  core: ComposeThreadCoreState;
  setters: ComposeThreadSetters;
  photos: ComposePhotosController;
}

export function useComposeThreadPageDraft({
  core,
  setters,
  photos,
}: ComposeThreadPageDraftOptions) {
  const { t } = useTranslation();
  const stagedPhotos = photos.photos;
  const { mergeRestored } = setters;
  const { restoreIfEmpty } = photos;

  const snapshot = useMemo<ForumThreadDraftSnapshot>(
    () => toSnapshot(core, stagedPhotos),
    [core, stagedPhotos],
  );

  const onRestoreSnapshot = useCallback(
    (stored: ForumThreadDraftSnapshot) => {
      mergeRestored((current) => mergeSnapshot(current, stored));
      void restorePhotos(stored).then((restored) => {
        // `restoreIfEmpty` is what makes this safe: this lands long after the
        // probe, by which time the member may already have picked a photo.
        if (restored.length) restoreIfEmpty(restored);
      });
    },
    [mergeRestored, restoreIfEmpty],
  );

  return useForumComposerDraft({
    draftId: NEW_THREAD_DRAFT_ID,
    body: core.body,
    onRestore: setters.setBody,
    title: core.title,
    // The drafts list's "Resume" lands on the composer itself now that it is
    // a page of its own.
    href: routes.forumNew,
    kind: t("forum:draft.threadKind"),
    fallbackTitle: t("forum:draft.untitledThreadTitle"),
    snapshot,
    onRestoreSnapshot,
  });
}

/** The composer's fields as the flat, scalar snapshot the draft row stores. */
function toSnapshot(
  core: ComposeThreadCoreState,
  stagedPhotos: readonly ComposePhoto[],
): ForumThreadDraftSnapshot {
  return {
    title: core.title,
    category: core.category ?? "",
    communitySlug: core.communitySlug,
    tags: core.tags,
    // The single-photo fields the modal composer writes. The page stores its
    // whole set in `photoKeys`, and mirrors the FIRST one here so a draft
    // begun on this page still reopens with a photo in a composer that only
    // understands one.
    imageKey: stagedPhotos[0]?.key ?? null,
    imagePreviewUrl: stagedPhotos[0]?.previewUrl ?? null,
    kind: core.kind,
    crossPost: core.crossPost,
    isOfficial: core.isOfficial,
    isAnonymous: core.isAnonymous,
    coAuthorSlug: core.coAuthorSlug,
    contentWarnings: core.contentWarnings,
    language: core.language,
    neighbourhood: core.neighbourhood,
    closeAfter: core.closeAfter,
    photoKeys: stagedPhotos.map((photo) => photo.key),
    photoPreviewUrls: stagedPhotos.map((photo) => photo.previewUrl),
    photoAlts: stagedPhotos.map((photo) => photo.alt),
    pollOptions: core.poll ? core.poll.options : null,
    pollAllowMultiple: core.poll?.allowMultiple ?? false,
    pollCloses: core.poll?.closes ?? "never",
  };
}

/**
 * Applies a stored draft field by field, and only where the composer is still
 * untouched. A deep link that seeded the page (a topic's "Write a post" CTA,
 * the first-post prompt's starter title) keeps what it seeded.
 *
 * Every stored value is checked against the CURRENT catalogs on the way in: a
 * category, warning or neighbourhood that has since been renamed is dropped
 * rather than selecting something the grid cannot show.
 */
function mergeSnapshot(
  current: ComposeThreadCoreState,
  stored: ForumThreadDraftSnapshot,
): ComposeThreadCoreState {
  const storedKind = pick(stored.kind, KINDS) as PostKind | null;
  return {
    ...current,
    title: current.title.trim() ? current.title : stored.title,
    category:
      current.category ??
      (COMPOSE_CATEGORY_IDS.includes(stored.category) ? stored.category : null),
    communitySlug: current.communitySlug || stored.communitySlug,
    tags: current.tags.length ? current.tags : stored.tags,
    kind: current.kind ?? storedKind,
    crossPost: current.crossPost || (stored.crossPost ?? false),
    isOfficial: current.isOfficial || (stored.isOfficial ?? false),
    isAnonymous: current.isAnonymous || (stored.isAnonymous ?? false),
    coAuthorSlug: current.coAuthorSlug ?? stored.coAuthorSlug ?? null,
    contentWarnings: current.contentWarnings.length
      ? current.contentWarnings
      : (stored.contentWarnings ?? []).filter((warning) =>
          CONTENT_WARNING_IDS.includes(warning),
        ),
    language:
      current.language === "auto"
        ? ((pick(stored.language, LANGUAGES) as PostLanguage | null) ?? "auto")
        : current.language,
    neighbourhood:
      current.neighbourhood ??
      (stored.neighbourhood && NEIGHBOURHOOD_IDS.includes(stored.neighbourhood)
        ? stored.neighbourhood
        : null),
    closeAfter:
      current.closeAfter === "never"
        ? ((pick(stored.closeAfter, CLOSE_AFTERS) as CloseAfter | null) ??
          "never")
        : current.closeAfter,
    poll:
      current.poll ??
      (stored.pollOptions
        ? {
            options: stored.pollOptions,
            allowMultiple: stored.pollAllowMultiple ?? false,
            closes:
              (pick(stored.pollCloses, POLL_CLOSES) as PollCloses | null) ??
              "never",
          }
        : null),
  };
}

/** A stored value that is still one of the values this build understands. */
function pick(
  value: string | null | undefined,
  allowed: readonly string[],
): string | null {
  return value && allowed.includes(value) ? value : null;
}

/**
 * The stored photos whose previews still render, in order.
 *
 * A photo the member cannot see is a photo they cannot check before
 * publishing, so an unrenderable preview drops the attachment rather than
 * carrying a key they would publish blind. The next autosave writes the
 * snapshot back without it.
 */
async function restorePhotos(
  stored: ForumThreadDraftSnapshot,
): Promise<ComposePhoto[]> {
  const keys = stored.photoKeys ?? [];
  const previewUrls = stored.photoPreviewUrls ?? [];
  const alts = stored.photoAlts ?? [];
  // Read only as far as the shortest array: a truncated write costs a photo
  // rather than pairing one photo with another's description.
  const count = Math.min(keys.length, previewUrls.length);
  const candidates = Array.from({ length: count }, (_entry, index) => ({
    key: keys[index] as string,
    previewUrl: previewUrls[index] as string,
    alt: alts[index] ?? "",
  }));
  const renderable = await Promise.all(
    candidates.map((photo) => canRenderImage(photo.previewUrl)),
  );
  return candidates.filter((_photo, index) => renderable[index]);
}
