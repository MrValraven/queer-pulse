import { apiDelete, apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { Slide } from "../data/decks";
import type { ArticleBlock } from "./pieces.api";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Shapes the NestJS magazine domain returns (mirrors
// `queerpulse-backend/src/magazine/magazine-response.ts` / contracts.ts's
// "--- Magazine ---" section verbatim).

export interface AuthorSummaryDTO {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface IssueDTO {
  number: string;
  title: string;
  dek: string;
  /** YYYY-MM-DD, or null while the issue is still unscheduled. */
  publishedOn: string | null;
  coverUrl: string | null;
}

/** A row as returned by GET /magazine/articles (list) — no `body`. */
export interface ArticleListItemDTO {
  slug: string;
  title: string;
  dek: string;
  author: AuthorSummaryDTO;
  issueNumber: string | null;
  tags: string[];
  readMinutes: number;
  /** ISO 8601, or null for an unpublished/web-only piece. */
  publishedAt: string | null;
}

/** Full article detail from GET /magazine/articles/:slug. */
export interface ArticleDTO extends ArticleListItemDTO {
  /** Plain text, paragraphs separated by blank lines. */
  body: string;
  /**
   * Block-based body (Phase 3 §7.3), sourced from the block editor's jsonb
   * `blocks` column. Empty on articles that predate the block editor — the
   * reader falls back to `body` in that case (see `ArticlePage.tsx`).
   */
  blocks: ArticleBlock[];
  standfirst: string;
  kicker: string;
  section: string;
}

export interface ArticlesPage {
  items: ArticleListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthorDTO {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

/** A row as returned by GET /magazine/sections (CNT-20) — the seeded
 *  section/topic taxonomy (mirrors `magazine-response.ts` `SectionResponse`). */
export interface SectionDTO {
  id: string;
  name: string;
  target: number;
  note: string;
  orderIndex: number;
}

export type SubmissionStatus =
  "draft" | "submitted" | "in_review" | "accepted" | "rejected" | "published";

export interface StorySubmissionDTO {
  id: string;
  format: string;
  workingTitle: string;
  pitch: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface CreateStorySubmissionDto {
  format: string;
  workingTitle: string;
  pitch: string;
}

/** A row as returned by GET /magazine/decks (list) — no `authorBio`/`related`/`slides`. */
export interface DeckListItemDTO {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  section: string;
  byline: string;
  role: string | null;
  readTime: string;
  cover: string;
  coverDesc: string;
  tags: string[];
  /** ISO 8601, or null for an unpublished/draft deck. */
  publishedAt: string | null;
}

/** Full deck detail from GET /magazine/decks/:slug. */
export interface DeckDTO extends DeckListItemDTO {
  authorBio: string;
  related: string[];
  slides: Slide[];
}

export interface DecksPage {
  items: DeckListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Admin request DTOs ──────────────────────────────────────────────────────
// Bodies for the moderator/admin-only authoring endpoints (mirrors
// `queerpulse-backend/src/magazine/dto/{create,update}-deck.dto.ts`).

export interface CreateDeckDto {
  slug: string;
  title: string;
  kicker?: string;
  section?: string;
  byline?: string;
  role?: string;
  authorBio?: string;
  cover?: string;
  coverDesc?: string;
  readTime?: string;
  tags?: string[];
  related?: string[];
  slides: Slide[];
}

/** `PATCH /magazine/admin/decks/:id` — every creation field patchable, plus `published`. */
export type UpdateDeckDto = Partial<CreateDeckDto> & { published?: boolean };

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getIssues = () => apiGet<IssueDTO[]>("/magazine/issues");

export const getIssue = (number: string) =>
  apiGet<IssueDTO>(`/magazine/issues/${number}`);

export function getArticles(
  params: {
    issue?: string;
    tag?: string;
    author?: string;
    /** `magazine_section.name` — CNT-20 section/topic browse drill-down. */
    section?: string;
    page?: number;
  } = {},
) {
  const q = new URLSearchParams();
  if (params.issue) q.set("issue", params.issue);
  if (params.tag) q.set("tag", params.tag);
  if (params.author) q.set("author", params.author);
  if (params.section) q.set("section", params.section);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<ArticlesPage>(`/magazine/articles${qs ? `?${qs}` : ""}`);
}

export const getArticle = (slug: string) =>
  apiGet<ArticleDTO>(`/magazine/articles/${slug}`);

export const getAuthor = (slug: string) =>
  apiGet<AuthorDTO>(`/magazine/authors/${slug}`);

/** GET /magazine/authors — every author who has ever published, list order
 *  is by name (see `MagazineService.listAuthors`). */
export const getAuthors = () => apiGet<AuthorDTO[]>("/magazine/authors");

/** GET /magazine/sections (CNT-20) — the seeded section/topic taxonomy,
 *  ordered for display (see `MagazineService.listSections`). */
export const getSections = () => apiGet<SectionDTO[]>("/magazine/sections");

export const createStorySubmission = (dto: CreateStorySubmissionDto) =>
  apiPost<StorySubmissionDTO>("/magazine/submissions", dto);

/** GET /magazine/submissions/mine — the caller's own pitches. */
export const getMySubmissions = () =>
  apiGet<StorySubmissionDTO[]>("/magazine/submissions/mine");

export function getDecks(params: { tag?: string; page?: number } = {}) {
  const q = new URLSearchParams();
  if (params.tag) q.set("tag", params.tag);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<DecksPage>(`/magazine/decks${qs ? `?${qs}` : ""}`);
}

export const getDeck = (slug: string) =>
  apiGet<DeckDTO>(`/magazine/decks/${slug}`);

// ── Admin (moderator/admin-only) calls ──────────────────────────────────────
// `AdminMagazineDecksController` — distinct route prefix from the public
// `magazine/decks` reads above; drafts included, id-addressed not slug-addressed.

/** GET /magazine/admin/decks — every deck, drafts included; a bare array (not paginated). */
export const getAdminDecks = () =>
  apiGet<DeckListItemDTO[]>("/magazine/admin/decks");

export const getAdminDeck = (id: string) =>
  apiGet<DeckDTO>(`/magazine/admin/decks/${id}`);

export const createDeck = (dto: CreateDeckDto) =>
  apiPost<DeckDTO>("/magazine/admin/decks", dto);

export const updateDeck = (id: string, dto: UpdateDeckDto) =>
  apiPatch<DeckDTO>(`/magazine/admin/decks/${id}`, dto);

export const deleteDeck = (id: string) =>
  apiDelete<void>(`/magazine/admin/decks/${id}`);

/** CNT-6 "Convert" — one-way, one-time deck→article transform. Returns the
 *  piece and newly created article ids (for navigating to the article
 *  editor), plus which slides (if any) had no article-block equivalent and
 *  were dropped, so the caller can surface an honest partial-success toast. */
export interface ConvertDeckToArticleDto {
  pieceId: string;
  articleId: string;
  droppedSlideKinds: string[];
}

export const convertDeckToArticle = (id: string) =>
  apiPost<ConvertDeckToArticleDto>(`/magazine/admin/decks/${id}/convert-to-article`);
