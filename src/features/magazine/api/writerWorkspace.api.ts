import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type {
  ArticleBlock,
  CreatePieceMessageDto,
  PaymentStatus,
  PieceMessageDto,
  PieceStage,
  PitchStatus,
} from "./pieces.api";

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
  /** Full brief detail for "Read the brief" (CNT-6) — writer-safe fields off
   *  `PieceBrief` beyond `note`/`words`/`target`/`terms.killFee` above. */
  wants: string[];
  avoid: string;
  rate: string;
  commissionedBy: string;
  commissionedOn: string;
}

/** GET /magazine/writer/pitches row — mirrors `WriterPitchResponse`. */
export interface WriterPitchDto {
  id: string;
  title: string;
  sent: string;
  /** The triage outcome as the SERVER composed it, in English. Kept as the
   *  fallback for a row that predates `status`; `WriterPitchesTab` composes a
   *  translated label from `status`/`passNote` instead. */
  state: string;
  /** The raw triage status, so the label can be said in the reader's own
   *  language. */
  status: PitchStatus;
  /** The editor's own pass note, verbatim, or `null` when the pitch has not
   *  been passed. Authored text: it is interpolated into a translated
   *  sentence and never rewritten, truncated or looked up in a catalog. */
  passNote: string | null;
  tone: "hold" | "no" | "live";
}

/** GET /magazine/writer/payments row — mirrors `WriterPaymentResponse`. */
export interface WriterPaymentDto {
  title: string;
  /** The issue's DISPLAY number ("09"), which is what every magazine surface
   *  shows and links by. `null` while the piece is unscheduled. */
  issue: string | null;
  /** The issue row id, for a caller that needs to address the row itself. */
  issueId: string | null;
  /** The issue's title, so a payment can read "Issue 09 · The body issue". */
  issueTitle: string | null;
  fee: string;
  /** The composed human sentence ("Paid 14 Jun 2026"), in English, as the
   *  server wrote it. `WriterPaymentsTab` composes a translated equivalent
   *  from the three fields below; this stays as the fallback. */
  state: string;
  /** The raw `magazine_payment.status`, or `null` when no payment row has been
   *  agreed for the piece yet. The payments tab reads THIS to decide the badge
   *  tone; it used to sniff `state` for the word "paid", which is a test that
   *  only works in one language. */
  status: PaymentStatus | null;
  /** `yyyy-mm-dd`, or `null`. */
  dueOn: string | null;
  /** `yyyy-mm-dd`, or `null`. */
  paidOn: string | null;
}

/**
 * GET /magazine/writer/pieces/:id/draft — mirrors `WriterDraftResponse`.
 *
 * PRD-122a. The writer workspace could only ever push text at the desk; there
 * was no route that read the draft back, so a writer never saw the version
 * their editor had actually worked on, and the house term printed on every
 * assignment ("you see them before they ship") was not true.
 */
export interface WriterDraftDto {
  pieceId: string;
  /** `false` when nothing has been drafted yet. `blocks` is then empty and
   *  `version` is `0`, which is the base version the row gets created at. */
  hasDraft: boolean;
  stage: PieceStage;
  title: string;
  standfirst: string;
  blocks: ArticleBlock[];
  /** Live word count of `blocks`. */
  words: number;
  /** The commissioned target off the brief. */
  target: number | null;
  /** What the last filing recorded, which can lag `words` once an editor has
   *  cut or added since. */
  filedWords: number | null;
  /**
   * ENG-111. The article row's optimistic-concurrency counter. Send it back as
   * `FileDraftBody.expectedVersion` when filing: the server answers 409 when
   * the draft moved on, which is what stops a filing from landing on top of an
   * edit the writer never saw. Classify that failure with
   * `isArticleDraftConflict` from `pieces.api.ts`, exactly like the editor.
   */
  version: number;
  updatedAt: string | null;
  publishedAt: string | null;
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

/**
 * How a filing meets the blocks the draft already holds — mirrors the backend
 * `FileDraftMode`. `append` adds the filed text after what is there, minus any
 * run the draft already ends with (so refiling the same draft is a no-op
 * server-side). `replace` makes the filed text the whole body, which is the
 * only way a writer can correct something they already filed; the pre-replace
 * body is snapshotted as an article version first, so it stays recoverable.
 */
export type FileDraftMode = "append" | "replace";

/**
 * Body of `POST /magazine/writer/pieces/:id/file` — mirrors `FileDraftDto`.
 * `blocks` is optional (filing with nothing pasted keeps the old no-body
 * behaviour); when present these are already-converted paragraph blocks
 * (`FileDraftModal` splits the pasted text on blank lines, same rule
 * `ArticleDocument`'s in-editor paste uses).
 */
export interface FileDraftBody {
  blocks?: ArticleBlock[];
  /**
   * ENG-111. The `version` the client last read off `WriterDraftDto`. Filing
   * writes the SAME article row an editor may have open, so without this a
   * filing can silently replace an edit made since the writer loaded the page.
   * A stale value comes back 409 rather than overwriting.
   */
  expectedVersion?: number;
  /** Omitted means `append`, the behaviour filing has always had. */
  mode?: FileDraftMode;
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
  apiPatch<WriterAssignmentDto>(
    `/magazine/writer/pieces/${pieceId}/byline`,
    body,
  );

export const fileDraft = (pieceId: string, body?: FileDraftBody) =>
  apiPost<WriterAssignmentDto>(`/magazine/writer/pieces/${pieceId}/file`, body);

/** PRD-122a. The writer's own read of the draft, ownership asserted
 *  server-side against the authenticated writer (never a client-supplied id),
 *  same as every other route on this controller. */
export const getMyDraft = (pieceId: string) =>
  apiGet<WriterDraftDto>(`/magazine/writer/pieces/${pieceId}/draft`);

// ── Piece messages (Phase 7 Wave F) ─────────────────────────────────────────
// Same `PieceMessageDto` shape as the editor surface (defined once on
// `pieces.api.ts`) — only the base path differs, and access is server-scoped
// to the assigned writer (`magazine-writer.controller.ts`).

export const getWriterPieceMessages = (pieceId: string) =>
  apiGet<PieceMessageDto[]>(`/magazine/writer/pieces/${pieceId}/messages`);

export const postWriterPieceMessage = (
  pieceId: string,
  body: CreatePieceMessageDto,
) =>
  apiPost<PieceMessageDto>(`/magazine/writer/pieces/${pieceId}/messages`, body);
