import { Reveal } from "../../shared/components/ui";
import type { GuideBlock, GuideSection } from "./api/resources.api";
import styles from "./resources.module.css";

export interface GuideBodyProps {
  sections: GuideSection[];
}

/**
 * Renders an editor-authored guide body (CON-08).
 *
 * The model is deliberately tiny — an ordered list of sections, each an H2
 * plus ordered blocks of four kinds — so a non-engineer can hold it in their
 * head and there is no markup for them to get wrong. Every block's text is
 * printed as text, never as HTML, so an editorial mistake can never break a
 * page's layout or inject anything into a crisis guide.
 *
 * Sections alternate paper/cream backgrounds so a long guide still reads as
 * distinct passages, matching the hand-built pages this replaces.
 */
export function GuideBody({ sections }: GuideBodyProps) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          id={section.id}
          className={`${styles.section} ${
            sectionIndex % 2 === 0 ? styles.sectionPaper : styles.sectionCream
          }`}
        >
          <div className="wrap">
            {section.heading && <Reveal as="h2">{section.heading}</Reveal>}
            <GuideBlocks section={section} />
          </div>
        </section>
      ))}
    </>
  );
}

/**
 * The blocks of one section, collapsed into render groups in a single pass.
 *
 * Consecutive `listItem` blocks become one checklist rather than a stack of
 * unrelated rows, which is how the hand-built pages this replaces rendered
 * their tip lists.
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

function GuideBlocks({ section }: { section: GuideSection }) {
  return (
    <>
      {groupBlocks(section).map((group) => {
        if (group.kind === "list") {
          return (
            <div key={group.key} className={styles.checklist}>
              {group.items.map((item, itemIndex) => (
                <Reveal
                  key={`${group.key}-item-${itemIndex}`}
                  className={styles.checkItem}
                  style={{ gridTemplateColumns: "1fr" }}
                >
                  <div className={styles.cardSpec} style={{ flex: "none" }}>
                    {item.text}
                  </div>
                </Reveal>
              ))}
            </div>
          );
        }

        const { block, key } = group;
        if (block.kind === "subheading") {
          return (
            <Reveal
              as="h3"
              key={key}
              className={styles.stepTitle}
              style={{ marginTop: 28, marginBottom: 10 }}
            >
              {block.text}
            </Reveal>
          );
        }
        if (block.kind === "note") {
          return (
            <Reveal key={key} className={styles.rightCard}>
              <div className={styles.rightBody}>{block.text}</div>
            </Reveal>
          );
        }
        return (
          <Reveal
            as="p"
            key={key}
            className={styles.leadP}
            style={{ maxWidth: "64ch", marginBottom: 20 }}
          >
            {block.text}
          </Reveal>
        );
      })}
    </>
  );
}
