import { STAGE_VIEW_TO_DTO } from "../api/pieces.adapters";
import type { PieceStage } from "../api/pieces.api";
import type { Stage } from "../data/desk.data";

/**
 * Translation keys for the editorial pipeline stages.
 *
 * Both stage types double as English display copy: `Stage` (the view type) IS
 * the label `"Sensitivity read"`, and `STAGE_DTO_TO_VIEW` turns the backend's
 * `"sensitivity_read"` into it. That is how the desk ended up printing a
 * machine-derived English string on screen in every locale. Neither type can
 * change here (they key `STAGE_CLASS`, `DEMO_STAGES` and the board columns),
 * so the translation lives beside them as a lookup resolved at each render
 * site with `t()`.
 *
 * Keyed by the BACKEND code, since that is what live mode and the mutation
 * hooks carry. `viewStageLabelKey` is the way in for the view's English
 * `Stage` labels the demo fixtures are written in.
 */
export const STAGE_LABEL_KEY: Record<PieceStage, string> = {
  commissioned: "magazine:desk.stage.commissioned",
  drafting: "magazine:desk.stage.drafting",
  in_review: "magazine:desk.stage.inReview",
  edit: "magazine:desk.stage.edit",
  sensitivity_read: "magazine:desk.stage.sensitivityRead",
  layout: "magazine:desk.stage.layout",
  ready: "magazine:desk.stage.ready",
  published: "magazine:desk.stage.published",
};

/** The same key, looked up from the view's display `Stage` instead. */
export function viewStageLabelKey(stage: Stage): string {
  return STAGE_LABEL_KEY[STAGE_VIEW_TO_DTO[stage]];
}

/**
 * The two stages a WRITER is told about in different words from the desk.
 *
 * The desk's labels name its own columns, which is the right vocabulary for
 * someone moving pieces between them. A writer is being told where their piece
 * currently sits, so `edit` reads "With your editor" and `layout` reads "In
 * layout". The remaining six stages say the same thing to both, and reusing
 * `STAGE_LABEL_KEY` for those keeps one string per meaning instead of two that
 * can drift apart.
 *
 * The wording comes from `stageToWriterState` in the backend's
 * `magazine-writer-response.ts`, which composed these sentences in English on
 * the server: a Portuguese reader saw "With your editor" on their own
 * assignment card. `WriterAssignmentDto.stage` carries the machine value, so
 * the label is now chosen here.
 */
const WRITER_STAGE_LABEL_OVERRIDE: Partial<Record<PieceStage, string>> = {
  edit: "magazine:writer.work.stage.edit",
  layout: "magazine:writer.work.stage.layout",
};

/** The stage label key as the assigned WRITER should read it. */
export function writerStageLabelKey(stage: PieceStage): string {
  return WRITER_STAGE_LABEL_OVERRIDE[stage] ?? STAGE_LABEL_KEY[stage];
}
