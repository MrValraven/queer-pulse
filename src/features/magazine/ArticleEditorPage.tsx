import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useArticleDraft } from "./api/useArticleDraft";
import { useArticleMutations } from "./api/useArticleMutations";
import { usePieceMutations } from "./api/usePieceMutations";
import { usePieceRecord } from "./api/usePieceRecord";
import { nextPieceStage, STAGE_DTO_TO_VIEW } from "./api/pieces.adapters";
import { ArticleDocument } from "./desk/editor/ArticleDocument";
import { ArticleReaderPreview } from "./desk/editor/ArticleReaderPreview";
import { ArticleEditorHeader } from "./desk/editor/ArticleEditorHeader";
import { ArticleEditorRails } from "./desk/editor/ArticleEditorRails";
import { ArticleEditorStatus } from "./desk/editor/ArticleEditorStatus";
import { SelectionToolbar } from "./desk/editor/SelectionToolbar";
import { SlashMenu, type SlashMenuPoint } from "./desk/editor/SlashMenu";
import type { ArticleBlockKind } from "./desk/editor/blockKinds";
import type { EditorMode } from "./desk/editor/editorMode";
import { useArticleEditorDraftState } from "./desk/editor/useArticleEditorDraftState";
import { useBlockRemovalUndo } from "./desk/editor/useBlockRemovalUndo";
import { useArticlePublishHandler } from "./desk/editor/useArticlePublishHandler";
import {
  countArticleWords,
  estimateReadMinutes,
} from "./desk/editor/articleWordCount";
import {
  buildPublishChecklist,
  isPublishReady,
} from "./desk/editor/articlePublishChecklist";
import { isFutureInstant } from "./desk/editor/scheduleValidity";
import { deriveLiveStatus } from "./desk/editor/articleLiveStatus";
import type { PublishStatus } from "./desk/editor/PublishRail";
import styles from "./ArticleEditorPage.module.css";

interface SlashState {
  afterIndex: number;
  at: SlashMenuPoint;
}

/**
 * The block-based article editor — `/magazine/editor/write/:id` (`:id` is
 * the piece id, same one `useArticleDraft`/`usePieceRecord` both key off).
 * Composes the document surface (`ArticleDocument`), the slash-insert menu,
 * the floating selection toolbar, the header (`ArticleEditorHeader`) and the
 * rails (`ArticleEditorRails`) around `useArticleDraft`/`useArticleMutations`.
 * Kept thin on purpose — the autosaved field state and its debounce live in
 * `useArticleEditorDraftState`, block-array operations live in
 * `useArticleBlockOps` (composed inside that hook), and the publish action
 * lives in `useArticlePublishHandler`.
 *
 * Publishing (CNT-1/CNT-2) is a SEPARATE, explicit action (`publish.mutate`,
 * never folded into the autosave debounce): `publishStatus` picks what
 * "Publish" means — "now" publishes immediately, "schedule" requires a valid
 * future instant (`scheduledAt`, gated by `isFutureInstant`) and publishes
 * at exactly that instant server-side (no separate scheduler — the public
 * read paths already gate on `publishedAt <= now`), and "issue" never calls
 * `publish` directly at all — it's disabled with copy explaining the piece
 * ships automatically when its issue does (via `shipIssue`), so picking it
 * can never look like a direct publish that silently did nothing.
 *
 * Two things can stop the editor from writing, and both are honest states
 * rather than toasts that vanish. A 409 on a save means the draft moved on
 * underneath this tab (ENG-111): `useArticleEditorDraftState` latches the
 * conflict, autosave stops, publishing is disabled, and the header renders
 * the blocking banner offering a reload. A refused publish comes back naming
 * the care-gate or readiness items still open, and `PublishRail` lists them.
 */
