import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../../shared/hooks";
import {
  isArticleDraftConflict,
  type ArticleBlock,
  type ArticleDraftDto,
  type UpdateArticleDraftDto,
} from "../../api/pieces.api";
import { snapshotsEqual, type DraftSnapshot } from "./articleDraftSnapshot";
import { htmlToPlainText } from "./plainText";
import { useArticleBlockOps } from "./useArticleBlockOps";

/** Rejection reason `saveNow` throws once the draft has conflicted. Never
 *  shown to anyone: callers branch on `hasSaveConflict` for the copy, and
 *  this only has to be a distinguishable failure for the promise. */
const ARTICLE_DRAFT_CONFLICT_MESSAGE = "article draft conflict";

/**
 * The snapshot a server read seeds: the same ten fields the autosave watches,
 * with the headline and standfirst decoded to the plain text they are by
 * contract (`plainText.ts`), so anything stored with tags or entities still
 * in it becomes the characters a reader sees and the next save persists that.
 *
 * One function because three callers need the identical copy: the initial
 * seed, the conflict reload and a version restore. When they drifted, a
 * reload left stale text on screen under a version that no longer described
 * it.
 */
function toSeededSnapshot(draft: ArticleDraftDto): DraftSnapshot {
  return {
    title: htmlToPlainText(draft.title),
    standfirst: htmlToPlainText(draft.standfirst),
    blocks: draft.blocks,
    section: draft.section,
    tags: draft.tags,
    role: draft.role,
    metaDescription: draft.metaDescription,
    socialImage: draft.socialImage,
    canonicalUrl: draft.canonicalUrl,
    // The RESOLVED url the draft carries, which is what the upload field
    // renders; re-sending it verbatim is a no-op server-side.
    heroImageKey: draft.heroImageUrl ?? "",
  };
}

/**
 * The PATCH body for one write: the whole snapshot plus the article `version`
 * this editor last read, declared as the precondition (ENG-111). Built in one
 * place so the three write paths (the debounced autosave, the pagehide flush
 * and the explicit `saveNow`) can never disagree about what they declare.
 * `null` means the draft has not been seeded yet, in which case there is no
 * version to claim and the server falls back to its in-request guard alone.
 */
function toSavePayload(
  pending: DraftSnapshot,
  baseVersion: number | null,
): UpdateArticleDraftDto {
  if (baseVersion === null) return { ...pending };
  return { ...pending, expectedVersion: baseVersion };
}

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
 * as any other hook. Its only I/O is `save.mutate` and, out of a conflict,
 * the `reloadArticle` re-read it is handed.
 *
 * SAVED-STATE CONTRACT (the three bugs this shape exists to prevent):
 *  1. `lastSavedSnapshot` only ever advances when the server confirms a write.
 *     Marking a snapshot saved before the PATCH resolves meant a failed save
 *     was never retried while the header still read "All changes saved".
 *  2. `isDirty` is derived from the UNDEBOUNCED snapshot, so callers can guard
 *     navigation and flush before publishing during the debounce window.
 *  3. `saveNow` is the flush: it resends the current snapshot and resolves
 *     only once the server has it, so publish never validates a stale draft.
 *
 * OPTIMISTIC CONCURRENCY (ENG-111). Every write declares the `version` this
 * editor last read as `expectedVersion`, and every successful write advances
 * that baseline from the response. When the server answers 409 the row moved
 * underneath this tab (a second editor saved, the writer filed a draft, or a
 * version was restored elsewhere): autosave STOPS, because a retry would
 * carry the same stale version and forcing the write through would replace
 * somebody else's whole `blocks` array with no snapshot to recover it from.
 * `reloadFromServer` is the only way out, and the editor blocks on it.
 */
