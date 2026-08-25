import type { ArticleLiveStatus } from "./ArticleEditorHeader";

/**
 * Derives the header/rail's honest live status from `publishedAt` against
 * the clock — a future `publishedAt` (a real schedule, CNT-2) reads as
 * `"scheduled"`, never `"published"`, so nothing in the UI claims a piece is
 * live before it actually is.
 */
export function deriveLiveStatus(
  publishedAt: string | null,
): ArticleLiveStatus {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > Date.now()
    ? "scheduled"
    : "published";
}
