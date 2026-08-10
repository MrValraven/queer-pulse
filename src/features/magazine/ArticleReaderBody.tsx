import type { Article } from "./data/articles";
import { ArticleBody } from "./ArticleBody";
import { ArticleBlocksView } from "./ArticleBlocksView";

/**
 * Chooses how `ArticlePage` renders an article's body: the typed block
 * editor's `blocks` (Phase 3 §7.3, sanitized per-block — see
 * `ArticleBlockView.tsx`) when non-empty, else the legacy `body` array
 * renderer — back-compat for articles that predate the block editor (or a
 * live article nobody has opened in it yet). Extracted out of `ArticlePage`
 * to keep that component under the repo's 200-line limit.
 */
export function ArticleReaderBody({ article }: { article: Article }) {
  if (article.blocks && article.blocks.length > 0) {
    return <ArticleBlocksView blocks={article.blocks} />;
  }
  return <ArticleBody blocks={article.body} />;
}
