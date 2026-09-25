import { useMemo } from "react";
import { useInAppAnchorClick } from "../links/useInAppLinkRouting";
import { MentionText } from "../mentions/MentionText";
import {
  isSafeHref,
  parseMarkdownLite,
  type MarkdownBlock,
  type MarkdownSpan,
} from "./markdownLiteParser";
import styles from "./MarkdownLite.module.css";

/**
 * Render a markdown-lite body: the forum composer's preview tab and the
 * published post both go through this, so what a member sees while writing is
 * produced by the same code that renders what everyone else reads.
 *
 * Text runs are handed to {@link MentionText}, which keeps `@member`,
 * `c/community`, `#topic`, `b/business`, `e/event` and `t/thread` linking
 * exactly as they did when a post body was a plain paragraph list. Bold and
 * italic runs go through it too: wrapping a name in `**` should not quietly
 * unlink it.
 *
 * Nothing here builds an HTML string — the AST comes back as blocks and spans
 * and is rendered as elements, so member-authored markup is never interpreted.
 */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdownLite(text), [text]);
  return (
    <>
      {blocks.map((block, index) => (
        <MarkdownBlockView key={index} block={block} />
      ))}
    </>
  );
}

/** One parsed block as its element. Kept separate from {@link MarkdownLite} so
 *  the union switch has room to grow without crowding the entry point. */
function MarkdownBlockView({ block }: { block: MarkdownBlock }) {
  if (block.type === "list") {
    const items = block.items.map((spans, index) => (
      <li key={index} className={styles.item}>
        <SpanRun spans={spans} />
      </li>
    ));
    return block.ordered ? (
      <ol className={styles.list}>{items}</ol>
    ) : (
      <ul className={styles.list}>{items}</ul>
    );
  }
  if (block.type === "heading") {
    return (
      <h4 className={styles.heading}>
        <SpanRun spans={block.spans} />
      </h4>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className={styles.blockquote}>
        <SpanRun spans={block.spans} />
      </blockquote>
    );
  }
  return (
    <p className={styles.paragraph}>
      <SpanRun spans={block.spans} />
    </p>
  );
}

/** A block's inline runs, in order. */
function SpanRun({ spans }: { spans: MarkdownSpan[] }) {
  return (
    <>
      {spans.map((span, index) => (
        <SpanView key={index} span={span} />
      ))}
    </>
  );
}

/** One inline run.
 *
 *  The `isSafeHref` check is deliberately repeated here even though the parser
 *  only ever emits `http:`/`https:` links: this component is what actually
 *  writes an `href`, and a renderer that trusts its input to have been checked
 *  elsewhere stops being safe the moment someone hands it a hand-built AST. An
 *  unsafe href renders as the text it is. */
function SpanView({ span }: { span: MarkdownSpan }) {
  if (span.type === "link") {
    if (!isSafeHref(span.href)) return <MentionText text={span.text} />;
    return <MarkdownLink href={span.href} text={span.text} />;
  }
  if (span.type === "strong") {
    return (
      <strong>
        <MentionText text={span.text} />
      </strong>
    );
  }
  if (span.type === "emphasis") {
    return (
      <em>
        <MentionText text={span.text} />
      </em>
    );
  }
  return <MentionText text={span.text} />;
}

/** A link run as its anchor. Its own component so it can call
 *  {@link useInAppAnchorClick}: an installed PWA hands `target="_blank"` to
 *  the system browser, so a plain click on a link back into QueerPulse
 *  routes in-app and every other link opens as before. */
function MarkdownLink({ href, text }: { href: string; text: string }) {
  const handleAnchorClick = useInAppAnchorClick();
  return (
    <a
      className={styles.link}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAnchorClick}
    >
      {text}
    </a>
  );
}
