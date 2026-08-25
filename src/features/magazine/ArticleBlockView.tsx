import { useMemo } from "react";
import type { ArticleBlock, ArticleImageTint } from "./api/pieces.api";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import { initialsFromName } from "../../shared/lib/initials";
import { sanitizeArticleHtml } from "./desk/editor/sanitizeArticleHtml";
import styles from "./ArticleBlockView.module.css";

/** `ImageSlotTint` has no "violet" (it mirrors `AvatarTint`) — same fallback
 * the block editor's own preview uses (`ArticleBlockKindFields.tsx`). */
function toImageSlotTint(tint: ArticleImageTint): ImageSlotTint {
  return tint === "violet" ? "default" : tint;
}

/**
 * Renders one typed article `block` read-only, for the public article
 * reader. Every `html` field (rich text authored via the editor's
 * `execCommand`-based `RichText` surface) is run through
 * `sanitizeArticleHtml` before `dangerouslySetInnerHTML` — never rendered
 * raw. Plain-string fields (`cite`, `credit`, `who`, stat `value`/`label`)
 * are rendered as text as usual, no sanitization needed.
 *
 * No editing affordances here — that's `desk/editor/ArticleBlockEditor.tsx`.
 * Visuals port the design's `.blk-*` classes (`ArticleBlockView.module.css`).
 */
export function ArticleBlockView({ block }: { block: ArticleBlock }) {
  // Sanitizing is real DOM-parsing work (`sanitizeArticleHtml` builds a
  // detached element per call) — memoize per block so a parent re-render
  // (e.g. sibling state changing) doesn't re-sanitize every block's HTML.
  // `block.html`/`.caption`/`.q` only exist on some union members, so each
  // raw value is narrowed to `undefined` for the kinds that lack it; the
  // hooks themselves always run in the same order regardless of `block.kind`.
  const rawHtml = "html" in block ? block.html : undefined;
  const rawCaption = block.kind === "image" ? block.caption : undefined;
  const rawQuestion = block.kind === "qa" ? block.q : undefined;

  const sanitizedHtml = useMemo(
    () => (rawHtml !== undefined ? sanitizeArticleHtml(rawHtml) : ""),
    [rawHtml],
  );
  const sanitizedCaption = useMemo(
    () => (rawCaption ? sanitizeArticleHtml(rawCaption) : ""),
    [rawCaption],
  );
  const sanitizedQuestion = useMemo(
    () => (rawQuestion !== undefined ? sanitizeArticleHtml(rawQuestion) : ""),
    [rawQuestion],
  );

  switch (block.kind) {
    case "paragraph":
      return (
        <p
          className={block.lead ? `${styles.p} ${styles.lead}` : styles.p}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );

    case "heading":
      return (
        <h2
          className={styles.h}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );

    case "pullQuote":
      return (
        <blockquote
          className={styles.pull}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );

    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          {block.cite && (
            <cite className={styles.cite}>{`— ${block.cite}`}</cite>
          )}
        </blockquote>
      );

    case "image":
      return (
        <figure className={styles.figure}>
          <ImageSlot
            src={block.src}
            alt={block.alt}
            tint={toImageSlotTint(block.tint)}
            height={340}
            radius={14}
            placeholder={block.alt}
          />
          {(block.caption || block.credit) && (
            <figcaption className={styles.figCaption}>
              {block.caption && (
                <span dangerouslySetInnerHTML={{ __html: sanitizedCaption }} />
              )}
              {block.credit && (
                <span className={styles.credit}>{block.credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      );

    case "qa":
      return (
        <div className={styles.qa}>
          <p
            className={styles.q}
            dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
          />
          <div className={styles.a}>
            <Avatar
              initials={initialsFromName(block.who, "?")}
              size={32}
              name={block.who}
            />
            <div className={styles.aBody}>
              {block.who && <div className={styles.who}>{block.who}</div>}
              <p
                className={styles.answer}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          </div>
        </div>
      );

    case "stats":
      return (
        <div className={styles.stats}>
          {block.items.map((item, index) => (
            <div className={styles.stat} key={index}>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      );

    default: {
      // Exhaustiveness guard: TypeScript rejects an unhandled ArticleBlock
      // member here at compile time (mirrors ArticleBlockEditor.tsx).
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
