import { type ReactNode } from "react";
import { ImageSlot } from "../../shared/components/ui";
import {
  asTypedBlock,
  isPullQuote,
  type ArticleBlock,
  type TypedArticleBlock,
} from "./data/articles";
import styles from "./ArticlePage.module.css";

/** Render one typed (kinded) body block as its own block-level element. */
function TypedBlock({ block }: { block: TypedArticleBlock }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className={block.lead ? styles.lead : undefined}>{block.text}</p>
      );
    case "heading":
      return <h2 className={styles.heading}>{block.text}</h2>;
    case "pullQuote":
      return <blockquote className={styles.pull}>{block.text}</blockquote>;
    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>{block.text}</p>
          {block.cite && (
            <cite className={styles.quoteCite}>— {block.cite}</cite>
          )}
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
        if (typed) return <TypedBlock key={index} block={typed} />;
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
