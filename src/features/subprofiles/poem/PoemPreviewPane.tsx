import type { PoemBlock } from "../api/subprofiles.api";
import { PoemBlocksView } from "./PoemBlocksView";
import styles from "./PoemPreviewPane.module.css";

export interface PoemPreviewPaneProps {
  blocks: PoemBlock[];
}

/**
 * Live, read-only mirror of the poem being authored in `PoemBodyEditor`,
 * rendered with the same `PoemBlocksView` used by the real reader (true
 * WYSIWYG). Purely a passive reflection of the editor's in-memory `blocks`
 * state — it never writes to the editor DOM and carries no interactive
 * controls of its own, hence `aria-hidden` on the whole subtree.
 */
export function PoemPreviewPane({ blocks }: PoemPreviewPaneProps) {
  return (
    <div aria-hidden className={styles.preview}>
      <div className={styles.previewInner}>
        <PoemBlocksView blocks={blocks} />
      </div>
    </div>
  );
}
