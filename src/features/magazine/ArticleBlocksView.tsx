import type { ArticleBlock } from "./api/pieces.api";
import { ArticleBlockView } from "./ArticleBlockView";

/**
 * Maps a full article's typed `blocks` to the read-only block view, in
 * order. Used by `ArticlePage.tsx` whenever `blocks` is non-empty; older
 * articles that predate the block editor fall back to `ArticleBody`
 * (the legacy `body` array) instead — see `ArticlePage.tsx`.
 */
export function ArticleBlocksView({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block) => (
        <ArticleBlockView key={block.id} block={block} />
      ))}
    </>
  );
}
