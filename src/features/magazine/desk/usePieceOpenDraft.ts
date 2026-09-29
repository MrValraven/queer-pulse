/**
 * "Open the draft" on the piece record. An article piece opens the block
 * editor on the piece; a deck piece opens the deck editor on its own deck.
 *
 * A deck piece with no deck yet (one filed before the backend created decks
 * alongside deck pieces) gets its draft deck first: a PATCH of
 * `format: "deck"` makes the backend create the deck and link it in the same
 * transaction, and the record it answers carries the new `deckId`. So the
 * record never opens a standalone deck, which could not publish from here.
 * Demo mode saves nothing and opens the demo deck editor.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { updatePiece, type PieceRecordDto } from "../api/pieces.api";

export interface UsePieceOpenDraftResult {
  openDraft: (record: Pick<PieceRecordDto, "format" | "deckId">) => void;
  /** True while a missing deck is being created, to hold the button busy. */
  isOpening: boolean;
}

export function usePieceOpenDraft(pieceId: string): UsePieceOpenDraftResult {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();

  /** PATCH the piece to `deck`; resolves to the deck the backend created. */
  const createPieceDeck = useMutation<string, Error, void>({
    // This hook toasts its own failure below.
    meta: { silentError: true },
    mutationFn: async () => {
      const updated = await updatePiece(pieceId, { format: "deck" });
      if (!updated.deckId) throw new Error("The piece came back with no deck");
      return updated.deckId;
    },
    onSuccess: (deckId) => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-piece", pieceId],
      });
      void navigate(`${routes.deckEditor}?id=${deckId}`);
    },
    onError: () => {
      showToast(t("magazine:piece.header.openDeckError"), "error");
    },
  });

  function openDraft(record: Pick<PieceRecordDto, "format" | "deckId">) {
    if (record.format === "article") {
      void navigate(routes.magazineWrite.replace(":id", pieceId));
      return;
    }
    if (record.deckId) {
      void navigate(`${routes.deckEditor}?id=${record.deckId}`);
      return;
    }
    if (demoMode) {
      void navigate(routes.deckEditor);
      return;
    }
    if (createPieceDeck.isPending) return;
    createPieceDeck.mutate();
  }

  return { openDraft, isOpening: createPieceDeck.isPending };
}
