import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../../shared/hooks";
import type {
  ArticleBlock,
  ArticleDraftDto,
  UpdateArticleDraftDto,
} from "../../api/pieces.api";
import { snapshotsEqual, type DraftSnapshot } from "./articleDraftSnapshot";
import { htmlToPlainText } from "./plainText";
import { useArticleBlockOps } from "./useArticleBlockOps";

/**
 * Owns every autosaved field on the article editor (title, standfirst,
 * blocks, section, tags, role, and the SEO fields) plus the seed-from-server
 * and ~1.2s-debounced-autosave machinery, split out of `ArticleEditorPage`
 * purely to keep that component under the 200-line cap — publishing
 * (`ArticleEditorPage`'s own `handlePublish`) stays out of this hook since
 * it's an explicit action, never part of the autosave loop.
 *
 * Seeding runs synchronously during render (see the inline comment below on
 * why an effect-based seed would leave `RichText`'s contentEditable blank on
 * first mount), so this hook can only be called from a component body, same
 * as any other hook — no I/O of its own beyond `save.mutate`.
 *
 * SAVED-STATE CONTRACT (the three bugs this shape exists to prevent):
 *  1. `lastSavedSnapshot` only ever advances when the server confirms a write.
 *     Marking a snapshot saved before the PATCH resolves meant a failed save
 *     was never retried while the header still read "All changes saved".
 *  2. `isDirty` is derived from the UNDEBOUNCED snapshot, so callers can guard
 *     navigation and flush before publishing during the debounce window.
 *  3. `saveNow` is the flush: it resends the current snapshot and resolves
 *     only once the server has it, so publish never validates a stale draft.
 */
