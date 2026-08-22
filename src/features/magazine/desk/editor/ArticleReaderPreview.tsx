import type { ArticleBlock } from "../../api/pieces.api";
import { ArticleBlocksView } from "../../ArticleBlocksView";
import styles from "./ArticleDocument.module.css";

export interface ArticleReaderPreviewProps {
  kicker: string;
  /** Plain text (see `plainText.ts`), rendered as text. */
  title: string;
  /** Plain text (see `plainText.ts`), rendered as text. */
  standfirst: string;
  blocks: ArticleBlock[];
}

/**
 * Read mode's document surface: the same typed blocks rendered read-only via
 * the public reader's own `ArticleBlockView` (through `ArticleBlocksView`),
 * so what an editor previews here matches what a reader would actually see —
 * no separate "preview renderer" to drift out of sync. No tools, no
 * `RichText`, no `SelectionToolbar`.
 *
 * Headline and standfirst render as TEXT here, exactly as `ArticlePage` does
 * on the public page — they are plain text by contract (see `plainText.ts`),
 * so running them back through an HTML renderer would make this preview
 * disagree with what a reader gets.
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
        <h1 className={styles.title}>{title}</h1>
        {standfirst && <p className={styles.standfirst}>{standfirst}</p>}
        <ArticleBlocksView blocks={blocks} />
      </div>
    </div>
  );
}