export function useArticleEditorDraftState(
  pieceId: string,
  article: ArticleDraftDto | undefined,
  save: UseMutationResult<ArticleDraftDto | null, Error, UpdateArticleDraftDto>,
  reloadArticle: () => Promise<ArticleDraftDto | undefined>,
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
  // CON-04 — the lead art, held as whatever reference the editor currently
  // has (the resolved `/files/<key>` URL the draft was seeded with, or the
  // bare key a fresh upload just produced).
  const [heroImageKey, setHeroImageKey] = useState("");
  // The last snapshot the SERVER has confirmed. State rather than a ref
  // because `isDirty` is read during render (see the rules-of-hooks note
  // above), and because a save resolving has to re-render the header.
  const [lastSavedSnapshot, setLastSavedSnapshot] =
    useState<DraftSnapshot | null>(null);
  // ENG-111. The article `version` this editor last read, declared on the next
  // write as `expectedVersion`. Null until the draft has been seeded, which is
  // also the only window in which a write could go out without one.
  const [baseVersion, setBaseVersion] = useState<number | null>(null);
  // True once a write has come back 409. Latches: nothing here clears it
  // except `reloadFromServer`, because every other route back to saving would
  // be a write over content this tab has never seen.
  const [hasSaveConflict, setHasSaveConflict] = useState(false);
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
      heroImageKey,
    }),
    [
      title,
      standfirst,
      blocks,
      section,
      tags,
      role,
      metaDescription,
      socialImage,
      canonicalUrl,
      heroImageKey,
    ],
  );
  const debouncedSnapshot = useDebouncedValue(snapshot, 1200);
  const isDirty =
    lastSavedSnapshot !== null && !snapshotsEqual(snapshot, lastSavedSnapshot);

  // What a PATCH is currently carrying, so a save that resolves while a newer
  // one is already in flight can't make this effect fire that newer snapshot
  // a second time. Written and read only from effects/handlers, never render.
  const inFlightSnapshotRef = useRef<DraftSnapshot | null>(null);

  /**
   * The one fire-and-forget write, shared by the debounced autosave and the
   * pagehide flush (`saveNow` awaits its own, so it settles inline).
   *
   * Only a confirmed write advances the saved marker: on failure the snapshot
   * stays dirty, so the next edit (or an explicit retry via `saveNow`) sends
   * this content again instead of dropping it. A confirmed write also
   * advances the concurrency baseline from the row the server hands back;
   * demo mode resolves to `null` (no server, no row to move), so the baseline
   * stays where the fixture put it. A 409 is the one failure that must never
   * be retried, since the retry would carry the same stale
   * `expectedVersion`, so it latches the conflict and stops every write path.
   */
  function sendSnapshot(pending: DraftSnapshot): void {
    inFlightSnapshotRef.current = pending;
    save.mutate(toSavePayload(pending, baseVersion), {
      onSuccess: (saved) => {
        inFlightSnapshotRef.current = null;
        if (saved) setBaseVersion(saved.version);
        setLastSavedSnapshot(pending);
      },
      onError: (error) => {
        inFlightSnapshotRef.current = null;
        if (isArticleDraftConflict(error)) setHasSaveConflict(true);
      },
    });
  }

  useEffect(() => {
    // A conflicted editor never writes again until it has reloaded. Without
    // this the debounce would re-fire on the next keystroke and hammer the
    // same 409 for as long as the writer kept typing.
    if (hasSaveConflict) return;
    if (
      !lastSavedSnapshot ||
      snapshotsEqual(debouncedSnapshot, lastSavedSnapshot)
    )
      return;
    // One autosave at a time. Overlapping PATCHes both declared the version
    // read BEFORE either resolved, so the second one 409'd against this same
    // editor's own first save. The queued snapshot is not dropped: the
    // in-flight save resolving advances `lastSavedSnapshot`, which re-runs
    // this effect with the fresh version.
    if (inFlightSnapshotRef.current !== null) return;
    sendSnapshot(debouncedSnapshot);
    // `save` is a fresh useMutation object every render, and `sendSnapshot` is
    // a plain function recreated with it. Only the debounced snapshot, the
    // saved marker, the concurrency baseline and the conflict latch should
    // re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSnapshot, lastSavedSnapshot, baseVersion, hasSaveConflict]);

  // Latest-value ref for the unmount/tab-hide flush below, which must see the
  // CURRENT snapshot rather than whatever was current when its listener was
  // registered.
  const flushRef = useRef<() => void>(() => {});
  useEffect(() => {
    flushRef.current = () => {
      // A conflicted editor has no safe write left to make, so leaving the
      // page keeps the text in the browser rather than overwriting the draft
      // somebody else has since saved.
      if (hasSaveConflict) return;
      const pending = snapshot;
      if (!lastSavedSnapshot || snapshotsEqual(pending, lastSavedSnapshot))
        return;
      const inFlight = inFlightSnapshotRef.current;
      if (inFlight && snapshotsEqual(pending, inFlight)) return;
      // `pagehide` also fires on a tab going to the background, where this
      // component stays mounted, so the flush goes through the same write
      // path that settles its own bookkeeping rather than assuming this
      // editor is on the way out.
      sendSnapshot(pending);
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
    // Rejecting rather than resolving is deliberate: `useArticlePublishHandler`
    // awaits this before publishing, and a conflicted draft must abort the
    // publish instead of shipping whatever the server currently holds.
    if (hasSaveConflict) throw new Error(ARTICLE_DRAFT_CONFLICT_MESSAGE);
    const pending = snapshot;
    if (!lastSavedSnapshot || snapshotsEqual(pending, lastSavedSnapshot))
      return;
    inFlightSnapshotRef.current = pending;
    try {
      const saved = await save.mutateAsync(toSavePayload(pending, baseVersion));
      if (saved) setBaseVersion(saved.version);
      setLastSavedSnapshot(pending);
    } catch (error) {
      if (isArticleDraftConflict(error)) setHasSaveConflict(true);
      throw error;
    } finally {
      inFlightSnapshotRef.current = null;
    }
  }, [snapshot, lastSavedSnapshot, save, baseVersion, hasSaveConflict]);

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
  //
  // The copy itself lives in `toSeededSnapshot` above, shared with the
  // conflict reload and the version restore.
  function seedFromServerDraft(draft: ArticleDraftDto): void {
    const seeded = toSeededSnapshot(draft);
    setTitle(seeded.title);
    setStandfirst(seeded.standfirst);
    setBlocks(seeded.blocks);
    setSection(seeded.section);
    setTags(seeded.tags);
    setRole(seeded.role);
    setMetaDescription(seeded.metaDescription);
    setSocialImage(seeded.socialImage);
    setCanonicalUrl(seeded.canonicalUrl);
    setBaseVersion(draft.version);
    setLastSavedSnapshot(seeded);
  }

  if (article && seededPieceId !== pieceId) {
    setSeededPieceId(pieceId);
    seedFromServerDraft(article);
    // A different piece starts from a clean slate: the previous piece's
    // conflict says nothing about this one.
    setHasSaveConflict(false);
  }

  /**
   * The only way out of a save conflict (ENG-111): re-read the draft, replace
   * every local field with what the server now holds, and let saving resume
   * on the fresh version.
   *
   * This DISCARDS whatever this tab had unsaved, which is why the banner that
   * calls it says so plainly. The alternative (merging, or writing anyway) is
   * how the other editor's blocks disappear, and no autosave snapshot exists
   * to bring them back. A failed re-read leaves the conflict standing rather
   * than pretending the editor is safe to type in again.
   */
  async function reloadFromServer(): Promise<void> {
    const fresh = await reloadArticle();
    if (!fresh) return;
    inFlightSnapshotRef.current = null;
    seedFromServerDraft(fresh);
    setHasSaveConflict(false);
    // `RichText` seeds its contentEditable once on mount, so the reloaded
    // headline, standfirst and blocks reach the screen no other way (same
    // reason `applyVersionRestore` bumps it).
    setRestoreGeneration((generation) => generation + 1);
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
    const restored = toSeededSnapshot(draft);
    setTitle(restored.title);
    setStandfirst(restored.standfirst);
    setBlocks(restored.blocks);
    setSection(restored.section);
    setTags(restored.tags);
    // A restore is a server-side write of its own, so the row it hands back
    // is the new baseline. Skipping this left the editor declaring the
    // pre-restore version on its next autosave and 409ing against a write it
    // had just asked for itself.
    setBaseVersion(draft.version);
    setLastSavedSnapshot({
      ...restored,
      role,
      metaDescription,
      socialImage,
      canonicalUrl,
      heroImageKey,
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
    heroImageKey,
    setHeroImageKey,
    blockOps,
    applyVersionRestore,
    isDirty,
    saveNow,
    restoreGeneration,
    /** ENG-111. True once a write has been refused as out of date. While it
     *  is set the editor writes nothing at all, so the page must block
     *  publishing and tell the writer what happened. */
    hasSaveConflict,
    reloadFromServer,
  };
}
