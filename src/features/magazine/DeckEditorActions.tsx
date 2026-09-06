import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { draftToCreateDto, type DeckDraft } from "./deckDraft";
import type { PublishDeckDto } from "./api/deckAdmin.api";
import {
  useConvertDeckToArticle,
  useCreateDeck,
  useDeleteDeck,
  usePublishDeck,
  useUpdateDeck,
} from "./api/useDeckMutations";
import type { DeckPublishStatus } from "./desk/deck/DeckPublishRail";

export interface UseDeckEditorActionsArgs {
  /** Server id once the deck has been saved at least once; `null` for a
   *  brand-new, never-saved draft (publish/delete/convert are disabled until
   *  then). */
  id: string | null;
  draft: DeckDraft;
  published: boolean;
  /** A brand-new deck was created — hands the new server id back up so the
   *  page can mark the draft clean and move the URL to `?id=<id>`. */
  onCreated: (id: string) => void;
  /** An existing deck was updated — marks the snapshot the server confirmed
   *  clean. Takes the snapshot rather than reading current state, because an
   *  autosave resolves after the writer has typed on: only the content that
   *  actually reached the server may be marked saved. */
  onSaved: (savedDraft: DeckDraft) => void;
  /** The deck's `publishedAt` after an explicit publish/schedule/unpublish
   *  (`null` once it is back to draft). */
  onPublishedChange: (publishedAt: string | null) => void;
  onDeleted: () => void;
  /** The deck was converted to an article (CNT-6) — hands the new piece id
   *  up so the page can navigate to the article editor. */
  onConverted: (pieceId: string) => void;
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
  onConverted,
}: UseDeckEditorActionsArgs) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createDeck = useCreateDeck();
  const updateDeck = useUpdateDeck();
  const publishDeck = usePublishDeck();
  const deleteDeck = useDeleteDeck();
  const convertDeck = useConvertDeckToArticle();
  const isSaving = createDeck.isPending || updateDeck.isPending;

  /**
   * The one write both the Save button and the autosave loop go through
   * (PRD-131). Silent by design: it resolves once the server has the
   * snapshot and rejects if it does not, and each caller decides what to say
   * about that. Takes the snapshot explicitly so an autosave marks exactly
   * the content the server confirmed as saved, never whatever the writer has
   * typed since.
   */
  async function saveDraft(snapshot: DeckDraft): Promise<void> {
    if (!id) return;
    await updateDeck.mutateAsync({ id, dto: draftToCreateDto(snapshot) });
    onSaved(snapshot);
  }

  async function handleSave() {
    try {
      if (id) {
        await saveDraft(draft);
      } else {
        const created = await createDeck.mutateAsync(draftToCreateDto(draft));
        onCreated(created.id);
      }
      showToast(t("magazine:deck.editor.saved"), "success");
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
    }
  }

  /**
   * The explicit publish / schedule / unpublish act (PRD-131). The current
   * draft rides along in the same PATCH, so what goes live is what the
   * writer is looking at and the server's readiness re-check sees the same
   * slides the editor's checklist scored.
   *
   * `"issue"` never reaches here: the rail disables the button for it,
   * because a deck filed under an issue is published by `shipIssue`, and
   * pressing Publish would contradict the timing the writer just chose.
   */
  async function handlePublish(
    publishStatus: DeckPublishStatus,
    scheduledAt: string | null,
  ) {
    if (!id) return;
    const dto: PublishDeckDto = {
      ...draftToCreateDto(draft),
      ...buildDeckPublishTiming(published, publishStatus, scheduledAt),
    };
    try {
      const result = await publishDeck.mutateAsync({ id, dto });
      onPublishedChange(result.publishedAt);
      onSaved(draft);
      showToast(
        t(deckPublishToastKey(published, publishStatus)),
        published ? "info" : "success",
      );
    } catch (error) {
      // A 400 is the server-side readiness re-check refusing the publish
      // (see `MagazineService.updateDeck`), which is worth naming: the
      // writer can act on it, unlike a generic failure.
      showToast(
        error instanceof ApiError && error.status === 400
          ? t("magazine:deck.editor.publishNotReadyError")
          : t("magazine:deck.editor.saveError"),
        "error",
      );
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteDeck.mutateAsync(id);
      showToast(t("magazine:deck.editor.deletedToast"), "success");
      onDeleted();
    } catch (error) {
      // ENG-112: the server refuses to hard-delete a published deck or to
      // orphan a desk piece that still points at this one. Both come back as
      // 409, and the two need different next steps from the editor.
      const isConflict = error instanceof ApiError && error.status === 409;
      showToast(
        isConflict
          ? t(
              published
                ? "magazine:deck.editor.deleteBlockedPublished"
                : "magazine:deck.editor.deleteBlockedLinked",
            )
          : t("magazine:deck.editor.saveError"),
        "error",
      );
    }
  }

  async function handleConvert() {
    if (!id) return;
    try {
      const result = await convertDeck.mutateAsync(id);
      if (result.droppedSlideKinds.length > 0) {
        showToast(
          t("magazine:deck.editor.convertModal.partialToast", {
            dropped: result.droppedSlideKinds.join(", "),
          }),
          "info",
        );
      } else {
        showToast(
          t("magazine:deck.editor.convertModal.successToast"),
          "success",
        );
      }
      onConverted(result.pieceId);
    } catch {
      showToast(t("magazine:deck.editor.convertModal.errorToast"), "error");
    }
  }

  return {
    saveDraft,
    handleSave: () => void handleSave(),
    handlePublish: (
      publishStatus: DeckPublishStatus,
      scheduledAt: string | null,
    ) => void handlePublish(publishStatus, scheduledAt),
    handleDelete: () => void handleDelete(),
    handleConvert: () => void handleConvert(),
    isSaving,
    isPublishPending: publishDeck.isPending,
    isDeletePending: deleteDeck.isPending,
    isConvertPending: convertDeck.isPending,
  };
}

/**
 * The publish-timing half of the PATCH body for one click of the
 * Publish/Schedule/Unpublish button.
 *
 * `published: true` is kept for "now" rather than an equivalent
 * `publishedAt`, because the server reads the boolean as "keep the original
 * first-publish date if there is one". Unpublishing and scheduling both need
 * the instant, so they send `publishedAt`. Assumes the caller has already
 * gated the button so `scheduledAt` is a valid future instant whenever the
 * status is `"schedule"` (see `isFutureInstant` in `DeckPublishRail`).
 */
function buildDeckPublishTiming(
  published: boolean,
  publishStatus: DeckPublishStatus,
  scheduledAt: string | null,
): PublishDeckDto {
  if (published) return { publishedAt: null };
  if (publishStatus === "schedule" && scheduledAt) {
    return { publishedAt: new Date(scheduledAt).toISOString() };
  }
  return { published: true };
}

/** The i18n key for the success toast after that same action resolves. */
function deckPublishToastKey(
  published: boolean,
  publishStatus: DeckPublishStatus,
): string {
  if (published) return "magazine:deck.editor.unpublishedToast";
  if (publishStatus === "schedule")
    return "magazine:deck.editor.scheduledToast";
  return "magazine:deck.editor.publishedToast";
}
