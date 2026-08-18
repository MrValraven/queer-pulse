import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiFeather,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { SegmentedControl } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMin } from "../../../shared/theme/breakpoints";
import type { PoemBlock, PoemLine } from "../api/subprofiles.api";
import { useRowDragReorder } from "../useRowDragReorder";
import {
  newBreak,
  newNote,
  newStanza,
  poemFromDescription,
} from "./poemBlocks";
import { normalizePoemBlocks } from "./poemModel";
import { PoemPreviewPane } from "./PoemPreviewPane";
import { PoemResplitHint } from "./PoemResplitHint";
import { PoemRichLine, type PoemRichLineHandle } from "./PoemRichLine";
import { PoemSelectionToolbar } from "./PoemSelectionToolbar";
import styles from "./PoemBodyEditor.module.css";

/** Below this, the editor collapses to a mobile Edit/Preview toggle instead
 *  of the desktop side-by-side split (mirrors the admin-shell "wide" cutover
 *  — comfortably fits two reading-width columns above it). */
const DESKTOP_SPLIT_QUERY = mediaMin("wide");

/** A merged-stanza line past this length is treated as a candidate for the
 *  legacy "re-split into lines?" hint — short single-stanza poems (haiku,
 *  couplets) never trip it. */
const RESPLIT_LENGTH_THRESHOLD = 120;
/** Sentence/clause punctuation the re-split regex below also splits on — its
 *  presence is what distinguishes "one very long verse line" (leave alone)
 *  from "old data whose line breaks were flattened into prose" (offer to fix). */
const RESPLIT_PUNCTUATION_PATTERN = /[.,;]/;

/** Detects the legacy shape this hint targets: the whole poem is exactly one
 *  stanza with exactly one line, and that line's plain text (marks ignored —
 *  legacy merged data never carries formatting) is long enough with enough
 *  punctuation to plausibly be several flattened verse lines. Returns the
 *  target block id + its plain text, or `null` when the hint doesn't apply. */
function detectMergedStanzaLine(
  blocks: PoemBlock[],
): { blockId: string; lineText: string } | null {
  if (blocks.length !== 1) return null;
  const [onlyBlock] = blocks;
  if (!onlyBlock || onlyBlock.kind !== "stanza" || onlyBlock.lines.length !== 1) {
    return null;
  }
  const [onlyLine] = onlyBlock.lines;
  const lineText = (onlyLine ?? []).map((span) => span.text).join("");
  if (lineText.length <= RESPLIT_LENGTH_THRESHOLD) return null;
  if (!RESPLIT_PUNCTUATION_PATTERN.test(lineText)) return null;
  return { blockId: onlyBlock.id, lineText };
}

/** Splits a flattened line's text into candidate verse lines on sentence/
 *  clause punctuation, discarding any blank segments left by extra
 *  whitespace. Candidate lines are plain (unmarked) spans — a suggestion the
 *  poet reviews and can re-edit, not a lossless recovery of the original. */
function splitMergedLineIntoLines(lineText: string): PoemLine[] {
  return lineText
    .split(/(?<=[.,;])\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => [{ text: segment, marks: [] }]);
}

export interface PoemBodyEditorProps {
  /** Current poem blocks (from `draft.structured.poem`). */
  value: PoemBlock[] | null;
  /** Legacy plain-text `description`, used to seed one stanza when there are
   *  no blocks yet (backward-compat for poems authored before this editor). */
  description: string;
  onChange: (blocks: PoemBlock[]) => void;
}

/**
 * The poetry-tailored block editor shown in the item drawer for the `poems`
 * section (special-cased in `SubprofileItemDrawerFields`, not a
 * `richFields.data.ts` descriptor). Manages an ordered `PoemBlock[]`:
 * stanza / section-break / note, with inline italic+bold via
 * `PoemSelectionToolbar`. Emits sanitized blocks on every edit.
 */
