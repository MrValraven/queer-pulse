/**
 * Static copy for `UnpublishPieceModal`, as i18n keys the modal resolves
 * through `t()`. The confirm button repeats the literal action the row menu
 * and the board card already name, so it reuses those labels.
 */

import type { UnpublishLandingStage } from "../api/piecePublish.api";

export const UNPUBLISH_CONFIRM_COPY: Record<
  UnpublishLandingStage,
  { subKey: string; confirmKey: string }
> = {
  drafting: {
    subKey: "magazine:desk.unpublishConfirm.subDraft",
    confirmKey: "magazine:desk.pieceRow.unpublishToDraft",
  },
  in_review: {
    subKey: "magazine:desk.unpublishConfirm.subReview",
    confirmKey: "magazine:desk.pieceRow.unpublishToReview",
  },
};
