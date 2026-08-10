import type { ArticleBlock } from "../../api/pieces.api";
import { ArticleBlocksView } from "../../ArticleBlocksView";
import { sanitizeArticleHtml } from "./sanitizeArticleHtml";
import styles from "./ArticleDocument.module.css";

export interface ArticleReaderPreviewProps {
  kicker: string;
  title: string;
  standfirst: string;
  blocks: ArticleBlock[];
}

/**
 * Read mode's document surface: the same typed blocks rendered read-only via
 * the public reader's own `ArticleBlockView` (through `ArticleBlocksView`),
 * so what an editor previews here matches what a reader would actually see —
 * no separate "preview renderer" to drift out of sync. No tools, no
 * `RichText`, no `SelectionToolbar`.
 */
export function ArticleReaderPreview({
  kicker,
  title,
  standfirst,
  blocks,
}: ArticleReaderPreviewProps) {
  return (
    <div className={`${styles.doc} ${styles.reader}`}>
      <div className={styles.docwrap}>
        {kicker && <div className={styles.kicker}>{kicker}</div>}
        <h1
          className={styles.title}
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(title) }}
        />
        {standfirst && (
          <p
            className={styles.standfirst}
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(standfirst) }}
          />
        )}
        <ArticleBlocksView blocks={blocks} />
      </div>
    </div>
  );
}