export function useArticleEditorDraftState(
  pieceId: string,
  article: ArticleDraftDto | undefined,
  save: UseMutationResult<ArticleDraftDto | null, Error, UpdateArticleDraftDto>,
) {
  // Tracks which `pieceId` has already been seeded into the state below — a
  // ref would do the bookkeeping just as well, but its `.current` can only
  // be WRITTEN during render (React's rules of hooks forbid reading a ref
  // during render, see the `react-hooks/refs` lint rule), and `hasSeeded`
  // below needs to read it every render to gate what's returned. Real state
  // is the correct tool here specifically because a render-time read is
  // required, not just an effect-time one.
  const [seededPieceId, setSeededPieceId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [standfirst, setStandfirst] = useState("");
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [section, setSection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [socialImage, setSocialImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  // The last snapshot the SERVER has confirmed. State rather than a ref
  // because `isDirty` is read during render (see the rules-of-hooks note
  // above), and because a save resolving has to re-render the header.
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<DraftSnapshot | null>(null);
  // Bumped by a version restore. `RichText` seeds its contentEditable once on
  // mount by design, so React state alone cannot push restored content into
  // an already-mounted headline/standfirst/block — the editor surface is
  // remounted on this key instead.
  const [restoreGeneration, setRestoreGeneration] = useState(0);

  const blockOps = useArticleBlockOps(setBlocks);

  // A fresh object literal every render would reset `useDebouncedValue`'s
  // timer on every unrelated re-render (mode toggle, block selection, the
  // mutation's own isPending flips) — memoized so the timer only restarts
  // when a tracked field actually changes.
  const snapshot: DraftSnapshot = useMemo(
    () => ({
      title,
      standfirst,
      blocks,
      section,
      tags,
      role,
      metaDescription,
      socialImage,
      canonicalUrl,
    }),
    [title, standfirst, blocks, section, tags, role, metaDescription, socialImage, canonicalUrl],
  );
  const debouncedSnapshot = useDebouncedValue(snapshot, 1200);
  const isDirty = lastSavedSnapshot !== null && !snapshotsEqual(snapshot, lastSavedSnapshot);

  // What a PATCH is currently carrying, so a save that resolves while a newer
  // one is already in flight can't make this effect fire that newer snapshot
  // a second time. Written and read only from effects/handlers, never render.
  const inFlightSnapshotRef = useRef<DraftSnapshot | null>(null);

  useEffect(() => {
    if (!lastSavedSnapshot || snapshotsEqual(debouncedSnapshot, lastSavedSnapshot)) return;
    const inFlight = inFlightSnapshotRef.current;
    if (inFlight && snapshotsEqual(debouncedSnapshot, inFlight)) return;
    inFlightSnapshotRef.current = debouncedSnapshot;
    save.mutate(
      { ...debouncedSnapshot },
      {
        // Only a confirmed write advances the saved marker: on failure the
        // snapshot stays dirty, so the next edit (or an explicit retry via
        // `saveNow`) sends this content again instead of dropping it.
        onSuccess: () => {
          inFlightSnapshotRef.current = null;
          setLastSavedSnapshot(debouncedSnapshot);
        },
        onError: () => {
          inFlightSnapshotRef.current = null;
        },
      },
    );
    // `save` is a fresh useMutation object every render — only the debounced
    // snapshot and the saved marker should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSnapshot, lastSavedSnapshot]);

  // Latest-value ref for the unmount/tab-hide flush below, which must see the
  // CURRENT snapshot rather than whatever was current when its listener was
  // registered.
  const flushRef = useRef<() => void>(() => {});
  useEffect(() => {
    flushRef.current = () => {
      const pending = snapshot;
      if (!lastSavedSnapshot || snapshotsEqual(pending, lastSavedSnapshot)) return;
      const inFlight = inFlightSnapshotRef.current;
      if (inFlight && snapshotsEqual(pending, inFlight)) return;
      inFlightSnapshotRef.current = pending;
      // `pagehide` also fires on a tab going to the background, where this
      // component stays mounted — so a flush still has to settle its own
      // bookkeeping rather than assume it is on the way out.
      save.mutate(
        { ...pending },
        {
          onSuccess: () => {
            inFlightSnapshotRef.current = null;
            setLastSavedSnapshot(pending);
          },
          onError: () => {
            inFlightSnapshotRef.current = null;
          },
        },
      );
    };
  });

  // Everything typed inside the debounce window would otherwise be dropped:
  // `useDebouncedValue` clears its timer on unmount and never fires. Sending
  // it here means leaving the editor (Back, a command-palette jump, the tab
  // being hidden) costs at most the request, not the last sentence.
  useEffect(() => {
    const flushPendingSave = () => flushRef.current();
    window.addEventListener("pagehide", flushPendingSave);
    return () => {
      window.removeEventListener("pagehide", flushPendingSave);
      flushPendingSave();
    };
  }, []);

  /** Sends the current snapshot immediately and resolves once the server has
   * it (rejecting if it doesn't). Used before publishing, so the readiness
   * re-check server-side sees what the writer is looking at, and by the
   * header's retry after a failed autosave. A no-op when nothing is dirty. */
  // `useCallback` rather than a bare function so the ref bookkeeping below
  // sits in a callback the compiler knows never runs during render.
  const saveNow = useCallback(async (): Promise<void> => {
    const pending = snapshot;
    if (!lastSavedSnapshot || snapshotsEqual(pending, lastSavedSnapshot)) return;
    inFlightSnapshotRef.current = pending;
    try {
      await save.mutateAsync({ ...pending });
      setLastSavedSnapshot(pending);
    } finally {
      inFlightSnapshotRef.current = null;
    }
  }, [snapshot, lastSavedSnapshot, save]);

  // Seeds local state from `article` the moment its `pieceId` differs from
  // what's already seeded — React's own documented pattern for adjusting
  // state when a prop changes ("you might not need an Effect"), done
  // synchronously during render rather than in a `useEffect`. That distinction
  // matters here specifically: `ArticleDocument`'s title/standfirst `RichText`
  // seed the DOM once on mount, so if they ever mounted on a render where
  // state still held its initial `""` — which an *effect*-based seed cannot
  // prevent, since effects only run AFTER the render that scheduled them —
  // the Headline/Standfirst would stay blank forever. Calling `setState`
  // here instead makes React immediately re-render before anything paints,
  // so `ArticleDocument` never mounts on a stale value. Also self-corrects on
  // piece-to-piece navigation: a new `pieceId` reads as not-yet-seeded.
  //
  // The headline and standfirst are decoded on the way in: they are plain
  // text by contract, so anything stored with tags or entities still in it
  // becomes the characters a reader sees, and the next save persists that.
  // `lastSavedSnapshot` is seeded with the same decoded values, so simply
  // opening a piece never fires a save of its own.
  if (article && seededPieceId !== pieceId) {
    const seededTitle = htmlToPlainText(article.title);
    const seededStandfirst = htmlToPlainText(article.standfirst);
    setSeededPieceId(pieceId);
    setTitle(seededTitle);
    setStandfirst(seededStandfirst);
    setBlocks(article.blocks);
    setSection(article.section);
    setTags(article.tags);
    setRole(article.role);
    setMetaDescription(article.metaDescription);
    setSocialImage(article.socialImage);
    setCanonicalUrl(article.canonicalUrl);
    setLastSavedSnapshot({
      title: seededTitle,
      standfirst: seededStandfirst,
      blocks: article.blocks,
      section: article.section,
      tags: article.tags,
      role: article.role,
      metaDescription: article.metaDescription,
      socialImage: article.socialImage,
      canonicalUrl: article.canonicalUrl,
    });
  }

  // A restore replaces the draft server-side; this editor's local state was
  // seeded from `article` once (see the render-phase seed above) and does
  // NOT re-seed itself just because the `useArticleDraft` query gets
  // invalidated and refetches — so `VersionsRail`'s restore mutation hands
  // its response straight here instead of relying on that refetch alone.
  // Updating the saved marker too keeps the autosave debounce from immediately
  // re-firing a redundant save of content the server already has. A version
  // only ever snapshots/restores blocks-level content, never role/SEO, so
  // those carry forward from current state rather than the restored draft.
  //
  // `restoreGeneration` is what actually puts the restored text on screen:
  // without a remount, the headline, standfirst and any block whose id
  // survived the restore would keep showing pre-restore DOM, and the next
  // keystroke in one of those would report that stale content back as an
  // edit — silently undoing the restore.
  function applyVersionRestore(draft: ArticleDraftDto) {
    const restoredTitle = htmlToPlainText(draft.title);
    const restoredStandfirst = htmlToPlainText(draft.standfirst);
    setTitle(restoredTitle);
    setStandfirst(restoredStandfirst);
    setBlocks(draft.blocks);
    setSection(draft.section);
    setTags(draft.tags);
    setLastSavedSnapshot({
      title: restoredTitle,
      standfirst: restoredStandfirst,
      blocks: draft.blocks,
      section: draft.section,
      tags: draft.tags,
      role,
      metaDescription,
      socialImage,
      canonicalUrl,
    });
    setRestoreGeneration((generation) => generation + 1);
  }

  return {
    hasSeeded: seededPieceId === pieceId,
    title,
    setTitle,
    standfirst,
    setStandfirst,
    blocks,
    section,
    setSection,
    tags,
    setTags,
    role,
    setRole,
    metaDescription,
    setMetaDescription,
    socialImage,
    setSocialImage,
    canonicalUrl,
    setCanonicalUrl,
    blockOps,
    applyVersionRestore,
    isDirty,
    saveNow,
    restoreGeneration,
  };
}
