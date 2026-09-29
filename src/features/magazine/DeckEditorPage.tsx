import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { draftToDeck } from "./deckDraft";
import { DeckMetaForm } from "./DeckMetaForm";
import { DeckSlidesEditor } from "./DeckSlidesEditor";
import { useDeckEditorActions } from "./DeckEditorActions";
import { DeckEditorHeader } from "./desk/deck/DeckEditorHeader";
import { SlideLivePreview } from "./desk/deck/SlideLivePreview";
import { DeckPublishRail } from "./desk/deck/DeckPublishRail";
import {
  DeckDangerCard,
  type DeckDeleteBlock,
} from "./desk/deck/DeckDangerCard";
import { useDeckAutosave } from "./desk/deck/useDeckAutosave";
import { useDeckIssueLink } from "./api/useDeckIssueLink";
import { useDeckEditorDraft } from "./desk/deck/useDeckEditorDraft";
import { useDeckEditorNavigation } from "./desk/deck/useDeckEditorNavigation";
import { useDeckPublishTiming } from "./desk/deck/useDeckPublishTiming";
import { DeckModals, type DeckModal } from "./desk/deck/DeckModals";
import styles from "./DeckEditorPage.module.css";

export function DeckEditorPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const {
    draft,
    setDraft,
    lastSaved,
    setLastSaved,
    isDirty: dirty,
    published,
    publishedAt,
    applyPublishedAt,
    markSeeded,
  } = useDeckEditorDraft(id);
  const { effectiveId, setCreatedId, deferNavigateTo } =
    useDeckEditorNavigation(id);

  // Local-only chrome state: which slide the rail preview / Present overlay
  // shows, and which modal is open. Neither is part of the persisted draft.
  const [previewIndex, setPreviewIndex] = useState(0);
  const [modal, setModal] = useState<DeckModal>(null);
  const {
    publishStatus,
    setPublishStatus,
    scheduledAt,
    setScheduledAt,
    isPublishBlocked,
  } = useDeckPublishTiming({ draft, published, t });

  // The issue that ships this deck, and the desk piece that publishes it.
  const issueLinkQuery = useDeckIssueLink(effectiveId);

  const {
    saveDraft,
    handleSave,
    saveBeforeLeaving,
    handlePublish,
    handleDelete,
    handleConvert,
    requestConvert,
    isSaving,
    isCreatePending,
    isPublishPending,
    isDeletePending,
    isConvertPending,
  } = useDeckEditorActions({
    id: effectiveId,
    draft,
    published,
    linkedPieceId: issueLinkQuery.data?.pieceId ?? null,
    onCreated: (newId) => {
      setLastSaved(draft);
      setCreatedId(newId);
      markSeeded(newId);
      deferNavigateTo(`${routes.deckEditor}?id=${newId}`);
    },
    onSaved: setLastSaved,
    onPublishedChange: applyPublishedAt,
    onDeleted: () => {
      setLastSaved(draft);
      deferNavigateTo(routes.magazineEditor);
    },
    onConverted: (pieceId) => {
      setLastSaved(draft);
      setModal(null);
      deferNavigateTo(routes.magazineWrite.replace(":id", pieceId));
    },
  });

  // PRD-131 — the deck editor had no autosave, so anything typed since the
  // last explicit Save was lost to a Back press (see `useDeckAutosave`).
  const { isAutosaving } = useDeckAutosave({
    deckId: effectiveId,
    draft,
    lastSaved,
    saveDraft,
  });

  // Armed only while there are real unsaved edits. `deferNavigateTo` relies
  // on this effect re-running (and uninstalling its history-navigator patch)
  // before the deferred `navigate()` fires, so a save-then-navigate never
  // throws up a stale "leave without saving?" prompt. "Save and leave" runs
  // only the plain draft save and leaves the navigating to the guard. It is
  // offered unless a create, publish, delete or convert is already in flight.
  const isDeckActionPending =
    isCreatePending || isPublishPending || isDeletePending || isConvertPending;
  useUnsavedChangesGuard({
    active: dirty,
    confirmMessage: t("magazine:deck.editor.leaveConfirm"),
    onSaveAndLeave: isDeckActionPending ? undefined : saveBeforeLeaving,
  });

  const deck = draftToDeck(draft);
  const clampedIndex =
    deck.slides.length === 0
      ? 0
      : Math.min(previewIndex, deck.slides.length - 1);
  const currentSlide = deck.slides[clampedIndex];

  const canPublish = Boolean(effectiveId);
  // ENG-112 — the server refuses both of these with a 409. Naming the reason
  // here means the editor never presses a confirm that cannot succeed.
  const deleteBlockedReason: DeckDeleteBlock = published
    ? "published"
    : issueLinkQuery.data?.pieceId
      ? "linked"
      : null;
  const publishDisabled = !canPublish || isPublishBlocked;

  const isWriting = isSaving || isAutosaving;
  const savedLabel = isWriting
    ? t("magazine:write.header.savedSaving")
    : dirty
      ? t("magazine:deck.editor.unsavedChanges")
      : t("magazine:write.header.savedOk");

  return (
    <MagazineDeskShell>
      <div className={styles.page}>
        <DeckEditorHeader
          title={draft.title}
          published={published}
          savedLabel={savedLabel}
          deck={deck}
          index={clampedIndex}
          onIndex={setPreviewIndex}
          onSave={handleSave}
          savePending={isWriting}
          onConvert={() => requestConvert(() => setModal({ kind: "convert" }))}
          isConvertBlocked={published}
          publishPending={isPublishPending}
          publishDisabled={publishDisabled}
          publishedAt={publishedAt}
          isScheduling={publishStatus === "schedule"}
          onPublish={() => handlePublish(publishStatus, scheduledAt)}
        />

        <div className={styles.ework}>
          <div className={styles.left}>
            <DeckMetaForm
              draft={draft}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
            <DeckSlidesEditor
              slides={draft.slides}
              onChange={(slides) => setDraft((d) => ({ ...d, slides }))}
            />
          </div>

          <aside className={styles.erail}>
            <SlideLivePreview
              slide={currentSlide}
              index={clampedIndex}
              total={deck.slides.length}
              onGo={setPreviewIndex}
            />
            <DeckPublishRail
              draft={draft}
              published={published}
              canPublish={canPublish}
              publishPending={isPublishPending}
              publishStatus={publishStatus}
              onPublishStatusChange={setPublishStatus}
              scheduledAt={scheduledAt}
              onScheduledAtChange={setScheduledAt}
              issueNumber={issueLinkQuery.data?.issueNumber ?? null}
              publishedAt={publishedAt}
              onPublish={() => handlePublish(publishStatus, scheduledAt)}
            />
            <DeckDangerCard
              onDelete={() => setModal({ kind: "delete" })}
              disabled={!effectiveId}
              blockedReason={deleteBlockedReason}
            />
          </aside>
        </div>
      </div>

      <DeckModals
        modal={modal}
        onClose={() => setModal(null)}
        onConfirmDelete={handleDelete}
        deletePending={isDeletePending}
        deckTitle={draft.title || t("magazine:deck.editor.untitled")}
        slideCount={draft.slides.length}
        onConfirmConvert={handleConvert}
        convertPending={isConvertPending}
      />
    </MagazineDeskShell>
  );
}
