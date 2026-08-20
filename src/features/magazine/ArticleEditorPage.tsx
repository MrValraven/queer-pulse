import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
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
import { countArticleWords, estimateReadMinutes } from "./desk/editor/articleWordCount";
import { buildPublishChecklist, isPublishReady } from "./desk/editor/articlePublishChecklist";
import { isFutureInstant } from "./desk/editor/scheduleValidity";
import { deriveLiveStatus } from "./desk/editor/articleLiveStatus";
import { buildPublishPayload, publishSuccessToastKey } from "./desk/editor/articlePublishAction";
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
 * `useArticleEditorDraftState`, and block-array operations live in
 * `useArticleBlockOps` (composed inside that hook).
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
 */
export function ArticleEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const pieceId = id!;
  const { article, isLoading, isError } = useArticleDraft(pieceId);
  const { record } = usePieceRecord(pieceId);
  const { save, publish } = useArticleMutations(pieceId);
  const { moveStage } = usePieceMutations();
  const { showToast } = useToast();
  const docRef = useRef<HTMLDivElement | null>(null);
  const draft = useArticleEditorDraftState(pieceId, article, save);

  const [mode, setMode] = useState<EditorMode>("draft");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("now");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slashState, setSlashState] = useState<SlashState | null>(null);

  if (isLoading) return <ArticleEditorStatus variant="loading" />;
  if (isError || !article) return <ArticleEditorStatus variant="not-found" />;
  if (!draft.hasSeeded) return <ArticleEditorStatus variant="loading" />;

  const { title, standfirst, blocks, section, tags, role, metaDescription, socialImage, canonicalUrl } =
    draft;
  const wordCount = countArticleWords(blocks, title, standfirst);
  const readMinutes = estimateReadMinutes(wordCount);
  const liveStatus = deriveLiveStatus(article.publishedAt);
  const published = liveStatus !== "draft";
  const checklistReady = isPublishReady(buildPublishChecklist(standfirst, blocks, t));
  const scheduleValid = isFutureInstant(scheduledAt);
  const publishDisabled =
    !published &&
    (publishStatus === "issue" ||
      !checklistReady ||
      (publishStatus === "schedule" && !scheduleValid));
  const savedLabel = save.isPending
    ? t("magazine:write.header.savedSaving")
    : save.isError
      ? t("magazine:write.header.savedError")
      : t("magazine:write.header.savedOk");
  const issueLabel = record?.issueId
    ? t("magazine:write.header.issueScheduled")
    : t("magazine:piece.header.notScheduled");

  // CNT-1/CNT-2 fix: a real publish/schedule/unpublish action (mirrors the
  // deck editor's `handleTogglePublish`, but richer) — this used to be
  // `publishStub`, a bare toast with no mutation behind it. A 400 here means
  // the server-side readiness re-check rejected it (see `publishArticle`).
  async function handlePublish() {
    try {
      await publish.mutateAsync(buildPublishPayload(published, publishStatus, scheduledAt));
      showToast(t(publishSuccessToastKey(published, publishStatus)), "success");
      if (!published) setScheduledAt(null);
    } catch (error) {
      showToast(
        error instanceof ApiError && error.status === 400
          ? t("magazine:write.header.publishNotReadyError")
          : t("magazine:write.header.publishError"),
        "error",
      );
    }
  }

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
          savedLabel={savedLabel}
          mode={mode}
          onModeChange={setMode}
          liveStatus={liveStatus}
          publishStatus={publishStatus}
          publishPending={publish.isPending}
          publishDisabled={publishDisabled}
          onPublish={() => void handlePublish()}
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
                onTitleChange={draft.setTitle}
                onStandfirstChange={draft.setStandfirst}
                onSelectBlock={setSelectedId}
                onChangeBlock={draft.blockOps.changeBlock}
                onMoveBlock={draft.blockOps.moveBlock}
                onRemoveBlock={draft.blockOps.removeBlock}
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
              onPublish={() => void handlePublish()}
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
