/**
 * DTO → view adapters for the editor desk. Demo mode already produces
 * `Piece`/`Pitch` view shapes directly from `desk.data.ts`; live mode gets
 * `PieceListItemDto`/`PitchDto` from the backend and must be mapped to the
 * exact same view shape so desk UI components never branch on demoMode.
 */

import type { PieceListItemDto, PieceStage, PitchDto } from "./pieces.api";
import type { Piece, Pitch, Stage } from "../data/desk.data";

/** Backend stage codes → the view's display labels (`STAGE_CLASS`/`DEMO_STAGES` keys). */
export const STAGE_DTO_TO_VIEW: Record<PieceListItemDto["stage"], Stage> = {
  commissioned: "Commissioned",
  drafting: "Drafting",
  in_review: "In review",
  edit: "Edit",
  sensitivity_read: "Sensitivity read",
  layout: "Layout",
  ready: "Ready",
};

/** The view's display stage labels → backend stage codes (inverse of `STAGE_DTO_TO_VIEW`).
 *  Used by the Board layout's `onMove`, which works with the view's `Stage` labels but
 *  `usePieceMutations().moveStage` expects the backend `PieceStage` code. */
export const STAGE_VIEW_TO_DTO: Record<Stage, PieceStage> = {
  Commissioned: "commissioned",
  Drafting: "drafting",
  "In review": "in_review",
  Edit: "edit",
  "Sensitivity read": "sensitivity_read",
  Layout: "layout",
  Ready: "ready",
};

/** The 7 editorial stages in pipeline order — mirrors `DEMO_STAGES`, in the
 *  backend's own codes. Drives "the next stage after this one" (the article
 *  editor's header "Send on" button). */
export const PIECE_STAGE_ORDER: PieceStage[] = [
  "commissioned",
  "drafting",
  "in_review",
  "edit",
  "sensitivity_read",
  "layout",
  "ready",
];

/** The stage right after `stage` in `PIECE_STAGE_ORDER`, or `null` when
 *  already at the last one ("ready" — nothing further to hand off to). */
export function nextPieceStage(stage: PieceStage): PieceStage | null {
  const index = PIECE_STAGE_ORDER.indexOf(stage);
  if (index === -1 || index === PIECE_STAGE_ORDER.length - 1) return null;
  return PIECE_STAGE_ORDER[index + 1] ?? null;
}

/** Maps a backend piece row to the desk UI's `Piece` view shape. */
export function pieceDtoToView(pieceDto: PieceListItemDto): Piece {
  const stage = STAGE_DTO_TO_VIEW[pieceDto.stage];
  const due = stage === "Ready" ? (pieceDto.due ?? "ready") : (pieceDto.due ?? "");

  return {
    id: pieceDto.id,
    title: pieceDto.title,
    format: pieceDto.format,
    section: pieceDto.section,
    kind: pieceDto.kind ?? "",
    byline: pieceDto.byline,
    editorId: pieceDto.editorId,
    stage,
    due,
    late: pieceDto.late,
    words: pieceDto.words ?? undefined,
    slides: pieceDto.slides ?? undefined,
    art: pieceDto.art,
    wait: pieceDto.waitingOn === "nobody" ? undefined : pieceDto.waitingOn,
    fresh: pieceDto.fresh,
    contentsBlurb: pieceDto.contentsBlurb,
    deckId: pieceDto.deckId ?? undefined,
    issueId: pieceDto.issueId,
  };
}

/** Maps a backend pitch row to the desk UI's `Pitch` view shape. */
export function pitchDtoToView(pitchDto: PitchDto): Pitch {
  return {
    id: pitchDto.id,
    title: pitchDto.title,
    byline: pitchDto.from,
    note: pitchDto.note,
    tags: pitchDto.tags,
    fresh: pitchDto.fresh,
    suggest: pitchDto.suggestFormat === "deck" ? "deck" : undefined,
  };
}
