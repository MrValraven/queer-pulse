import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { draftToCreateDto, type DeckDraft } from "./deckDraft";
import { useCreateDeck, useDeleteDeck, useUpdateDeck } from "./api/useDeckMutations";
import styles from "./DeckEditorPage.module.css";

interface DeckEditorActionsProps {
  /** Server id once the deck has been saved at least once; `null` for a
   *  brand-new, never-saved draft (publish/delete are disabled until then). */
  id: string | null;
  draft: DeckDraft;
  published: boolean;
  /** A brand-new deck was created — hands the new server id back up so the
   *  page can mark the draft clean and move the URL to `?id=<id>`. */
  onCreated: (id: string) => void;
  /** An existing deck was updated — marks the draft clean. */
  onSaved: () => void;
  onPublishedChange: (published: boolean) => void;
  onDeleted: () => void;
}

/**
 * Save / publish-unpublish / delete action bar for the deck editor, wired to
 * the dual-mode deck mutations (`api/useDeckMutations.ts`). Every mutation is
 * silent by contract (`meta.silentError`), so this component — not the
 * mutation hooks — owns the success/failure toast on each `.mutateAsync` call.
 */
export function DeckEditorActions({
  id,
  draft,
  published,
  onCreated,
  onSaved,
  onPublishedChange,
  onDeleted,
}: DeckEditorActionsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createDeck = useCreateDeck();
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();
  const isSaving = createDeck.isPending || updateDeck.isPending;

  async function handleSave() {
    try {
      if (id) {
        await updateDeck.mutateAsync({ id, dto: draftToCreateDto(draft) });
        onSaved();
      } else {
        const created = await createDeck.mutateAsync(draftToCreateDto(draft));
        onCreated(created.id);
      }
      showToast(t("magazine:deck.editor.saved"), "success");
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
    }
  }

  async function handleTogglePublish() {
    if (!id) return;
    const nextPublished = !published;
    try {
      await updateDeck.mutateAsync({
        id,
        dto: { ...draftToCreateDto(draft), published: nextPublished },
      });
      onPublishedChange(nextPublished);
      onSaved();
      showToast(t("magazine:deck.editor.publishedToast"), "success");
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm(t("magazine:deck.editor.deleteConfirm"))) return;
    try {
      await deleteDeck.mutateAsync(id);
      showToast(t("magazine:deck.editor.deletedToast"), "success");
      onDeleted();
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
    }
  }

  return (
    <div className={styles.actions}>
      <Button
        type="button"
        variant="primary"
        onClick={() => void handleSave()}
        disabled={isSaving}
        aria-busy={isSaving}
      >
        {t("magazine:deck.editor.saveDraft")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => void handleTogglePublish()}
        disabled={!id || updateDeck.isPending}
      >
        {published
          ? t("magazine:deck.editor.unpublish")
          : t("magazine:deck.editor.publish")}
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={() => void handleDelete()}
        disabled={!id || deleteDeck.isPending}
      >
        {t("magazine:deck.editor.delete")}
      </Button>
    </div>
  );
}
