/**
 * What the desk's one-click unpublish needs besides the request itself: where
 * each landing stage puts the piece and how a failure is explained. Split out
 * of `useDeskUnpublish` so the hook stays the mutation and nothing else.
 */

import { ApiError } from "../../../shared/api/client";
import { reasonFor, asDetailSentence } from "../../../shared/api/errorMessage";
import type { TFunction } from "../../../shared/i18n/types";
import type { Stage } from "../data/desk.data";
import {
  CARE_GATE_OPEN_CODE,
  readPublishRefusal,
  type UnpublishLandingStage,
} from "../api/piecePublish.api";

/** How long the success toast keeps its Undo button: past the toast
 *  default, long enough to read the title and reach the button. */
export const UNDO_TOAST_LIFETIME_MS = 10_000;

/** For each landing stage: the desk's display stage (demo moves the fixture
 *  there) and the catalog key of the success toast's title. */
export const UNPUBLISH_LANDING: Record<
  UnpublishLandingStage,
  { viewStage: Stage; successKey: string }
> = {
  drafting: {
    viewStage: "Drafting",
    successKey: "magazine:desk.pieceToast.unpublishedToDraft",
  },
  in_review: {
    viewStage: "In review",
    successKey: "magazine:desk.pieceToast.unpublishedToReview",
  },
};

/**
 * The detail line under a failed unpublish toast: always the cause. The
 * server's own sentence when it sent one (`reasonFor` reads the body's
 * `message`, in the member's language outside English), otherwise the status
 * it answered with, or the missing connection when no answer came at all.
 */
export function unpublishFailureDetail(
  error: unknown,
  translate: TFunction,
): string {
  const serverReason = reasonFor(error);
  if (serverReason) return asDetailSentence(serverReason);
  if (!(error instanceof ApiError)) {
    return translate("magazine:desk.pieceToast.unpublishNoConnection");
  }
  if (error.status === 404) {
    return translate("magazine:desk.pieceToast.unpublishNotFound");
  }
  return translate("magazine:desk.pieceToast.unpublishServerStatus", {
    status: error.status,
  });
}

/**
 * The detail line under a failed Undo: why the server would not republish.
 * A care gate or readiness refusal names its open items (the same wording the
 * deck editor uses); with none listed it names the gate that refused. Any
 * other failure is explained by `unpublishFailureDetail`.
 */
export function republishFailureDetail(
  error: unknown,
  translate: TFunction,
): string {
  const refusal = readPublishRefusal(error);
  if (refusal === null) return unpublishFailureDetail(error, translate);
  const isCareGate = refusal.code === CARE_GATE_OPEN_CODE;
  if (refusal.openGateItems.length === 0) {
    return translate(
      isCareGate
        ? "magazine:piece.publish.refusedCareGateToast"
        : "magazine:piece.publish.refusedNotReadyToast",
    );
  }
  return isCareGate
    ? translate("magazine:deck.editor.piecePublish.careGateToast", {
        items: refusal.openGateItems.join("; "),
      })
    : translate("magazine:deck.editor.piecePublish.notReadyToast", {
        items: refusal.openGateItems.join(" "),
      });
}
