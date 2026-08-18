import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../shared/hooks";
import { useArticleDraft } from "./api/useArticleDraft";
import { useArticleMutations } from "./api/useArticleMutations";
import { usePieceMutations } from "./api/usePieceMutations";
import { usePieceRecord } from "./api/usePieceRecord";
import { nextPieceStage, STAGE_DTO_TO_VIEW } from "./api/pieces.adapters";
import type { ArticleBlock, ArticleDraftDto } from "./api/pieces.api";
import { ArticleDocument } from "./desk/editor/ArticleDocument";
import { ArticleReaderPreview } from "./desk/editor/ArticleReaderPreview";
import { ArticleEditorHeader } from "./desk/editor/ArticleEditorHeader";
import { ArticleEditorRails } from "./desk/editor/ArticleEditorRails";
import { ArticleEditorStatus } from "./desk/editor/ArticleEditorStatus";
import { SelectionToolbar } from "./desk/editor/SelectionToolbar";
import { SlashMenu, type SlashMenuPoint } from "./desk/editor/SlashMenu";
import type { ArticleBlockKind } from "./desk/editor/blockKinds";
import type { EditorMode } from "./desk/editor/editorMode";
import { useArticleBlockOps } from "./desk/editor/useArticleBlockOps";
import { countArticleWords, estimateReadMinutes } from "./desk/editor/articleWordCount";
import { buildPublishChecklist, isPublishReady } from "./desk/editor/articlePublishChecklist";
import type { PublishStatus } from "./desk/editor/PublishRail";
import styles from "./ArticleEditorPage.module.css";

interface SlashState {
  afterIndex: number;
  at: SlashMenuPoint;
}

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
}

function snapshotsEqual(a: DraftSnapshot, b: DraftSnapshot): boolean {
  return (
    a.title === b.title &&
    a.standfirst === b.standfirst &&
    a.blocks === b.blocks &&
    a.section === b.section &&
    a.tags === b.tags
  );
}

/**
 * The block-based article editor — `/magazine/editor/write/:id` (`:id` is
 * the piece id, same one `useArticleDraft`/`usePieceRecord` both key off).
 * Composes the document surface (`ArticleDocument`), the slash-insert menu,
 * the floating selection toolbar, the header (`ArticleEditorHeader`) and the
 * rails (`ArticleEditorRails`) around `useArticleDraft`/`useArticleMutations`.
 * Kept thin on purpose — see those files for the actual editing surface and
 * the block-array operations (`useArticleBlockOps`).
 *
 * Autosave: every title/standfirst/block/section/tag edit updates local
 * state immediately (so `RichText`'s uncontrolled contentEditable never
 * fights the caret); a ~1.2s debounce on a snapshot of that state then fires
 * `save.mutate` — demo mode toasts, live mode PATCHes and refetches.
 */
