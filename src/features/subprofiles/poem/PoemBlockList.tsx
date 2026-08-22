import type {
  PointerEvent as ReactPointerEvent,
  RefCallback,
} from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiFeather,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PoemBlock, PoemLine } from "../api/subprofiles.api";
import { newBreak, newNote, newStanza } from "./poemBlocks";
import { PoemRichLine, type PoemRichLineHandle } from "./PoemRichLine";
import styles from "./PoemBodyEditor.module.css";

export interface PoemBlockListProps {
  blocks: PoemBlock[];
  /** Attaches the drag container (and the selection-toolbar scope). */
  containerRef: RefCallback<HTMLDivElement>;
  /** Index currently being dragged, or null. */
  draggingIndex: number | null;
  /** Pointer handlers for one row's drag grip. */
  gripHandlers: (index: number) => {
    onPointerDown: (event: ReactPointerEvent) => void;
  };
  /** Store (or clear) a block's imperative rich-line handle. */
  registerRichLine: (id: string, handle: PoemRichLineHandle | null) => void;
  onPatchLines: (id: string, lines: PoemLine[]) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onSplitBlock: (afterId: string) => void;
  onMergeBack: (id: string) => void;
  onAddBlock: (block: PoemBlock) => void;
}

/**
 * The ordered stanza / section-break / note rows of the poem editor, plus the
 * add bar under them. Every edit is a callback up to `PoemBodyEditor`, which
 * owns the block model; this file owns only the markup and the per-row labels.
 * Split out to keep both components under the repo's 200-line cap.
 */
export function PoemBlockList({
  blocks,
  containerRef,
  draggingIndex,
  gripHandlers,
  registerRichLine,
  onPatchLines,
  onMove,
  onRemove,
  onSplitBlock,
  onMergeBack,
  onAddBlock,
}: PoemBlockListProps) {
  const { t } = useTranslation();

  const stanzaTotal = blocks.filter((block) => block.kind === "stanza").length;
  // Precomputed once per render, outside the JSX-producing map below — a
  // running counter mutated *inside* that map (and read back the same
  // iteration via `blockAriaLabel`) is a render-purity violation the
  // react-compiler lint flags, since it can't prove the mutation/read pair
  // stays safe across memoization.
  const stanzaIndexByBlockId = new Map<string, number>();
  {
    let counter = 0;
    for (const block of blocks) {
      if (block.kind === "stanza") stanzaIndexByBlockId.set(block.id, ++counter);
    }
  }

  function blockAriaLabel(block: PoemBlock): string {
    if (block.kind === "break") {
      return t("subprofiles:poem.editor.blockLabel.break");
    }
    if (block.kind === "note") {
      return t("subprofiles:poem.editor.blockLabel.note");
    }
    return t("subprofiles:poem.editor.blockLabel.stanza", {
      index: stanzaIndexByBlockId.get(block.id) ?? 0,
      total: stanzaTotal,
    });
  }

  return (
    <>
      <div className={styles.blocks} ref={containerRef}>
        {blocks.map((block, index) => {
          const isBreak = block.kind === "break";
          return (
            <div
              key={block.id}
              className={
                draggingIndex === index
                  ? `${styles.block} ${styles.dragging}`
                  : styles.block
              }
              data-kind={block.kind}
              role={isBreak ? "separator" : undefined}
              aria-label={isBreak ? blockAriaLabel(block) : undefined}
            >
              <span
                className={styles.grip}
                aria-hidden
                title={t("subprofiles:poem.editor.dragToReorder")}
                {...gripHandlers(index)}
              >
                <FiMoreVertical size={16} />
              </span>
              <div className={styles.blockMain}>
                {isBreak ? (
                  <div className={styles.breakRow} aria-hidden>
                    * * *
                  </div>
                ) : (
                  <PoemRichLine
                    ref={(handle) => registerRichLine(block.id, handle)}
                    lines={block.lines}
                    onChange={(lines) => onPatchLines(block.id, lines)}
                    placeholder={t(
                      block.kind === "note"
                        ? "subprofiles:poem.editor.notePlaceholder"
                        : "subprofiles:poem.editor.stanzaPlaceholder",
                    )}
                    ariaLabel={blockAriaLabel(block)}
                    className={block.kind === "note" ? styles.note : undefined}
                    onSplitBlock={() => onSplitBlock(block.id)}
                    onMergeBack={() => onMergeBack(block.id)}
                  />
                )}
              </div>
              <div className={styles.blockOps}>
                <button
                  type="button"
                  onClick={() => onMove(block.id, -1)}
                  disabled={index === 0}
                  aria-label={t("subprofiles:poem.editor.moveUp")}
                >
                  <FiArrowUp aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(block.id, 1)}
                  disabled={index === blocks.length - 1}
                  aria-label={t("subprofiles:poem.editor.moveDown")}
                >
                  <FiArrowDown aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(block.id)}
                  aria-label={t("subprofiles:poem.editor.remove")}
                >
                  <FiTrash2 aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.addBar}>
        <button type="button" onClick={() => onAddBlock(newStanza())}>
          <FiPlus aria-hidden /> {t("subprofiles:poem.editor.addStanza")}
        </button>
        <button type="button" onClick={() => onAddBlock(newBreak())}>
          <FiPlus aria-hidden /> {t("subprofiles:poem.editor.addBreak")}
        </button>
        <button type="button" onClick={() => onAddBlock(newNote())}>
          <FiFeather aria-hidden /> {t("subprofiles:poem.editor.addNote")}
        </button>
      </div>
    </>
  );
}
