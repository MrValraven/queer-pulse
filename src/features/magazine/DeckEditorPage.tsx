import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { emptyDraft, deckDtoToDraft, draftToDeck, type DeckDraft } from "./deckDraft";
import { type DeckLoad, loadMockDraft, draftsEqual } from "./deckEditorLoad";
import { DeckMetaForm } from "./DeckMetaForm";
import { DeckSlidesEditor } from "./DeckSlidesEditor";
import { useDeckEditorActions } from "./DeckEditorActions";
import { getAdminDeck } from "./api/magazine.api";
import { DeckEditorHeader } from "./desk/deck/DeckEditorHeader";
import { SlideLivePreview } from "./desk/deck/SlideLivePreview";
import { DeckPublishRail, type DeckPublishStatus } from "./desk/deck/DeckPublishRail";
import { DeckDangerCard } from "./desk/deck/DeckDangerCard";
import { DeckModals, type DeckModal } from "./desk/deck/DeckModals";
import { buildDeckPublishChecklist, isDeckPublishReady } from "./desk/deck/deckPublishChecklist";
import styles from "./DeckEditorPage.module.css";

export function DeckEditorPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const deckQuery = useQuery<DeckLoad>({
    queryKey: ["magazine-admin-deck", demoMode, id],
    queryFn: async () => {
      if (!id) return { draft: emptyDraft(), published: false };
      if (demoMode) {
        return (await loadMockDraft(id)) ?? { draft: emptyDraft(), published: false };
      }
      const dto = await getAdminDeck(id);
      return { draft: deckDtoToDraft(dto), published: Boolean(dto.publishedAt) };
    },
  });

  const [draft, setDraft] = useState<DeckDraft>(emptyDraft());
  const [lastSaved, setLastSaved] = useState<DeckDraft>(emptyDraft());
  const [published, setPublished] = useState(false);
  // The id the create mutation just returned — fills the gap between a
  // successful create and the URL actually landing on `?id=<id>` (the
  // navigate below is deferred by a render so it can't out-race the unsaved
  // guard's own effect; see the comment on `pendingNavigateTo`).
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [pendingNavigateTo, setPendingNavigateTo] = useState<string | null>(null);
  const seededForRef = useRef<string | null>(null);
  const effectiveId = id ?? createdId;

  // Local-only UI state for the new chrome: which slide the rail preview /
  // Present overlay is showing, the publish-timing segment, and which modal
  // (delete/convert) is open. None of this is part of the persisted draft.
  const [previewIndex, setPreviewIndex] = useState(0);
  const [publishStatus, setPublishStatus] = useState<DeckPublishStatus>("now");
  const [modal, setModal] = useState<DeckModal>(null);

  useEffect(() => {
    if (!deckQuery.data) return;
    const seedKey = id ?? "new";
    if (seededForRef.current === seedKey) return;
    seededForRef.current = seedKey;
    setDraft(deckQuery.data.draft);
    setLastSaved(deckQuery.data.draft);
    setPublished(deckQuery.data.published);
  }, [deckQuery.data, id]);

  const dirty = !draftsEqual(draft, lastSaved);

  // Armed only while there are real unsaved edits. `pendingNavigateTo` below
  // relies on this effect re-running (and uninstalling its history-navigator
  // patch) before the deferred `navigate()` fires, so a save-then-navigate
  // never throws up a stale "leave without saving?" prompt.
  useUnsavedChangesGuard({
    active: dirty,
    confirmMessage: t("magazine:deck.editor.leaveConfirm"),
  });

  // Deferred by a render on purpose: firing `navigate()` in the same tick as
  // the `setLastSaved` that clears `dirty` would still hit the guard's
  // currently-installed (stale) confirm wrapper, since its effect hasn't had
  // a chance to re-run yet. Waiting for this effect guarantees it has.
  useEffect(() => {
    if (!pendingNavigateTo) return;
    void navigate(pendingNavigateTo, { replace: true });
    // One-shot: clears the trigger once this deferred navigation has fired,
    // deliberately from inside the effect it fires from (see comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingNavigateTo(null);
  }, [pendingNavigateTo, navigate]);

  const {
    handleSave,
    handleTogglePublish,
    handleDelete,
    handleConvert,
    isSaving,
    isPublishPending,
    isDeletePending,
    isConvertPending,
  } = useDeckEditorActions({
    id: effectiveId,
    draft,
    published,
    onCreated: (newId) => {
      setLastSaved(draft);
      setCreatedId(newId);
      seededForRef.current = newId;
      setPendingNavigateTo(`${routes.deckEditor}?id=${newId}`);
    },
    onSaved: () => setLastSaved(draft),
    onPublishedChange: setPublished,
    onDeleted: () => {
      setLastSaved(draft);
      setPendingNavigateTo(routes.magazineEditor);
    },
    onConverted: (pieceId) => {
      setLastSaved(draft);
      setModal(null);
      setPendingNavigateTo(routes.magazineWrite.replace(":id", pieceId));
    },
  });

  const deck = draftToDeck(draft);
  const clampedIndex = deck.slides.length === 0 ? 0 : Math.min(previewIndex, deck.slides.length - 1);
  const currentSlide = deck.slides[clampedIndex];

  const canPublish = Boolean(effectiveId);
  const checklistBlocksPublish = !published && !isDeckPublishReady(buildDeckPublishChecklist(draft, t));
  const publishDisabled = !canPublish || checklistBlocksPublish;

  const savedLabel = isSaving
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
          savePending={isSaving}
          onConvert={() => setModal({ kind: "convert" })}
          publishPending={isPublishPending}
          publishDisabled={publishDisabled}
          onPublish={handleTogglePublish}
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
              onPublish={handleTogglePublish}
            />
            <DeckDangerCard onDelete={() => setModal({ kind: "delete" })} disabled={!effectiveId} />
          </aside>
        </div>
      </div>

      <DeckModals
        modal={modal}
        onClose={() => setModal(null)}
        onConfirmDelete={handleDelete}
        deletePending={isDeletePending}
        onConfirmConvert={handleConvert}
        convertPending={isConvertPending}
      />
    </MagazineDeskShell>
  );
}