export function ArticleEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const pieceId = id!;
  const { article, isLoading, isError } = useArticleDraft(pieceId);
  const { record } = usePieceRecord(pieceId);
  const { save } = useArticleMutations(pieceId);
  const { moveStage } = usePieceMutations();
  const { showToast } = useToast();
  const docRef = useRef<HTMLDivElement | null>(null);
  const lastSavedRef = useRef<DraftSnapshot | null>(null);

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
  // Local-only for this phase — `ArticleDraftDto` has no `role` column yet
  // (unlike the deck editor's `DeckDraft`, which does), so it doesn't
  // round-trip through `save()`. See `ArticleMetaRail`'s prop doc.
  const [role, setRole] = useState("");
  const [mode, setMode] = useState<EditorMode>("draft");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("now");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slashState, setSlashState] = useState<SlashState | null>(null);

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
    };
  }, [article, pieceId, seededPieceId]);

  // A fresh object literal every render would reset `useDebouncedValue`'s
  // timer on every unrelated re-render (mode toggle, block selection, the
  // mutation's own isPending flips) — memoized so the timer only restarts
  // when a tracked field actually changes.
  const snapshot: DraftSnapshot = useMemo(
    () => ({ title, standfirst, blocks, section, tags }),
    [title, standfirst, blocks, section, tags],
  );
  const debouncedSnapshot = useDebouncedValue(snapshot, 1200);

  useEffect(() => {
    if (!lastSavedRef.current || snapshotsEqual(debouncedSnapshot, lastSavedRef.current)) return;
    lastSavedRef.current = debouncedSnapshot;
    save.mutate({
      title: debouncedSnapshot.title,
      standfirst: debouncedSnapshot.standfirst,
      blocks: debouncedSnapshot.blocks,
      section: debouncedSnapshot.section,
      tags: debouncedSnapshot.tags,
    });
    // `save` is a fresh useMutation object every render — only the debounced
    // snapshot should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSnapshot]);

  if (isLoading) return <ArticleEditorStatus variant="loading" />;
  if (isError || !article) return <ArticleEditorStatus variant="not-found" />;

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
  if (seededPieceId !== pieceId) {
    setSeededPieceId(pieceId);
    setTitle(article.title);
    setStandfirst(article.standfirst);
    setBlocks(article.blocks);
    setSection(article.section);
    setTags(article.tags);
  }

  const hasSeeded = seededPieceId === pieceId;
  if (!hasSeeded) return <ArticleEditorStatus variant="loading" />;

  const wordCount = countArticleWords(blocks, title, standfirst);
  const readMinutes = estimateReadMinutes(wordCount);
  const publishDisabled = !isPublishReady(buildPublishChecklist(standfirst, blocks, t));
  const savedLabel = save.isPending
    ? t("magazine:write.header.savedSaving")
    : save.isError
      ? t("magazine:write.header.savedError")
      : t("magazine:write.header.savedOk");
  const issueLabel = record?.issueId
    ? t("magazine:write.header.issueScheduled")
    : t("magazine:piece.header.notScheduled");
  const publishStub = () => showToast(t("magazine:write.header.publishToast"));
  const nextStage = record ? nextPieceStage(record.stage) : null;
  const sendOnLabel = nextStage
    ? t("magazine:write.header.sendOnTo", { stage: STAGE_DTO_TO_VIEW[nextStage] })
    : t("magazine:write.header.sendOn");
  const handleSendOn = () => {
    if (!nextStage) return;
    moveStage.mutate({ id: pieceId, stage: nextStage });
  };

  function handleSlashOpen(element: HTMLElement, index: number) {
    const rect = element.getBoundingClientRect();
    setSlashState({ afterIndex: index, at: { x: rect.left, y: rect.bottom + 8 } });
  }

  function handleSlashPick(kind: ArticleBlockKind) {
    if (!slashState) return;
    setSelectedId(blockOps.insertBlockAfter(slashState.afterIndex, kind));
    setSlashState(null);
  }

  function handleAppendBlock(kind: ArticleBlockKind) {
    setSelectedId(blockOps.insertBlockAfter(blocks.length - 1, kind));
  }

  // A restore replaces the draft server-side; this editor's local state was
  // seeded from `article` once (see the render-phase seed above) and does
  // NOT re-seed itself just because the `useArticleDraft` query gets
  // invalidated and refetches — so `VersionsRail`'s restore mutation hands
  // its response straight here instead of relying on that refetch alone.
  // Updating `lastSavedRef` too keeps the autosave debounce from immediately
  // re-firing a redundant save of content the server already has.
  function handleVersionRestored(draft: ArticleDraftDto) {
    setTitle(draft.title);
    setStandfirst(draft.standfirst);
    setBlocks(draft.blocks);
    setSection(draft.section);
    setTags(draft.tags);
    setSelectedId(null);
    lastSavedRef.current = {
      title: draft.title,
      standfirst: draft.standfirst,
      blocks: draft.blocks,
      section: draft.section,
      tags: draft.tags,
    };
  }

  return (
    <MagazineDeskShell>
      <div className={styles.page}>
        <ArticleEditorHeader
          pieceId={pieceId}
          title={title}
          section={section}
          issueLabel={issueLabel}
          savedLabel={savedLabel}
          mode={mode}
          onModeChange={setMode}
          publishDisabled={publishDisabled}
          onPublish={publishStub}
          sendOnLabel={sendOnLabel}
          sendOnDisabled={!nextStage || moveStage.isPending}
          onSendOn={handleSendOn}
        />

        <div className={styles.ework}>
          <div>
            {mode === "read" ? (
              <ArticleReaderPreview
                kicker={article.kicker}
                title={title}
                standfirst={standfirst}
                blocks={blocks}
              />
            ) : (
              <ArticleDocument
                docRef={docRef}
                kicker={article.kicker}
                title={title}
                standfirst={standfirst}
                blocks={blocks}
                selectedId={selectedId}
                wordCount={wordCount}
                readMinutes={readMinutes}
                onTitleChange={setTitle}
                onStandfirstChange={setStandfirst}
                onSelectBlock={setSelectedId}
                onChangeBlock={blockOps.changeBlock}
                onMoveBlock={blockOps.moveBlock}
                onRemoveBlock={blockOps.removeBlock}
                onSlashOpen={handleSlashOpen}
                onAppendBlock={handleAppendBlock}
                onPasteParagraphs={blockOps.pasteParagraphsAfter}
              />
            )}
          </div>

          {mode !== "draft" && (
            <ArticleEditorRails
              pieceId={pieceId}
              activeBlockId={selectedId}
              standfirst={standfirst}
              blocks={blocks}
              publishStatus={publishStatus}
              onPublishStatusChange={setPublishStatus}
              onPublish={publishStub}
              section={section}
              onSectionChange={setSection}
              tags={tags}
              onTagsChange={setTags}
              byline={record?.byline ?? ""}
              role={role}
              onRoleChange={setRole}
              slug={article.slug}
              readMinutes={readMinutes}
              wordCount={wordCount}
              onVersionRestored={handleVersionRestored}
            />
          )}
        </div>
      </div>

      {mode !== "read" && <SelectionToolbar scopeRef={docRef} />}
      {slashState && (
        <SlashMenu
          at={slashState.at}
          onPick={handleSlashPick}
          onClose={() => setSlashState(null)}
        />
      )}
    </MagazineDeskShell>
  );
}
