import { createElement, type CSSProperties, type ReactNode } from "react";
import { Reveal } from "../../shared/components/ui";
import { sanitizeArticleHtml } from "../../shared/components/richText/sanitizeArticleHtml";
import type { GuideBlock, GuideSection } from "./api/resources.api";
import styles from "./resources.module.css";

export interface GuideBodyProps {
  sections: GuideSection[];
  /** Plain elements in place of `Reveal`. The admin preview re-renders on
   *  every keystroke, and replaying the entrance each time is noise. */
  isStatic?: boolean;
  /** Rendered under each section's heading. The admin preview uses it for
   *  "Edit this section"; public pages pass nothing. */
  sectionAction?: (section: GuideSection) => ReactNode;
}

/**
 * Renders an editor-authored guide body (CON-08).
 *
 * The model is deliberately small: an ordered list of sections, each an H2
 * plus ordered blocks of four kinds. Paragraph, list item and note blocks may
 * carry inline formatting in `html` (em, strong, a, br), which the backend
 * sanitizes on write and this component sanitizes again on read; every other
 * block, and every block written before formatting existed, prints `text` as
 * text.
 *
 * Sections alternate paper/cream backgrounds so a long guide still reads as
 * distinct passages, matching the hand-built pages this replaces.
 */
export function GuideBody({
  sections,
  isStatic = false,
  sectionAction,
}: GuideBodyProps) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <section
          key={`${section.id}-${sectionIndex}`}
          id={section.id}
          className={`${styles.section} ${
            sectionIndex % 2 === 0 ? styles.sectionPaper : styles.sectionCream
          }`}
        >
          <div className="wrap">
            {section.heading && (
              <GuideReveal as="h2" isStatic={isStatic}>
                {section.heading}
              </GuideReveal>
            )}
            {sectionAction?.(section)}
            <GuideBlocks section={section} isStatic={isStatic} />
          </div>
        </section>
      ))}
    </>
  );
}

type RevealTag = "div" | "p" | "h2" | "h3";

function GuideReveal({
  as = "div",
  isStatic,
  className,
  style,
  children,
}: {
  as?: RevealTag;
  isStatic: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (isStatic) return createElement(as, { className, style }, children);
  return (
    <Reveal as={as} className={className} style={style}>
      {children}
    </Reveal>
  );
}

/** A block's content: its sanitized inline html when it has some, its plain
 *  text otherwise. Subheadings are always plain. */
function BlockText({ block }: { block: GuideBlock }) {
  if (block.html === undefined || block.kind === "subheading") {
    return <>{block.text}</>;
  }
  return (
    <span
      className={styles.richInline}
      dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(block.html) }}
    />
  );
}

/**
 * The blocks of one section, collapsed into render groups in a single pass.
 * Consecutive `listItem` blocks become one checklist rather than a stack of
 * unrelated rows, which is how the hand-built pages rendered tip lists.
 */
type BlockGroup =
  | { kind: "single"; key: string; block: GuideBlock }
  | { kind: "list"; key: string; items: GuideBlock[] };

function groupBlocks(section: GuideSection): BlockGroup[] {
  const groups: BlockGroup[] = [];
  section.blocks.forEach((block, blockIndex) => {
    const key = `${section.id}-${blockIndex}`;
    if (block.kind !== "listItem") {
      groups.push({ kind: "single", key, block });
      return;
    }
    const previous = groups[groups.length - 1];
    if (previous?.kind === "list") {
      previous.items.push(block);
      return;
    }
    groups.push({ kind: "list", key, items: [block] });
  });
  return groups;
}

function GuideBlocks({
  section,
  isStatic,
}: {
  section: GuideSection;
  isStatic: boolean;
}) {
  return (
    <>
      {groupBlocks(section).map((group) => {
        if (group.kind === "list") {
          return (
            <div key={group.key} className={styles.checklist}>
              {group.items.map((item, itemIndex) => (
                <GuideReveal
                  key={`${group.key}-item-${itemIndex}`}
                  isStatic={isStatic}
                  className={styles.checkItem}
                  style={{ gridTemplateColumns: "1fr" }}
                >
                  <div className={styles.cardSpec} style={{ flex: "none" }}>
                    <BlockText block={item} />
                  </div>
                </GuideReveal>
              ))}
            </div>
          );
        }

        const { block, key } = group;
        if (block.kind === "subheading") {
          return (
            <GuideReveal
              as="h3"
              key={key}
              isStatic={isStatic}
              className={styles.stepTitle}
              style={{ marginTop: 28, marginBottom: 10 }}
            >
              {block.text}
            </GuideReveal>
          );
        }
        if (block.kind === "note") {
          return (
            <GuideReveal
              key={key}
              isStatic={isStatic}
              className={styles.rightCard}
            >
              <div className={styles.rightBody}>
                <BlockText block={block} />
              </div>
            </GuideReveal>
          );
        }
        return (
          <GuideReveal
            as="p"
            key={key}
            isStatic={isStatic}
            className={styles.leadP}
            style={{ maxWidth: "64ch", marginBottom: 20 }}
          >
            <BlockText block={block} />
          </GuideReveal>
        );
      })}
    </>
  );
}
