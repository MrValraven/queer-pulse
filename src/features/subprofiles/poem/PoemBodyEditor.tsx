import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMin } from "../../../shared/theme/breakpoints";
import type { PoemBlock, PoemLine } from "../api/subprofiles.api";
import { useRowDragReorder } from "../useRowDragReorder";
import { newStanza, poemFromDescription } from "./poemBlocks";
import { normalizePoemBlocks } from "./poemModel";
import { PoemBlockList } from "./PoemBlockList";
import { PoemPreviewPane } from "./PoemPreviewPane";
import { PoemResplitHint } from "./PoemResplitHint";
import type { PoemRichLineHandle } from "./PoemRichLine";
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
    const lines = splitMergedLineIntoLines(resplitCandidate.lineText);
    patchLines(resplitCandidate.blockId, lines);
    // `PoemRichLine` seeds its contentEditable on mount only, so updating the
    // model alone left the field showing the single merged line: the next blur
    // re-parsed that untouched DOM and reverted the split. Write the new lines
    // into the DOM too, so the field and the model stay one thing.
    richLineHandles.current[resplitCandidate.blockId]?.setLines(lines);
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

  // Kept as a single JSX value (not a component) so it is written once but
  // rendered from exactly one place per breakpoint — desktop always mounts
  // it (caret-preserving), mobile mounts it only on the "edit" tab.
  const editorPane = (
    <div className={styles.editor}>
      <span className={styles.label}>{t("subprofiles:poem.editor.label")}</span>

      {resplitCandidate && <PoemResplitHint onResplit={handleResplit} />}

      <PoemBlockList
        blocks={blocks}
        containerRef={(node) => {
          scopeRef.current = node;
          containerRef.current = node;
        }}
        draggingIndex={draggingIndex}
        gripHandlers={gripHandlers}
        registerRichLine={(id, handle) => {
          richLineHandles.current[id] = handle;
        }}
        onPatchLines={patchLines}
        onMove={moveBlock}
        onRemove={removeBlock}
        onSplitBlock={handleSplitBlock}
        onMergeBack={handleMergeBack}
        onAddBlock={addBlock}
      />

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
