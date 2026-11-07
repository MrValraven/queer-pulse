/**
 * Static copy for `UnpublishPieceModal`, as i18n keys the modal resolves
 * through `t()`: one entry per place the piece can go back to, in the order
 * the radio lists them (Draft first, the default). The confirm button names
 * the picked destination, so it follows the choice.
 */

import type { UnpublishLandingStage } from "../api/piecePublish.api";

export const UNPUBLISH_DESTINATIONS: readonly {
  stage: UnpublishLandingStage;
  optionKey: string;
  confirmKey: string;
}[] = [
  {
    stage: "drafting",
    optionKey: "magazine:desk.unpublishConfirm.toDraft",
    confirmKey: "magazine:desk.pieceRow.unpublishToDraft",
  },
  {
    stage: "in_review",
    optionKey: "magazine:desk.unpublishConfirm.toReview",
    confirmKey: "magazine:desk.pieceRow.unpublishToReview",
  },
];
