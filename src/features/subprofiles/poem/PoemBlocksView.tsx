import { Fragment, useMemo, type ReactNode } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PoemBlock, PoemLine, PoemSpan } from "../api/subprofiles.api";
import { poemFromDescription, poemHasContent } from "./poemBlocks";
import { normalizePoemBlocks } from "./poemModel";
import styles from "./PoemBlocksView.module.css";

export interface PoemBlocksViewProps {
  blocks: PoemBlock[] | null | undefined;
  /** Legacy plain-text fallback when there are no blocks. */
  description?: string;
}

/** Renders one marked span as React nodes (never HTML) — `strong` wraps
 *  outside `em`, matching `serializePoemLines`'s nesting order. */
function renderSpan(span: PoemSpan, spanIndex: number): ReactNode {
  if (span.marks.includes("em") && span.marks.includes("strong")) {
    return (
      <strong key={spanIndex}>
        <em>{span.text}</em>
      </strong>
    );
  }
  if (span.marks.includes("strong")) {
    return <strong key={spanIndex}>{span.text}</strong>;
  }
  if (span.marks.includes("em")) {
    return <em key={spanIndex}>{span.text}</em>;
  }
  return <Fragment key={spanIndex}>{span.text}</Fragment>;
}

/** Renders a stanza/note's verse lines, each line's spans concatenated and
 *  successive lines separated by a `<br/>`. */
function renderLines(lines: PoemLine[]): ReactNode {
  return lines.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {line.map((span, spanIndex) => renderSpan(span, spanIndex))}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

/** Read-only poem renderer. Renders directly from the structured `PoemLine[]`
 *  model as React nodes — no `dangerouslySetInnerHTML` anywhere. Normalizes
 *  legacy `{html}` blocks via `normalizePoemBlocks` so old data upgrades
 *  without a migration. Shared by the row teaser and `PoemReaderModal`. */
export function PoemBlocksView({ blocks, description }: PoemBlocksViewProps) {
  const { t } = useTranslation();

  const resolved = useMemo<PoemBlock[]>(() => {
    const normalized = normalizePoemBlocks(blocks);
    if (poemHasContent(normalized)) return normalized;
    return description ? poemFromDescription(description) : normalized;
  }, [blocks, description]);

  return (
    <div className={styles.poem}>
      {resolved.map((block) => {
        if (block.kind === "break") {
          return (
            <div key={block.id} className={styles.break}>
              <span aria-hidden>* * *</span>
              <span className={styles.visuallyHidden}>
                {t("subprofiles:poem.reader.sectionBreak")}
              </span>
            </div>
          );
        }
        const className = block.kind === "note" ? styles.note : styles.stanza;
        return (
          <p key={block.id} className={className}>
            {renderLines(block.lines)}
          </p>
        );
      })}
    </div>
  );
}
