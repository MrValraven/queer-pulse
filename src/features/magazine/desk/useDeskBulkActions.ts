/**
 * The desk bulk bar's handler helpers: what "Change stage" and "Hand off"
 * actually do with a selection, kept out of `DeskBulkBar` so that component
 * stays a thin render of props (mirrors `useDeskPieceActions` /
 * `useDeskModals`). `EditorDashboardView` wires these to `DeskBulkBar`'s
 * `onChangeStage` / `onHandOff` callbacks, each closed over the current
 * `selectedPieces`.
 *
 * "Chase" is not a hook method: see `chaseQueueForSelection` below, a pure
 * function `DeskBulkBar` itself calls to build the queue it hands to
 * `onChaseAll`.
 */

import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import { STAGE_VIEW_TO_DTO } from "../api/pieces.adapters";
import type { usePieceMutations } from "../api/usePieceMutations";
import { viewStageLabelKey } from "./stageLabels";

export interface UseDeskBulkActionsParams {
  /** `usePieceMutations().moveStage`, awaited per piece (rather than the
   *  fire-and-forget `useDeskPieceActions().movePiece`) so the toast can wait
   *  for every request to settle and report how many actually landed. */
  moveStage: ReturnType<typeof usePieceMutations>["moveStage"];
  /** `useDeskModals().openHandoff`, which opens the single-piece editor
   *  picker. */
  openHandoff: (piece: Piece) => void;
}

export interface UseDeskBulkActionsResult {
  changeStageForSelection: (pieces: Piece[], stage: Stage) => void;
  handOffSelection: (pieces: Piece[]) => void;
}

/**
 * The selected pieces actually waiting on a writer, in table order:
 * `DeskBulkBar`'s chase queue. Pure (no hook, no dependency on `useToast` /
 * `useTranslation`), since it only picks the pieces; `DeskBulkBar` calls
 * this itself to build the argument it hands to `onChaseAll`, and the
 * count this returns is what keeps "Chase {count}" true. The label always
 * names exactly the pieces the queue works through next, one `ChaseModal`
 * at a time ("Chase {current} of {total}", with Skip), so a click always
 * chases the number it claims.
 * `Published` is terminal (see `Stage`'s doc comment) and excluded here
 * defensively, even though every real data path already clears `wait` once
 * a piece leaves the pipeline.
 */
export function chaseQueueForSelection(pieces: Piece[]): Piece[] {
  return pieces.filter(
    (piece) => piece.wait === "writer" && piece.stage !== "Published",
  );
}

export function useDeskBulkActions({
  moveStage,
  openHandoff,
}: UseDeskBulkActionsParams): UseDeskBulkActionsResult {
  const { showToast } = useToast();
  const { t } = useTranslation();

  /**
   * Moves every selected piece not already at `stage` there, one PATCH per
   * piece, and waits for every one to settle before toasting: a request that
   * is still in flight has not moved anything yet, so a toast that fires
   * before they answer can claim a count the desk has not actually reached.
   * `Published` is terminal (a piece reaches it only by being published; see
   * `Stage`'s doc comment), so a piece already published is left alone rather
   * than silently PATCHed back out of it.
   */
  function changeStageForSelection(pieces: Piece[], stage: Stage): void {
    const targets = pieces.filter(
      (piece) => piece.stage !== "Published" && piece.stage !== stage,
    );
    if (targets.length === 0) return;
    void Promise.allSettled(
      targets.map((piece) =>
        moveStage.mutateAsync({
          id: piece.id,
          stage: STAGE_VIEW_TO_DTO[stage],
        }),
      ),
    ).then((results) => {
      const settledCount = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const stageLabel = t(viewStageLabelKey(stage));
      if (settledCount > 0) {
        showToast(
          t("magazine:desk.bulk.stageChangedToast", {
            count: settledCount,
            stage: stageLabel,
          }),
          "success",
        );
      }
      const failedCount = results.length - settledCount;
      if (failedCount > 0) {
        showToast(
          t("magazine:desk.bulk.stageChangeFailedToast", {
            count: failedCount,
            stage: stageLabel,
          }),
          "error",
        );
      }
    });
  }

  /**
   * `HandoffModal` and the desk's overlay state (`DeskModal`'s `handoff`
   * variant, `useDeskModals`'s single `contextId`) only carry one piece;
   * extending them to a whole selection touches files outside this task's
   * boundary. `DeskBulkBar` is the real gate here (it only shows "Hand off"
   * for a one-piece selection); this repeats the same check as a defensive
   * backstop, in case a future caller invokes `handOffSelection` directly.
   * That gate is `DeskBulkBar`'s own `canHandOff = count === 1`.
   */
  function handOffSelection(pieces: Piece[]): void {
    const [onlyPiece] = pieces;
    if (pieces.length === 1 && onlyPiece) openHandoff(onlyPiece);
  }

  return { changeStageForSelection, handOffSelection };
}
