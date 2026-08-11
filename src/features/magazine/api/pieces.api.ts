import { apiDelete, apiGet, apiPatch, apiPost } from "../../../shared/api/client";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Shapes the NestJS magazine editor-desk domain returns/accepts (mirrors
// `queerpulse-backend/src/magazine/magazine-piece-response.ts`,
// `entities/magazine-piece.entity.ts`, `entities/magazine-pitch.entity.ts`,
// and `dto/{list-pieces.query,create-piece,update-piece,create-pitch,
// triage-pitch}.ts` verbatim).

export type PieceFormat = "article" | "deck";

export type PieceStage =
  | "commissioned"
  | "drafting"
  | "in_review"
  | "edit"
  | "sensitivity_read"
  | "layout"
  | "ready";

export type PitchStatus = "waiting" | "maybe" | "passed" | "commissioned";

export type WaitingOn = "writer" | "you" | "nobody";

/** Mirrors backend `ArtState` (`magazine-piece.entity.ts`). */
export type ArtState = "none" | "brief" | "in" | "na";

export type SavedViewId = "v-late" | "v-art" | "v-sens" | "v-pay";

export type PitchVerdict = "maybe" | "pass" | "commission";

/** jsonb shape stored on `MagazinePiece.brief` (validated by hand on the backend). */
export interface PieceBrief {
  angle: string;
  wants: string[];
  avoid: string;
  wordCount: number | null;
  filedWords: number | null;
  rate: string;
  killFee: string;
  commissionedBy: string;
  commissionedOn: string;
  art: string;
}

/** One subject entry inside `PieceCare.subjects`. */
export interface PieceCareSubject {
  name: string;
  named: boolean;
  out: boolean | null;
  consent: "given" | "pending" | "pseudonym";
  reply: string;
  note: string;
}

/** jsonb shape stored on `MagazinePiece.care` (validated by hand on the backend). */
export interface PieceCare {
  subjects: PieceCareSubject[];
  contentNotes: string[];
  flags: { key: string; on: boolean; note: string }[];
  read: {
    readerId?: string;
    reader: string;
    role: string;
    status: string;
    askedOn: string;
    dueOn: string;
    checks: { label: string; done: boolean }[];
  } | null;
}

/** A row as returned by GET /magazine/admin/pieces (list) — mirrors `PieceListItem`. */
export interface PieceListItemDto {
  id: string;
  format: PieceFormat;
  title: string;
  section: string;
  kind: string | null;
  byline: string;
  editorId: string;
  writerId: string | null;
  stage: PieceStage;
  due: string | null;
  late: boolean;
  waitingOn: WaitingOn;
  words: number | null;
  slides: number | null;
  art: ArtState;
  fresh: boolean;
  issueId: string | null;
  articleId: string | null;
  deckId: string | null;
  /** The one-sentence issue-contents blurb the desk writes per piece (Task B2a). */
  contentsBlurb: string;
}

/** One row of the "have we run this before?" archive search — mirrors backend `ArchiveEntryResponse`. */
export interface ArchiveEntryDto {
  title: string;
  issue: string | null;
  by: string;
  tags: string[];
}

/** A pitch row from GET /magazine/admin/pitches — mirrors `PitchResponse`. */
export interface PitchDto {
  id: string;
  title: string;
  from: string;
  note: string;
  tags: string[];
  suggestFormat: PieceFormat | null;
  status: PitchStatus;
  fresh: boolean;
}

/** One row of the piece audit trail — mirrors `PieceAuditEntry`. */
export interface PieceAuditEntryDto {
  actorId: string | null;
  action: string;
  detail: string | null;
  createdAt: string;
}

/** `MagazinePayment.status` — mirrors backend `PaymentStatus`. */
export type PaymentStatus = "agreed" | "approved_unpaid" | "paid";

/** The 1:1 payment row for a piece — mirrors `PaymentResponse`. */
export interface PaymentDto {
  fee: string;
  expenses: string | null;
  invoice: string | null;
  filedOn: string | null;
  terms: string;
  dueOn: string | null;
  status: PaymentStatus;
  paidOn: string | null;
}

/** A reader letter about a piece — mirrors `LetterResponse`. */
export interface LetterDto {
  id: string;
  who: string;
  body: string;
  runInLetters: boolean;
  createdAt: string;
}

/** A published correction on a piece — mirrors `CorrectionResponse`. */
export interface CorrectionDto {
  id: string;
  text: string;
  publishedOn: string | null;
  createdAt: string;
}

/** One row of the publish gate — mirrors `PublishGateItem`. */
export interface PublishGateItemDto {
  label: string;
  done: boolean;
}

/** GET /magazine/admin/desk-summary — mirrors `DeskSummary`. */
export interface DeskSummaryDto {
  stageLoad: { stage: PieceStage; count: number }[];
  editorLoad: { editorId: string; count: number; cap: number }[];
  activity: PieceAuditEntryDto[];
}

/**
 * A row from GET /magazine/admin/notifications — mirrors
 * `MagazineNotificationResponse` (the "Since Friday" desk activity panel,
 * built from the real `magazine_piece_event` log). Newest-first, ~20 rows.
 * `who` is a resolved display name or "An editor"/"System" — never an email
 * or raw uuid. `route` is already a real FE path (e.g.
 * `/magazine/editor/piece/:id`), not an enum key. `tone` is `'warn'` for
 * payment/late/kill-fee-shaped events, `'normal'` otherwise.
 */
export interface MagazineNotificationDto {
  id: string;
  who: string;
  what: string;
  when: string;
  route: string;
  tone: "normal" | "warn";
}

/**
 * A row from GET /magazine/admin/editors — mirrors `MagazineEditorResponse`.
 * Hand-mapped on the backend from `Profile` only: no `email`/`googleId`/
 * `role` leak from `User`.
 */
export interface MagazineEditorDto {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

/**
 * GET /magazine/admin/issues/current — mirrors `CurrentIssueSummary`. `null`
 * before any issue exists yet.
 */
export interface CurrentIssueDto {
  id: string;
  number: string;
  theme: string;
  filled: number;
  slots: number;
}

/**
 * Full piece detail from GET/POST/PATCH /magazine/admin/pieces/:id — mirrors
 * `PieceRecordFull` (brief/care/audit from Phase 1, `payment`/`letters`/
 * `corrections`/`publishGate` added in Phase 2).
 */
export interface PieceRecordDto extends PieceListItemDto {
  brief: PieceBrief | null;
  care: PieceCare | null;
  audit: PieceAuditEntryDto[];
  payment: PaymentDto | null;
  letters: LetterDto[];
  corrections: CorrectionDto[];
  publishGate: PublishGateItemDto[];
}

// ── Article draft (Phase 3 block editor) ────────────────────────────────
// FE view of the jsonb `blocks` column on `magazine_article`, mirroring the
// backend's discriminated `ArticleBlock` union
// (`queerpulse-backend/src/magazine/entities/magazine-article.entity.ts`) and
// the `ArticleDraftResponse` shape
// (`queerpulse-backend/src/magazine/magazine-piece-response.ts`).

export type ArticleImageRights = "commissioned" | "licensed" | "courtesy" | "cc";
export type ArticleImageTint = "coral" | "jade" | "plum" | "violet";
export type ArticleImageCrop = "16:9" | "4:5" | "1:1";

export interface ArticleParagraphBlock {
  id: string;
  kind: "paragraph";
  html: string;
  lead?: boolean;
}

export interface ArticleHeadingBlock {
  id: string;
  kind: "heading";
  html: string;
}

export interface ArticlePullQuoteBlock {
  id: string;
  kind: "pullQuote";
  html: string;
}

export interface ArticleQuoteBlock {
  id: string;
  kind: "quote";
  html: string;
  cite: string;
}

export interface ArticleImageBlock {
  id: string;
  kind: "image";
  alt: string;
  caption: string;
  credit: string;
  rights: ArticleImageRights;
  tint: ArticleImageTint;
  crop: ArticleImageCrop;
  focal: { x: number; y: number };
  src?: string;
}

export interface ArticleQaBlock {
  id: string;
  kind: "qa";
  q: string;
  html: string;
  who: string;
}

export interface ArticleStatsItem {
  value: string;
  label: string;
}

export interface ArticleStatsBlock {
  id: string;
  kind: "stats";
  items: ArticleStatsItem[];
}

/** Discriminated union of every renderable article block kind. */
export type ArticleBlock =
  | ArticleParagraphBlock
  | ArticleHeadingBlock
  | ArticlePullQuoteBlock
  | ArticleQuoteBlock
  | ArticleImageBlock
  | ArticleQaBlock
  | ArticleStatsBlock;

/**
 * The block-based article draft behind a piece's `articleId` — mirrors
 * backend `ArticleDraftResponse`. `readMinutes` is server-derived
 * (`ceil(words/220)`, minimum 1) and read-only from the FE's perspective.
 */
export interface ArticleDraftDto {
  id: string;
  slug: string;
  title: string;
  standfirst: string;
  kicker: string;
  section: string;
  tags: string[];
  contentNotes: string[];
  blocks: ArticleBlock[];
  readMinutes: number;
  publishedAt: string | null;
}

/** Body of `PATCH /magazine/admin/pieces/:id/article` — mirrors `UpdateArticleDto`. */
export type UpdateArticleDraftDto = Partial<
  Pick<
    ArticleDraftDto,
    "title" | "standfirst" | "kicker" | "section" | "tags" | "contentNotes" | "blocks"
  >
>;

// ── Admin request bodies ─────────────────────────────────────────────────
// Bodies for the editor-only `AdminMagazinePiecesController` endpoints
// (mirrors `dto/{list-pieces.query,create-piece,update-piece,create-pitch,
// triage-pitch}.ts`).

/** Query params for `GET /magazine/admin/pieces` — every field optional. */
export interface ListPiecesFilters {
  format?: PieceFormat;
  editor?: string;
  stage?: PieceStage;
  section?: string;
  issue?: string;
  q?: string;
  savedView?: SavedViewId;
}

/** Body of `POST /magazine/admin/pieces`. */
export interface CreatePieceDto {
  format: PieceFormat;
  title: string;
  section: string;
  editorId: string;
  writerId?: string;
  dueOn?: string;
  wordTarget?: number;
  slideTarget?: number;
  pitchId?: string;
  fresh?: boolean;
  byline?: string;
  kind?: string;
  issueId?: string;
  contentsBlurb?: string;
}

/**
 * Body of `PATCH /magazine/admin/pieces/:id` — every creation field
 * patchable, plus workflow fields that only make sense post-commission.
 */
export type UpdatePieceDto = Omit<Partial<CreatePieceDto>, "issueId"> & {
  stage?: PieceStage;
  brief?: unknown;
  care?: unknown;
  orderIndex?: number;
  pages?: string;
  laidOut?: boolean;
  /** Widened from the inherited `issueId?: string` (via `Omit` — an
   *  intersection alone can't loosen `Partial<CreatePieceDto>`'s `string`) so
   *  the desk can detach a piece back to a standalone highlight by sending
   *  `{ issueId: null }` (mirrors backend B2 — accepts a UUID or null). */
  issueId?: string | null;
};

/** Body of `PATCH /magazine/admin/pieces/:id/payment` — every field patchable. */
export interface UpdatePaymentDto {
  fee?: string;
  expenses?: string;
  invoice?: string;
  filedOn?: string;
  terms?: string;
  dueOn?: string;
  status?: PaymentStatus;
  paidOn?: string;
}

/** Body of `POST /magazine/admin/pieces/:id/letters`. */
export interface CreateLetterDto {
  who: string;
  body: string;
  runInLetters?: boolean;
}

/** Body of `POST /magazine/admin/pieces/:id/corrections`. */
export interface CreateCorrectionDto {
  text: string;
  publishedOn?: string;
}

/** Body of `POST /magazine/admin/pitches`. */
export interface CreatePitchDto {
  title: string;
  from: string;
  note: string;
  tags?: string[];
  suggestFormat?: PieceFormat;
  fresh?: boolean;
  issueId?: string;
}

/**
 * Body of `PATCH /magazine/admin/pitches/:id`. `verdict` drives which of the
 * remaining fields matter: `pass` reads `passTemplate`/`passNote`;
 * `commission` reads the commission subset; `maybe` reads neither.
 */
export interface TriagePitchDto {
  verdict: PitchVerdict;
  passTemplate?: string;
  passNote?: string;
  editorId?: string;
  section?: string;
  format?: PieceFormat;
  dueOn?: string;
  wordTarget?: number;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export function getPieces(filters: ListPiecesFilters = {}) {
  const query = new URLSearchParams();
  if (filters.format) query.set("format", filters.format);
  if (filters.editor) query.set("editor", filters.editor);
  if (filters.stage) query.set("stage", filters.stage);
  if (filters.section) query.set("section", filters.section);
  if (filters.issue) query.set("issue", filters.issue);
  if (filters.q) query.set("q", filters.q);
  if (filters.savedView) query.set("savedView", filters.savedView);
  const queryString = query.toString();
  return apiGet<PieceListItemDto[]>(
    `/magazine/admin/pieces${queryString ? `?${queryString}` : ""}`,
  );
}

export const getPiece = (id: string) =>
  apiGet<PieceRecordDto>(`/magazine/admin/pieces/${id}`);

export const createPiece = (body: CreatePieceDto) =>
  apiPost<PieceRecordDto>("/magazine/admin/pieces", body);

export const updatePiece = (id: string, body: UpdatePieceDto) =>
  apiPatch<PieceRecordDto>(`/magazine/admin/pieces/${id}`, body);

export const deletePiece = (id: string) =>
  apiDelete<void>(`/magazine/admin/pieces/${id}`);

export const getPitches = () => apiGet<PitchDto[]>("/magazine/admin/pitches");

export const createPitch = (body: CreatePitchDto) =>
  apiPost<PitchDto>("/magazine/admin/pitches", body);

/** Triaging as `commission` returns the newly created `PieceRecordDto`; `maybe`/`pass` return the updated `PitchDto`. */
export const triagePitch = (id: string, body: TriagePitchDto) =>
  apiPatch<PitchDto | PieceRecordDto>(`/magazine/admin/pitches/${id}`, body);

export const getDeskSummary = () =>
  apiGet<DeskSummaryDto>("/magazine/admin/desk-summary");

export const getMagazineEditors = () =>
  apiGet<MagazineEditorDto[]>("/magazine/admin/editors");

export const getMagazineNotifications = () =>
  apiGet<MagazineNotificationDto[]>("/magazine/admin/notifications");

export const getCurrentIssue = () =>
  apiGet<CurrentIssueDto | null>("/magazine/admin/issues/current");

export const updatePayment = (id: string, body: UpdatePaymentDto) =>
  apiPatch<PaymentDto>(`/magazine/admin/pieces/${id}/payment`, body);

export const getLetters = (id: string) =>
  apiGet<LetterDto[]>(`/magazine/admin/pieces/${id}/letters`);

export const addLetter = (id: string, body: CreateLetterDto) =>
  apiPost<LetterDto>(`/magazine/admin/pieces/${id}/letters`, body);

/** PATCH /magazine/admin/pieces/:id/letters/:letterId — toggle an existing
 *  letter's `runInLetters` flag. Idempotent: it updates the same row, it
 *  never creates a duplicate letter. */
export const updateLetter = (id: string, letterId: string, runInLetters: boolean) =>
  apiPatch<LetterDto>(`/magazine/admin/pieces/${id}/letters/${letterId}`, { runInLetters });

export const getArchive = (q: string) =>
  apiGet<ArchiveEntryDto[]>(
    `/magazine/admin/archive${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`,
  );

export const addCorrection = (id: string, body: CreateCorrectionDto) =>
  apiPost<CorrectionDto>(`/magazine/admin/pieces/${id}/corrections`, body);

export const getArticleDraft = (pieceId: string) =>
  apiGet<ArticleDraftDto>(`/magazine/admin/pieces/${pieceId}/article`);

export const updateArticleDraft = (pieceId: string, body: UpdateArticleDraftDto) =>
  apiPatch<ArticleDraftDto>(`/magazine/admin/pieces/${pieceId}/article`, body);

// ── Article comments (Phase 7 Wave D — threaded, resolvable NotesRail) ─────
// Mirrors backend `ArticleCommentResponse` (`magazine-article-comment-response.ts`).

/**
 * One node of the NotesRail comment thread: a top-level comment or a reply.
 * `replies` is recursive in shape but in practice one level deep — a reply
 * always targets a top-level comment, never another reply (see the backend's
 * own doc comment on `ArticleCommentResponse`). The two mutation endpoints
 * (add/reply/resolve) always return their single row with `replies: []` even
 * when the underlying comment has replies in the database — callers must
 * refetch the list (`useArticleComments`'s query) rather than trust that
 * field on a mutation response.
 */
export interface ArticleCommentDto {
  id: string;
  blockId: string | null;
  parentId: string | null;
  author: string;
  body: string;
  resolved: boolean;
  createdAt: string;
  replies: ArticleCommentDto[];
}

/** Body of `POST /magazine/admin/pieces/:id/comments`. */
export interface CreateArticleCommentDto {
  body: string;
  blockId?: string;
}

/** Body of `POST /magazine/admin/comments/:commentId/reply`. */
export interface ReplyArticleCommentDto {
  body: string;
}

export const getArticleComments = (pieceId: string) =>
  apiGet<ArticleCommentDto[]>(`/magazine/admin/pieces/${pieceId}/comments`);

export const addArticleComment = (pieceId: string, body: CreateArticleCommentDto) =>
  apiPost<ArticleCommentDto>(`/magazine/admin/pieces/${pieceId}/comments`, body);

export const replyToArticleComment = (commentId: string, body: ReplyArticleCommentDto) =>
  apiPost<ArticleCommentDto>(`/magazine/admin/comments/${commentId}/reply`, body);

export const resolveArticleComment = (commentId: string, resolved: boolean) =>
  apiPatch<ArticleCommentDto>(`/magazine/admin/comments/${commentId}/resolve`, { resolved });

// ── Article versions (Phase 7 Wave E — snapshot + restore + diff VersionsRail) ─
// Mirrors backend `ArticleVersionSummaryResponse`/`ArticleVersionDetailResponse`
// (`magazine-article-version-response.ts`). The list/summary shape omits
// `blocks` entirely (kept light for the rail); the single-version detail adds
// them, for the diff view only.

export interface ArticleVersionSummaryDto {
  id: string;
  label: string;
  /** Resolved display name, or "Someone on the team" for a system snapshot
   *  with no author — never a raw uuid/email (see the Wave E backend review). */
  author: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** A single version WITH its full block snapshot, for `VersionDiff`. */
export interface ArticleVersionDetailDto extends ArticleVersionSummaryDto {
  blocks: ArticleBlock[];
}

/** Body of `POST /magazine/admin/pieces/:id/versions` — "save a version now". */
export interface CreateArticleVersionDto {
  label?: string;
}

export const getArticleVersions = (pieceId: string) =>
  apiGet<ArticleVersionSummaryDto[]>(`/magazine/admin/pieces/${pieceId}/versions`);

export const getArticleVersion = (versionId: string) =>
  apiGet<ArticleVersionDetailDto>(`/magazine/admin/versions/${versionId}`);

export const createArticleVersion = (pieceId: string, label?: string) =>
  apiPost<ArticleVersionSummaryDto>(
    `/magazine/admin/pieces/${pieceId}/versions`,
    label ? { label } : {},
  );

/** No request body — the backend snapshots the pre-restore state itself
 *  ("Before restore") before applying, then records the restore as a new
 *  version too, so nothing is ever lost. Returns the article draft AFTER
 *  restore (same shape as `getArticleDraft`/`updateArticleDraft`), so the
 *  caller can seed the editor straight from this response. */
export const restoreArticleVersion = (pieceId: string, versionId: string) =>
  apiPost<ArticleDraftDto>(`/magazine/admin/pieces/${pieceId}/versions/${versionId}/restore`);

// ── Piece messages (Phase 7 Wave F — editor↔writer per-piece thread) ──────
// Mirrors backend `PieceMessageResponse` (`magazine-piece-message-response.ts`).
// SAME shape on both the editor (`/magazine/admin`) and writer
// (`/magazine/writer`) surfaces — defined ONCE here and imported by
// `writerWorkspace.api.ts` rather than duplicated, since a writer's own
// message-thread DTOs need it too.

/**
 * One message in a piece's editor↔writer thread. `fromMe` and `author` are
 * both server-computed against the requester — `fromMe` is never derived
 * client-side, and `author` is a resolved display name, never a raw
 * id/email. List order is `createdAt` ASC (oldest first, chat order).
 */
export interface PieceMessageDto {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  fromMe: boolean;
}

/** Body of `POST /magazine/{admin,writer}/pieces/:id/messages`. */
export interface CreatePieceMessageDto {
  body: string;
}

export const getEditorPieceMessages = (pieceId: string) =>
  apiGet<PieceMessageDto[]>(`/magazine/admin/pieces/${pieceId}/messages`);

export const postEditorPieceMessage = (pieceId: string, body: CreatePieceMessageDto) =>
  apiPost<PieceMessageDto>(`/magazine/admin/pieces/${pieceId}/messages`, body);