export function ArticleEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const pieceId = id!;
  const { article, isLoading, isError, isReloading, reload } =
    useArticleDraft(pieceId);
  const { record } = usePieceRecord(pieceId);
  const { save, publish } = useArticleMutations(pieceId);
  const { moveStage } = usePieceMutations();
  const docRef = useRef<HTMLDivElement | null>(null);
  const draft = useArticleEditorDraftState(pieceId, article, save, reload);
  const publishAction = useArticlePublishHandler(publish, draft.saveNow);

  const [mode, setMode] = useState<EditorMode>("draft");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("now");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slashState, setSlashState] = useState<SlashState | null>(null);

  // Removing a block is instant but reversible for a few seconds (FE-CNT-11).
  const removeBlockWithUndo = useBlockRemovalUndo(
    draft.blocks,
    draft.blockOps,
    setSelectedId,
  );

  // Autosave covers the pauses; this covers the window between the last
  // keystroke and the debounce firing (plus a save still in flight), which
  // used to be lost without warning to Back, a palette jump or a tab close.
  useUnsavedChangesGuard({
    active: draft.isDirty || save.isPending,
    confirmMessage: t("magazine:write.header.leaveConfirm"),
    guardBackButton: true,
  });

  if (isLoading) return <ArticleEditorStatus variant="loading" />;
  if (isError || !article) return <ArticleEditorStatus variant="not-found" />;
  if (!draft.hasSeeded) return <ArticleEditorStatus variant="loading" />;

  const {
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
  } = draft;
  const wordCount = countArticleWords(blocks, title, standfirst);
  const readMinutes = estimateReadMinutes(wordCount);
  const liveStatus = deriveLiveStatus(article.publishedAt);
  const published = liveStatus !== "draft";
  const checklistReady = isPublishReady(
    buildPublishChecklist(standfirst, blocks, t),
  );
  const scheduleValid = isFutureInstant(scheduledAt);
  const publishDisabled =
    // A save still in flight would race the publish: both PATCH the same
    // draft, and either can land last.
    save.isPending ||
    // ENG-111. A conflicted draft cannot be flushed, so publishing would ship
    // whatever the server holds rather than what is on screen.
    draft.hasSaveConflict ||
    (!published &&
      (publishStatus === "issue" ||
        !checklistReady ||
        (publishStatus === "schedule" && !scheduleValid)));
  const issueLabel = record?.issueId
    ? t("magazine:write.header.issueScheduled")
    : t("magazine:piece.header.notScheduled");
  const publishNow = () =>
    void publishAction.handlePublish(
      published,
      publishStatus,
      scheduledAt,
      () => setScheduledAt(null),
    );

  const nextStage = record ? nextPieceStage(record.stage) : null;
  const sendOnLabel = nextStage
    ? t("magazine:write.header.sendOnTo", {
        stage: STAGE_DTO_TO_VIEW[nextStage],
      })
    : t("magazine:write.header.sendOn");
  const handleSendOn = () => {
    if (!nextStage) return;
    moveStage.mutate({ id: pieceId, stage: nextStage });
  };

  function handleSlashOpen(element: HTMLElement, index: number) {
    const rect = element.getBoundingClientRect();
    const menuPoint = { x: rect.left, y: rect.bottom + 8 };
    setSlashState({ afterIndex: index, at: menuPoint });
  }

  function handleSlashPick(kind: ArticleBlockKind) {
    if (!slashState) return;
    setSelectedId(draft.blockOps.insertBlockAfter(slashState.afterIndex, kind));
    setSlashState(null);
  }

  function handleAppendBlock(kind: ArticleBlockKind) {
    setSelectedId(draft.blockOps.insertBlockAfter(blocks.length - 1, kind));
  }

  return (
    <MagazineDeskShell>
      <div className={styles.page}>
        <ArticleEditorHeader
          pieceId={pieceId}
          title={title}
          section={section}
          issueLabel={issueLabel}
          isSavePending={save.isPending}
          isSaveError={save.isError}
          isDirty={draft.isDirty}
          hasSaveConflict={draft.hasSaveConflict}
          onRetrySave={() => void draft.saveNow().catch(() => undefined)}
          isReloadingDraft={isReloading}
          onReloadDraft={() => void draft.reloadFromServer()}
          mode={mode}
          onModeChange={setMode}
          liveStatus={liveStatus}
          publishStatus={publishStatus}
          publishPending={publish.isPending}
          publishDisabled={publishDisabled}
          onPublish={publishNow}
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
                // Remounts the document surface after a version restore:
                // `RichText` seeds its contentEditable once on mount, so
                // restored text reaches the screen no other way.
                key={draft.restoreGeneration}
                docRef={docRef}
                kicker={article.kicker}
                title={title}
                standfirst={standfirst}
                blocks={blocks}
                selectedId={selectedId}
                wordCount={wordCount}
                readMinutes={readMinutes}
                onTitleChange={draft.setTitle}
                onStandfirstChange={draft.setStandfirst}
                onSelectBlock={setSelectedId}
                onChangeBlock={draft.blockOps.changeBlock}
                onMoveBlock={draft.blockOps.moveBlock}
                onRemoveBlock={removeBlockWithUndo}
                onSlashOpen={handleSlashOpen}
                onAppendBlock={handleAppendBlock}
                onPasteParagraphs={draft.blockOps.pasteParagraphsAfter}
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
              scheduledAt={scheduledAt}
              onScheduledAtChange={setScheduledAt}
              published={published}
              publishPending={publish.isPending}
              onPublish={publishNow}
              publishGateFailure={publishAction.gateFailure}
              hasSaveConflict={draft.hasSaveConflict}
              section={section}
              onSectionChange={draft.setSection}
              tags={tags}
              onTagsChange={draft.setTags}
              byline={record?.byline ?? ""}
              role={role}
              onRoleChange={draft.setRole}
              metaDescription={metaDescription}
              onMetaDescriptionChange={draft.setMetaDescription}
              socialImage={socialImage}
              onSocialImageChange={draft.setSocialImage}
              heroImageKey={heroImageKey}
              onHeroImageKeyChange={draft.setHeroImageKey}
              canonicalUrl={canonicalUrl}
              onCanonicalUrlChange={draft.setCanonicalUrl}
              slug={article.slug}
              readMinutes={readMinutes}
              wordCount={wordCount}
              onVersionRestored={(nextDraft) => {
                draft.applyVersionRestore(nextDraft);
                setSelectedId(null);
              }}
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
