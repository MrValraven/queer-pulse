import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { ArticleLifecycle, ContentLocale } from "./magazine.api";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/magazine-lifecycle-response.ts`.

/**
 * CON-16 — one published piece as the lifecycle desk sees it. Distinct from
 * the reader-facing notice on the article: this carries the desk's own handles
 * (`pieceId`, so a row opens in the editor) and the derived day count an
 * editor triages by.
 */
export interface ArticleLifecycleRecordDTO {
  articleId: string;
  /** The desk record behind this article, or null for a row with no piece
   *  (seeded or imported), which is readable but not editable at the desk. */
  pieceId: string | null;
  slug: string;
  title: string;
  section: string;
  publishedAt: string | null;
  lifecycle: ArticleLifecycle;
  lifecycleNote: string;
  lifecycleChangedAt: string | null;
  /** YYYY-MM-DD, or null when no re-review is scheduled. */
  reviewDueOn: string | null;
  /** Whole days until `reviewDueOn`. NEGATIVE means overdue. */
  reviewDueInDays: number | null;
  supersededBy: { slug: string; title: string } | null;
  locale: ContentLocale;
  translationOfSlug: string | null;
}

export interface LifecycleCountsDTO {
  live: number;
  underReview: number;
  archived: number;
  superseded: number;
  overdue: number;
}

/**
 * CON-16 — the lifecycle desk in one read. Two lists because they answer
 * different questions: `dueForReview` is the work queue (mostly still `live`,
 * because nobody has looked yet), `flagged` is what a reader currently sees a
 * banner on. A piece can be in both.
 */
export interface LifecycleDeskDTO {
  dueForReview: ArticleLifecycleRecordDTO[];
  flagged: ArticleLifecycleRecordDTO[];
  counts: LifecycleCountsDTO;
}

/** `PATCH /magazine/admin/pieces/:id/article/lifecycle`. Send only what
 *  changed: pushing a review date out should not restate the state. */
export interface SetArticleLifecycleDto {
  lifecycle?: ArticleLifecycle;
  /** The editor's sentence for the reader's banner. `""` clears it. */
  note?: string;
  /** YYYY-MM-DD, or null to drop the promise. */
  reviewDueOn?: string | null;
  /** Slug of the replacement piece, or null to unlink it. Required (here or
   *  already stored) when moving to `superseded`. */
  supersededBySlug?: string | null;
}

export interface ArticleTranslationRecordDTO {
  articleId: string;
  pieceId: string | null;
  slug: string;
  title: string;
  locale: ContentLocale;
  publishedAt: string | null;
  translatorSlug: string | null;
}

export interface CreateArticleTranslationDto {
  locale: ContentLocale;
  /** The translator's name as it should read in the credit line. */
  translatorByline?: string;
  /** The member who will translate it, assigned as the new piece's writer. */
  translatorUserId?: string;
  /** Defaults to the original's slug suffixed with the locale. */
  slug?: string;
}

// ── Raw calls ──────────────────────────────────────────────────────────────

/** GET /magazine/admin/lifecycle — the review queue, the flagged archive and
 *  the tally. `withinDays` is how far ahead the queue looks (default 30). */
export const getLifecycleDesk = (withinDays?: number) =>
  apiGet<LifecycleDeskDTO>(
    `/magazine/admin/lifecycle${withinDays ? `?withinDays=${withinDays}` : ""}`,
  );

export const setArticleLifecycle = (
  pieceId: string,
  dto: SetArticleLifecycleDto,
) =>
  apiPatch<ArticleLifecycleRecordDTO>(
    `/magazine/admin/pieces/${pieceId}/article/lifecycle`,
    dto,
  );

/** GET — the whole translation family of a piece, the original included. */
export const getArticleTranslations = (pieceId: string) =>
  apiGet<ArticleTranslationRecordDTO[]>(
    `/magazine/admin/pieces/${pieceId}/article/translations`,
  );

/** POST — opens a translation as its own desk record, seeded with the
 *  original's blocks so the translator works over the piece's structure. */
export const createArticleTranslation = (
  pieceId: string,
  dto: CreateArticleTranslationDto,
) =>
  apiPost<ArticleTranslationRecordDTO>(
    `/magazine/admin/pieces/${pieceId}/article/translations`,
    dto,
  );
