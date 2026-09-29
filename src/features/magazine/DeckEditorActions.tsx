import { useRef } from "react";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { draftToCreateDto, type DeckDraft } from "./deckDraft";
import {
  useConvertDeckToArticle,
  useCreateDeck,
  useDeleteDeck,
  useUpdateDeck,
} from "./api/useDeckMutations";
import type { DeckPublishStatus } from "./desk/deck/DeckPublishRail";
import { useDeckPublishAction } from "./useDeckPublishAction";

export interface UseDeckEditorActionsArgs {
  /** Server id once the deck has been saved at least once; `null` for a
   *  brand-new, never-saved draft (publish/delete/convert are disabled until
   *  then). */
  id: string | null;
  draft: DeckDraft;
  published: boolean;
  /** The desk piece that owns this deck (`useDeckIssueLink`), or `null` for a
   *  standalone deck. A linked deck publishes through its piece. */
  linkedPieceId: string | null;
  /** A brand-new deck was created — hands the new server id back up so the
   *  page can mark the draft clean and move the URL to `?id=<id>`. */
  onCreated: (id: string) => void;
  /** An existing deck was updated — marks the snapshot the server confirmed
   *  clean. Takes the snapshot rather than reading current state, because an
   *  autosave resolves after the writer has typed on: only the content that
   *  actually reached the server may be marked saved. Also the one callback
   *  a "Save and leave" create fires, in place of `onCreated`. */
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
  linkedPieceId,
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
  const deleteDeck = useDeleteDeck();
  const convertDeck = useConvertDeckToArticle();
  const isSaving = createDeck.isPending || updateDeck.isPending;
  // The settling promise of the `saveDraft` write on the wire, so "Save and
  // leave" lets it land before sending its own. The PATCH is a whole-row
  // replace, and an older write landing last would win.
  const inFlightWriteRef = useRef<Promise<void> | null>(null);

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
    const write = updateDeck.mutateAsync({
      id,
      dto: draftToCreateDto(snapshot),
    });
    const settledWrite = write.then(
      () => undefined,
      () => undefined,
    );
    inFlightWriteRef.current = settledWrite;
    try {
      await write;
    } finally {
      if (inFlightWriteRef.current === settledWrite)
        inFlightWriteRef.current = null;
    }
    onSaved(snapshot);
  }

  // Publish, schedule and unpublish, standalone or through the owning piece.
  const { handlePublish, isPublishPending } = useDeckPublishAction({
    id,
    draft,
    published,
    linkedPieceId,
    saveDraft,
    onSaved,
    onPublishedChange,
  });

  /**
   * The Save button's write, creating the deck on its first save, with the
   * toast either way. Resolves true once the server has the whole draft.
   *
   * `isLeaving` is "Save and leave": the leave guard navigates the moment
   * this resolves true, so a brand-new deck is only marked clean. Moving the
   * URL to `?id=<id>` through `onCreated` would queue a deferred `navigate()`
   * of its own, racing the one the visitor asked for.
   */
  async function saveWholeDraft(isLeaving: boolean): Promise<boolean> {
    try {
      if (id) {
        await saveDraft(draft);
      } else {
        const created = await createDeck.mutateAsync(draftToCreateDto(draft));
        if (isLeaving) onSaved(draft);
        else onCreated(created.id);
      }
      showToast(t("magazine:deck.editor.saved"), "success");
      return true;
    } catch {
      showToast(t("magazine:deck.editor.saveError"), "error");
      return false;
    }
  }

  /**
   * "Save and leave" in the app-wide leave dialog: the plain draft save
   * alone, since publishing stays an explicit act. A write already on the
   * wire (an autosave, or a Save click) lands first, then the whole current
   * draft is sent after it.
   */
  async function saveBeforeLeaving(): Promise<boolean> {
    let pendingWrite = inFlightWriteRef.current;
    while (pendingWrite) {
      await pendingWrite;
      const nextWrite = inFlightWriteRef.current;
      pendingWrite = nextWrite === pendingWrite ? null : nextWrite;
    }
    return saveWholeDraft(true);
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

  /**
   * The header's convert button. A live or scheduled deck has to come down
   * first (the server refuses it with a 409), so the button says why instead
   * of opening a confirm that cannot succeed. Both modes behave the same.
   */
  function requestConvert(openConfirm: () => void): void {
    if (published) {
      showToast(t(CONVERT_BLOCKED_PUBLISHED_KEY), "error");
      return;
    }
    openConfirm();
  }

  async function handleConvert() {
    if (!id) return;
    if (published) {
      showToast(t(CONVERT_BLOCKED_PUBLISHED_KEY), "error");
      return;
    }
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
    } catch (error) {
      // The deck went live since this page loaded (another tab, the piece
      // record): the server's own refusal names that case with a code.
      showToast(
        t(
          readConflictCode(error) === DECK_CONVERT_PUBLISHED_CODE
            ? CONVERT_BLOCKED_PUBLISHED_KEY
            : "magazine:deck.editor.convertModal.errorToast",
        ),
        "error",
      );
    }
  }

  return {
    saveDraft,
    handleSave: () => void saveWholeDraft(false),
    saveBeforeLeaving,
    handlePublish: (
      publishStatus: DeckPublishStatus,
      scheduledAt: string | null,
    ) => void handlePublish(publishStatus, scheduledAt),
    handleDelete: () => void handleDelete(),
    handleConvert: () => void handleConvert(),
    requestConvert,
    isSaving,
    isCreatePending: createDeck.isPending,
    isPublishPending,
    isDeletePending: deleteDeck.isPending,
    isConvertPending: convertDeck.isPending,
  };
}

const CONVERT_BLOCKED_PUBLISHED_KEY =
  "magazine:deck.editor.convertModal.blockedPublishedToast";

/** The 409 `code` `convertDeckToArticle` answers for a live or scheduled
 *  deck (mirrors the backend's `DECK_CONVERT_PUBLISHED_CODE`). */
const DECK_CONVERT_PUBLISHED_CODE = "magazine_deck_convert_published";

function readConflictCode(error: unknown): unknown {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const body = error.data;
  return typeof body === "object" && body !== null
    ? (body as Record<string, unknown>).code
    : null;
}
