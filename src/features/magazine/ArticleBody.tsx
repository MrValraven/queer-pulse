import { type ReactNode } from "react";
import { ImageSlot } from "../../shared/components/ui";
import {
  asTypedBlock,
  isPullQuote,
  type ArticleBlock,
  type TypedArticleBlock,
} from "./data/articles";
import { articleHeadingAnchorId } from "./articleOutline";
import styles from "./ArticlePage.module.css";

/** Render one typed (kinded) body block as its own block-level element.
 *  `anchorId` is the id a heading renders with, so the reader's contents list
 *  (PRD-113) has something to jump to. */
function TypedBlock({
  block,
  anchorId,
}: {
  block: TypedArticleBlock;
  anchorId: string;
}) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className={block.lead ? styles.lead : undefined}>{block.text}</p>
      );
    case "heading":
      return (
        <h2 id={anchorId} className={styles.heading}>
          {block.text}
        </h2>
      );
    case "pullQuote":
      return <blockquote className={styles.pull}>{block.text}</blockquote>;
    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>{block.text}</p>
          {/* DES-100: no dash glyph in front of the attribution; see
              ArticleBlockView.tsx for the same fix on the block renderer. */}
          {block.cite && <cite className={styles.quoteCite}>{block.cite}</cite>}
        </blockquote>
      );
    case "image":
      return (
        <figure className={styles.figure}>
          <ImageSlot
            src={block.src}
            alt={block.alt}
            tint={block.tint ?? "plum"}
            height={340}
            radius={14}
            placeholder={block.alt}
          />
          {block.caption && (
            <figcaption className={styles.figCaption}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "qa":
      return (
        <div className={styles.qa}>
          <div className={styles.qaQuestion}>
            <span className={styles.qaTag}>Q</span>
            <p>{block.question}</p>
          </div>
          <div className={styles.qaAnswer}>
            {block.answererInitials && (
              <span className={styles.qaAvatar}>{block.answererInitials}</span>
            )}
            <p>{block.answer}</p>
          </div>
        </div>
      );
    case "stats":
      return (
        <div className={styles.statRow}>
          {block.items.map((item, index) => (
            <div key={index} className={styles.stat}>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      );
  }
}

/**
 * Renders an article's body block array. Typed blocks render as their own
 * block-level elements; legacy `{ pull }` renders as a pull quote and any other
 * `ReactNode` renders as a paragraph — keeping the older articles unchanged.
 */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const typed = asTypedBlock(block);
        if (typed)
          return (
            <TypedBlock
              key={index}
              block={typed}
              anchorId={articleHeadingAnchorId(index)}
            />
          );
        if (isPullQuote(block)) {
          return (
            <blockquote key={index} className={styles.pull}>
              {block.pull}
            </blockquote>
          );
        }
        // Both the typed-block and pull-quote branches returned above, so any
        // remaining block is a legacy ReactNode paragraph.
        return <p key={index}>{block as ReactNode}</p>;
      })}
    </>
  );
}
