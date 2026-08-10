import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { draftToCreateDto, type DeckDraft } from "./deckDraft";
import { useCreateDeck, useDeleteDeck, useUpdateDeck } from "./api/useDeckMutations";

export interface UseDeckEditorActionsArgs {
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
 * Save / publish-unpublish / delete action handlers for the deck editor,
 * wired to the dual-mode deck mutations (`api/useDeckMutations.ts`). Every
 * mutation is silent by contract (`meta.silentError`), so this hook — not the
 * mutation hooks themselves — owns the success/failure toast on each
 * `.mutateAsync` call.
 *
 * Previously this file rendered its own action bar; the Phase-4 Task-3
 * restyle moved those buttons into the new `.ebar` header (Save/Publish),
 * `DeckPublishRail` (Publish), and `DeckDangerCard`/`DeckModals` (Delete), so
 * this is now a logic-only hook the page and its sub-components share — the
 * mutation/toast behavior itself is unchanged from before the restyle.
 */
export function useDeckEditorActions({
  id,
  draft,
  published,
  onCreated,
  onSaved,
  onPublishedChange,
  onDeleted,
}: UseDeckEditorActionsArgs) {
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
    try {
      await deleteDeck.mutateAsync(id);
      showToast(t("magazine:deck.editor.deletedToast"), "success");
      onDeleted();
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
    }
  }

  return {
    handleSave: () => void handleSave(),
    handleTogglePublish: () => void handleTogglePublish(),
    handleDelete: () => void handleDelete(),
    isSaving,
    isPublishPending: updateDeck.isPending,
    isDeletePending: deleteDeck.isPending,
  };
}
