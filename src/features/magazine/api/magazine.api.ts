import { apiGet, apiPost } from "../../../shared/api/client";

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
  /** YYYY-MM-DD */
  publishedOn: string;
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

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export const getIssues = () => apiGet<IssueDTO[]>("/magazine/issues");

export const getIssue = (number: string) =>
  apiGet<IssueDTO>(`/magazine/issues/${number}`);

export function getArticles(
  params: { issue?: string; tag?: string; author?: string; page?: number } = {},
) {
  const q = new URLSearchParams();
  if (params.issue) q.set("issue", params.issue);
  if (params.tag) q.set("tag", params.tag);
  if (params.author) q.set("author", params.author);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<ArticlesPage>(`/magazine/articles${qs ? `?${qs}` : ""}`);
}

export const getArticle = (slug: string) =>
  apiGet<ArticleDTO>(`/magazine/articles/${slug}`);

export const getAuthors = () => apiGet<AuthorDTO[]>("/magazine/authors");

export const getAuthor = (slug: string) =>
  apiGet<AuthorDTO>(`/magazine/authors/${slug}`);

export const createStorySubmission = (dto: CreateStorySubmissionDto) =>
  apiPost<StorySubmissionDTO>("/magazine/submissions", dto);

/** GET /magazine/submissions/mine — the caller's own pitches. */
export const getMySubmissions = () =>
  apiGet<StorySubmissionDTO[]>("/magazine/submissions/mine");
