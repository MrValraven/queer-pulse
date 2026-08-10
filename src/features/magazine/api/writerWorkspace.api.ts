import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { CreatePieceMessageDto, PieceMessageDto, PieceStage } from "./pieces.api";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/magazine-writer-response.ts`
// (`WriterAssignmentResponse`/`WriterPitchResponse`/`WriterPaymentResponse`) —
// SEPARATE from the editor `pieces.api.ts` DTOs: a writer must never receive
// other contributors' data, the editor "viewing as" roster, or internal
// editor notes/comments (enforced server-side by a dedicated mapper).

/** `WriterAssignmentDto.terms` — the commission terms the writer agreed to. */
export interface WriterAssignmentTerms {
  killFee: string;
  rights: string;
  edits: string;
}

/** GET /magazine/writer/assignments row — mirrors `WriterAssignmentResponse`. */
export interface WriterAssignmentDto {
  id: string;
  title: string;
  section: string;
  due: string | null;
  state: string;
  stage: PieceStage;
  words: number | null;
  target: number | null;
  fee: string;
  pay: string;
  note: string;
  byline: string;
  terms: WriterAssignmentTerms;
}

/** GET /magazine/writer/pitches row — mirrors `WriterPitchResponse`. */
export interface WriterPitchDto {
  id: string;
  title: string;
  sent: string;
  state: string;
  tone: "hold" | "no" | "live";
}

/** GET /magazine/writer/payments row — mirrors `WriterPaymentResponse`. */
export interface WriterPaymentDto {
  title: string;
  issue: string | null;
  fee: string;
  state: string;
}

/** Body of `POST /magazine/writer/pitches` — mirrors `SubmitPitchDto`. */
export interface SubmitWriterPitchDto {
  title: string;
  note: string;
  tags?: string[];
}

/** Body of `PATCH /magazine/writer/pieces/:id/byline` — mirrors `UpdateBylineDto`. */
export interface UpdateWriterBylineDto {
  byline: string;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getMyAssignments = () =>
  apiGet<WriterAssignmentDto[]>("/magazine/writer/assignments");

export const getMyPitches = () =>
  apiGet<WriterPitchDto[]>("/magazine/writer/pitches");

export const submitPitch = (body: SubmitWriterPitchDto) =>
  apiPost<WriterPitchDto>("/magazine/writer/pitches", body);

export const getMyPayments = () =>
  apiGet<WriterPaymentDto[]>("/magazine/writer/payments");

export const updateMyByline = (pieceId: string, body: UpdateWriterBylineDto) =>
  apiPatch<WriterAssignmentDto>(`/magazine/writer/pieces/${pieceId}/byline`, body);

export const fileDraft = (pieceId: string) =>
  apiPost<WriterAssignmentDto>(`/magazine/writer/pieces/${pieceId}/file`);

// ── Piece messages (Phase 7 Wave F) ─────────────────────────────────────────
// Same `PieceMessageDto` shape as the editor surface (defined once on
// `pieces.api.ts`) — only the base path differs, and access is server-scoped
// to the assigned writer (`magazine-writer.controller.ts`).

export const getWriterPieceMessages = (pieceId: string) =>
  apiGet<PieceMessageDto[]>(`/magazine/writer/pieces/${pieceId}/messages`);

export const postWriterPieceMessage = (pieceId: string, body: CreatePieceMessageDto) =>
  apiPost<PieceMessageDto>(`/magazine/writer/pieces/${pieceId}/messages`, body);
