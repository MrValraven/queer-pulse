import { useEffect, useMemo, useRef, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../../shared/hooks";
import type {
  ArticleBlock,
  ArticleDraftDto,
  UpdateArticleDraftDto,
} from "../../api/pieces.api";
import { useArticleBlockOps } from "./useArticleBlockOps";

/** Everything the autosave debounce watches. `blocks`/`tags` are always
 * REPLACED wholesale by every editing op (see `useArticleBlockOps`), so
 * reference equality is enough to detect a real change — mirrors
 * `DeckEditorPage`'s own `draftsEqual`. */
interface DraftSnapshot {
  title: string;
  standfirst: string;
  blocks: ArticleBlock[];
  section: string;
  tags: string[];
  role: string;
  metaDescription: string;
  socialImage: string;
  canonicalUrl: string;
}

function snapshotsEqual(a: DraftSnapshot, b: DraftSnapshot): boolean {
  return (
    a.title === b.title &&
    a.standfirst === b.standfirst &&
    a.blocks === b.blocks &&
    a.section === b.section &&
    a.tags === b.tags &&
    a.role === b.role &&
    a.metaDescription === b.metaDescription &&
    a.socialImage === b.socialImage &&
    a.canonicalUrl === b.canonicalUrl
  );
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
 * as any other hook — no I/O of its own beyond `save.mutate`.
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

  const lastSavedRef = useRef<DraftSnapshot | null>(null);
  const blockOps = useArticleBlockOps(setBlocks);

  // Refs may only be WRITTEN during render, never in an effect's dependency
  // path that also reads them back mid-render (see the `react-hooks/refs`
  // lint rule) — so `lastSavedRef`'s initial value is set here, in its own
  // effect keyed on the same `seededPieceId === pieceId` condition the
  // render-phase seed below uses, rather than inline in that render-phase
  // block (where writing a ref is disallowed outright).
  useEffect(() => {
    if (!article || seededPieceId !== pieceId) return;
    lastSavedRef.current = {
      title: article.title,
      standfirst: article.standfirst,
      blocks: article.blocks,
      section: article.section,
      tags: article.tags,
      role: article.role,
      metaDescription: article.metaDescription,
      socialImage: article.socialImage,
      canonicalUrl: article.canonicalUrl,
    };
  }, [article, pieceId, seededPieceId]);

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

  useEffect(() => {
    if (!lastSavedRef.current || snapshotsEqual(debouncedSnapshot, lastSavedRef.current)) return;
    lastSavedRef.current = debouncedSnapshot;
    save.mutate({ ...debouncedSnapshot });
    // `save` is a fresh useMutation object every render — only the debounced
    // snapshot should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSnapshot]);

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
  if (article && seededPieceId !== pieceId) {
    setSeededPieceId(pieceId);
    setTitle(article.title);
    setStandfirst(article.standfirst);
    setBlocks(article.blocks);
    setSection(article.section);
    setTags(article.tags);
    setRole(article.role);
    setMetaDescription(article.metaDescription);
    setSocialImage(article.socialImage);
    setCanonicalUrl(article.canonicalUrl);
  }

  // A restore replaces the draft server-side; this editor's local state was
  // seeded from `article` once (see the render-phase seed above) and does
  // NOT re-seed itself just because the `useArticleDraft` query gets
  // invalidated and refetches — so `VersionsRail`'s restore mutation hands
  // its response straight here instead of relying on that refetch alone.
  // Updating `lastSavedRef` too keeps the autosave debounce from immediately
  // re-firing a redundant save of content the server already has. A version
  // only ever snapshots/restores blocks-level content, never role/SEO, so
  // those carry forward from current state rather than the restored draft.
  function applyVersionRestore(draft: ArticleDraftDto) {
    setTitle(draft.title);
    setStandfirst(draft.standfirst);
    setBlocks(draft.blocks);
    setSection(draft.section);
    setTags(draft.tags);
    lastSavedRef.current = {
      title: draft.title,
      standfirst: draft.standfirst,
      blocks: draft.blocks,
      section: draft.section,
      tags: draft.tags,
      role,
      metaDescription,
      socialImage,
      canonicalUrl,
    };
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
  };
}