export function PoemBodyEditor({
  value,
  description,
  onChange,
}: PoemBodyEditorProps) {
  const { t } = useTranslation();
  const scopeRef = useRef<HTMLDivElement>(null);
  const isDesktopSplit = useMediaQuery(DESKTOP_SPLIT_QUERY);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  // Seed once: existing blocks win (normalized — legacy `{html}` items may
  // still be sitting in an unmigrated jsonb blob); else a stanza from
  // legacy plain-text description.
  const [blocks, setBlocks] = useState<PoemBlock[]>(() =>
    value && value.length > 0
      ? normalizePoemBlocks(value)
      : poemFromDescription(description),
  );

  // Handles for the mounted stanza/note fields, keyed by block id — lets an
  // add/split/merge-back imperatively move focus onto a block that render
  // alone can't target (a block just inserted, or the previous block after
  // one is removed). `focusTargetId` is the one-shot request; the effect
  // below fulfils it once the requested block's ref exists, then clears it.
  const richLineHandles = useRef<Record<string, PoemRichLineHandle | null>>({});
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusTargetId) return;
    richLineHandles.current[focusTargetId]?.focus();
    setFocusTargetId(null);
  }, [focusTargetId]);

  function commit(next: PoemBlock[]) {
    setBlocks(next);
    onChange(next);
  }

  function patchLines(id: string, lines: PoemLine[]) {
    commit(
      blocks.map((block) =>
        block.kind !== "break" && block.id === id
          ? { ...block, lines }
          : block,
      ),
    );
  }

  // Legacy re-split hint (Task 11): a single stanza whose one line reads
  // like several flattened verse lines. Recomputed off `blocks` so the hint
  // disappears the moment the poet accepts it (or edits their way out of the
  // detected shape).
  const resplitCandidate = useMemo(() => detectMergedStanzaLine(blocks), [blocks]);

  function handleResplit() {
    if (!resplitCandidate) return;
    patchLines(
      resplitCandidate.blockId,
      splitMergedLineIntoLines(resplitCandidate.lineText),
    );
  }

  function addBlock(block: PoemBlock) {
    commit([...blocks, block]);
    if (block.kind !== "break") setFocusTargetId(block.id);
  }

  function removeBlock(id: string) {
    delete richLineHandles.current[id];
    commit(blocks.filter((block) => block.id !== id));
  }

  function reorderBlocks(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= blocks.length ||
      toIndex >= blocks.length
    ) {
      return;
    }
    const next = [...blocks];
    [next[fromIndex], next[toIndex]] = [next[toIndex]!, next[fromIndex]!];
    commit(next);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id);
    reorderBlocks(index, index + direction);
  }

  /** Double-Enter on an empty trailing line: insert a fresh stanza right
   *  after this block and focus it. */
  function handleSplitBlock(afterId: string) {
    const index = blocks.findIndex((block) => block.id === afterId);
    if (index < 0) return;
    const inserted = newStanza();
    const next = [...blocks];
    next.splice(index + 1, 0, inserted);
    commit(next);
    setFocusTargetId(inserted.id);
  }

  /** Backspace at the start of an already-empty block: drop it and focus the
   *  nearest editable block before it. No-op on the first block — there's
   *  nothing to merge into. A `break` block has no editable field to land
   *  in, so a run of one or more breaks immediately before this block is
   *  walked past to the nearest stanza/note (break-then-empty-stanza is a
   *  normal authoring state); if only breaks precede it, focus is left
   *  unset rather than falling through to `<body>`. */
  function handleMergeBack(id: string) {
    const index = blocks.findIndex((block) => block.id === id);
    if (index <= 0) return;
    delete richLineHandles.current[id];
    commit(blocks.filter((block) => block.id !== id));
    for (let candidateIndex = index - 1; candidateIndex >= 0; candidateIndex--) {
      if (blocks[candidateIndex]!.kind !== "break") {
        setFocusTargetId(blocks[candidateIndex]!.id);
        break;
      }
    }
  }

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    reorderBlocks,
  );

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
    if (block.kind === "break") return t("subprofiles:poem.editor.blockLabel.break");
    if (block.kind === "note") return t("subprofiles:poem.editor.blockLabel.note");
    return t("subprofiles:poem.editor.blockLabel.stanza", {
      index: stanzaIndexByBlockId.get(block.id) ?? 0,
      total: stanzaTotal,
    });
  }

  // Kept as a single JSX value (not a component) so it is written once but
  // rendered from exactly one place per breakpoint — desktop always mounts
  // it (caret-preserving), mobile mounts it only on the "edit" tab.
  const editorPane = (
    <div className={styles.editor}>
      <span className={styles.label}>{t("subprofiles:poem.editor.label")}</span>

      {resplitCandidate && <PoemResplitHint onResplit={handleResplit} />}

      <div
        className={styles.blocks}
        ref={(node) => {
          scopeRef.current = node;
          containerRef.current = node;
        }}
      >
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
                    ref={(handle) => {
                      richLineHandles.current[block.id] = handle;
                    }}
                    lines={block.lines}
                    onChange={(lines) => patchLines(block.id, lines)}
                    placeholder={t(
                      block.kind === "note"
                        ? "subprofiles:poem.editor.notePlaceholder"
                        : "subprofiles:poem.editor.stanzaPlaceholder",
                    )}
                    ariaLabel={blockAriaLabel(block)}
                    className={block.kind === "note" ? styles.note : undefined}
                    onSplitBlock={() => handleSplitBlock(block.id)}
                    onMergeBack={() => handleMergeBack(block.id)}
                  />
                )}
              </div>
              <div className={styles.blockOps}>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, -1)}
                  disabled={index === 0}
                  aria-label={t("subprofiles:poem.editor.moveUp")}
                >
                  <FiArrowUp aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 1)}
                  disabled={index === blocks.length - 1}
                  aria-label={t("subprofiles:poem.editor.moveDown")}
                >
                  <FiArrowDown aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
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
        <button type="button" onClick={() => addBlock(newStanza())}>
          <FiPlus aria-hidden /> {t("subprofiles:poem.editor.addStanza")}
        </button>
        <button type="button" onClick={() => addBlock(newBreak())}>
          <FiPlus aria-hidden /> {t("subprofiles:poem.editor.addBreak")}
        </button>
        <button type="button" onClick={() => addBlock(newNote())}>
          <FiFeather aria-hidden /> {t("subprofiles:poem.editor.addNote")}
        </button>
      </div>

      <PoemSelectionToolbar scopeRef={scopeRef} />
    </div>
  );

  if (isDesktopSplit) {
    return (
      <div className={styles.split}>
        <div className={styles.editorColumn}>{editorPane}</div>
        <div className={styles.previewColumn}>
          <PoemPreviewPane blocks={blocks} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mobileStack}>
      <SegmentedControl
        className={styles.mobileTabs}
        label={t("subprofiles:poem.editor.paneToggleAria")}
        options={[
          { value: "edit", label: t("subprofiles:poem.editor.tabEdit") },
          { value: "preview", label: t("subprofiles:poem.editor.tabPreview") },
        ]}
        value={mobilePane}
        onChange={(next) => setMobilePane(next === "preview" ? "preview" : "edit")}
      />
      {mobilePane === "edit" ? editorPane : <PoemPreviewPane blocks={blocks} />}
    </div>
  );
}
