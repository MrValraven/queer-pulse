import type { IconType } from "react-icons";
import { FiClipboard, FiFileText } from "react-icons/fi";
import type { UnpublishLandingStage } from "../api/piecePublish.api";

/** The two landing stages a Published board card offers, in the order the
 *  row's More menu lists them, with the menu's own labels and icons. */
export const BOARD_UNPUBLISH_OPTIONS: {
  stage: UnpublishLandingStage;
  labelKey: string;
  icon: IconType;
}[] = [
  {
    stage: "drafting",
    labelKey: "magazine:desk.pieceRow.unpublishToDraft",
    icon: FiFileText,
  },
  {
    stage: "in_review",
    labelKey: "magazine:desk.pieceRow.unpublishToReview",
    icon: FiClipboard,
  },
];
