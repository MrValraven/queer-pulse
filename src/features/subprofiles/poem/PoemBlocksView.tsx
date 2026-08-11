import { useMemo } from "react";
import type { PoemBlock } from "../api/subprofiles.api";
import { poemFromDescription, poemHasContent } from "./poemBlocks";
import { sanitizePoemHtml } from "./sanitizePoemHtml";
import styles from "./PoemBlocksView.module.css";

export interface PoemBlocksViewProps {
  blocks: PoemBlock[] | null | undefined;
  /** Legacy plain-text fallback when there are no blocks. */
  description?: string;
}

/** Read-only poem renderer. Sanitizes every `html` field before
 *  `dangerouslySetInnerHTML` (defense in depth — write path already
 *  sanitizes). Shared by the row teaser and `PoemReaderModal`. */
export function PoemBlocksView({ blocks, description }: PoemBlocksViewProps) {
  const resolved = useMemo<PoemBlock[]>(
    () =>
      blocks && poemHasContent(blocks)
        ? blocks
        : description
          ? poemFromDescription(description)
          : [],
    [blocks, description],
  );

  return (
    <div className={styles.poem}>
      {resolved.map((block) => {
        if (block.kind === "break") {
          return (
            <div key={block.id} className={styles.break} aria-hidden>
              * * *
            </div>
          );
        }
        const className =
          block.kind === "note" ? styles.note : styles.stanza;
        return (
          <p
            key={block.id}
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizePoemHtml(block.html) }}
          />
        );
      })}
    </div>
  );
}
