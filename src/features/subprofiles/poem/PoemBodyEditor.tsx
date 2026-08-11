import { useRef, useState } from "react";
import { FiArrowDown, FiArrowUp, FiFeather, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PoemBlock } from "../api/subprofiles.api";
import {
  newBreak,
  newNote,
  newStanza,
  poemFromDescription,
} from "./poemBlocks";
import { sanitizePoemHtml } from "./sanitizePoemHtml";
import { PoemRichLine } from "./PoemRichLine";
import { PoemSelectionToolbar } from "./PoemSelectionToolbar";
import styles from "./PoemBodyEditor.module.css";

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
  // Seed once: existing blocks win; else a stanza from legacy description.
  const [blocks, setBlocks] = useState<PoemBlock[]>(() =>
    value && value.length > 0 ? value : poemFromDescription(description),
  );

  function commit(next: PoemBlock[]) {
    setBlocks(next);
    onChange(next);
  }

  function patchHtml(id: string, rawHtml: string) {
    commit(
      blocks.map((block) =>
        block.kind !== "break" && block.id === id
          ? { ...block, html: sanitizePoemHtml(rawHtml) }
          : block,
      ),
    );
  }

  function addBlock(block: PoemBlock) {
    commit([...blocks, block]);
  }

  function removeBlock(id: string) {
    commit(blocks.filter((block) => block.id !== id));
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target]!, next[index]!];
    commit(next);
  }

  return (
    <div className={styles.editor}>
      <span className={styles.label}>{t("subprofiles:poem.editor.label")}</span>

      <div className={styles.blocks} ref={scopeRef}>
        {blocks.map((block, index) => (
          <div key={block.id} className={styles.block} data-kind={block.kind}>
            <div className={styles.blockMain}>
              {block.kind === "break" ? (
                <div className={styles.breakRow} aria-hidden>
                  * * *
                </div>
              ) : (
                <PoemRichLine
                  html={block.html}
                  onChange={(html) => patchHtml(block.id, html)}
                  placeholder={t(
                    block.kind === "note"
                      ? "subprofiles:poem.editor.notePlaceholder"
                      : "subprofiles:poem.editor.stanzaPlaceholder",
                  )}
                  className={block.kind === "note" ? styles.note : undefined}
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
        ))}
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
}
