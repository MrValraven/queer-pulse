import { useRef, useState } from "react";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { draftToCreateDto, type DeckDraft } from "./deckDraft";
import {
  buildDeckPublishTiming,
  deckPublishToastKey,
} from "./deckPublishTiming";
import type { PublishDeckDto } from "./api/deckAdmin.api";
import { usePublishDeck } from "./api/useDeckMutations";
import {
  linkedDeckPublishFailure,
  readDeckPublishViaPiece,
  useLinkedDeckPublish,
} from "./api/useLinkedDeckPublish";
import type { DeckPublishStatus } from "./desk/deck/DeckPublishRail";

export interface UseDeckPublishActionArgs {
  /** Server id of the deck; `null` until the first save, when publishing is
   *  disabled. */
  id: string | null;
  draft: DeckDraft;
  published: boolean;
  /** The desk piece that owns this deck, or `null` for a standalone deck. */
  linkedPieceId: string | null;
  /** The plain deck write (`useDeckEditorActions.saveDraft`). Marks the saved
   *  snapshot clean itself. */
  saveDraft: (snapshot: DeckDraft) => Promise<void>;
  onSaved: (savedDraft: DeckDraft) => void;
  onPublishedChange: (publishedAt: string | null) => void;
}

/**
 * The deck editor's publish / schedule / unpublish act (PRD-131), with the
 * toast for every outcome. Split from `useDeckEditorActions` because it has
 * two paths: a standalone deck publishes with its own PATCH, and a deck a desk
 * piece owns publishes through that piece, so the care gate, the stage move,
 * the audit event and the writer's bell run exactly as on the piece record.
 */
export function useDeckPublishAction({
  id,
  draft,
  published,
  linkedPieceId,
  saveDraft,
  onSaved,
  onPublishedChange,
}: UseDeckPublishActionArgs) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const publishDeck = usePublishDeck();
  const linkedPublish = useLinkedDeckPublish();
  // One publish act at a time. The act can span several requests (a draft
  // save, then the piece call, or a refused PATCH and its reroute), and the
  // mutations' own pending flags drop between them, so a second click there
  // would publish twice. The ref blocks re-entry at once; the state keeps
  // the buttons busy for the whole act.
  const isActingRef = useRef(false);
  const [isActing, setIsActing] = useState(false);

  function showSuccessToast(publishStatus: DeckPublishStatus): void {
    showToast(
      t(deckPublishToastKey(published, publishStatus)),
      published ? "info" : "success",
    );
  }

  /**
   * The standalone path: the current draft rides along in the same PATCH, so
   * what goes live is what the writer is looking at and the server's
   * readiness re-check sees the same slides the editor's checklist scored.
   *
   * `"issue"` never reaches here: the rail disables the button for it,
   * because a deck filed under an issue is published by `shipIssue`, and
   * pressing Publish would contradict the timing the writer just chose.
   *
   * The server refuses this PATCH with a 409 for a deck a piece owns. A click
   * that raced the link lookup and met that 409 takes the piece path with the
   * piece id the refusal carries.
   */
  async function handlePublish(
    publishStatus: DeckPublishStatus,
    scheduledAt: string | null,
  ) {
    if (!id || isActingRef.current) return;
    isActingRef.current = true;
    setIsActing(true);
    try {
      await publishOnce(id, publishStatus, scheduledAt);
    } finally {
      isActingRef.current = false;
      setIsActing(false);
    }
  }

  async function publishOnce(
    deckId: string,
    publishStatus: DeckPublishStatus,
    scheduledAt: string | null,
  ) {
    const timing = buildDeckPublishTiming(
      published,
      publishStatus,
      scheduledAt,
    );
    if (linkedPieceId) {
      await publishThroughPiece(linkedPieceId, timing, publishStatus);
      return;
    }
    const dto: PublishDeckDto = { ...draftToCreateDto(draft), ...timing };
    try {
      const result = await publishDeck.mutateAsync({ id: deckId, dto });
      onPublishedChange(result.publishedAt);
      onSaved(draft);
      showSuccessToast(publishStatus);
    } catch (error) {
      const reroutedPieceId = readDeckPublishViaPiece(error);
      if (reroutedPieceId) {
        await publishThroughPiece(reroutedPieceId, timing, publishStatus);
        return;
      }
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

  /**
   * The piece path: a publish or schedule saves the draft first with the
   * plain deck write, so what goes live is what the editor sees, then the
   * piece's own endpoint does the rest. A takedown skips that save: pulling a
   * deck down is never gated, so a draft save the server refuses must not
   * hold it up, and autosave keeps the edits. A care gate refusal names its
   * open items, the way the piece record does.
   */
  async function publishThroughPiece(
    pieceId: string,
    timing: PublishDeckDto,
    publishStatus: DeckPublishStatus,
  ) {
    try {
      if (timing.publishedAt !== null) await saveDraft(draft);
      const nextPublishedAt = await linkedPublish.mutateAsync({
        pieceId,
        timing,
      });
      onPublishedChange(nextPublishedAt);
      showSuccessToast(publishStatus);
    } catch (error) {
      const failure = linkedDeckPublishFailure(error);
      showToast(t(failure.key, failure.values), "error");
    }
  }

  return {
    handlePublish,
    isPublishPending:
      isActing || publishDeck.isPending || linkedPublish.isPending,
  };
}
