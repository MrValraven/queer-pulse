import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  GuideBlockKind,
  GuideSection,
} from "./api/adminResourceGuides.api";
import {
  GUIDE_BLOCK_KINDS,
  newSection,
  cloneSections,
} from "./adminResourceGuideEditor.utils";
import styles from "./AdminResourceGuidesPage.module.css";

export interface AdminResourceGuideSectionsProps {
  sections: GuideSection[];
  onChange: (sections: GuideSection[]) => void;
  /** Distinguishes the English and Portuguese editors' control ids. */
  idPrefix: string;
}

/**
 * The prose editor: an ordered list of sections, each an H2 plus ordered
 * blocks of four kinds.
 *
 * This is the whole of CON-08 from an editor's side. Changing a paragraph in
 * a trans healthcare pathway used to mean an engineer editing two or three
 * files across two directories in two languages, plus a deploy. Here it is a
 * textarea. The model stays deliberately small so a non-engineer can hold it
 * in their head, and every block is plain text, so no editorial mistake can
 * break a page's layout.
 */
export function AdminResourceGuideSections({
  sections,
  onChange,
  idPrefix,
}: AdminResourceGuideSectionsProps) {
  const { t } = useTranslation();

  function updateSection(sectionIndex: number, changes: Partial<GuideSection>) {
    const next = cloneSections(sections);
    const target = next[sectionIndex];
    if (!target) return;
    next[sectionIndex] = { ...target, ...changes };
    onChange(next);
  }

  function moveSection(sectionIndex: number, delta: number) {
    const target = sectionIndex + delta;
    if (target < 0 || target >= sections.length) return;
    const next = cloneSections(sections);
    const moved = next[sectionIndex];
    const displaced = next[target];
    if (!moved || !displaced) return;
    next[sectionIndex] = displaced;
    next[target] = moved;
    onChange(next);
  }

  function removeSection(sectionIndex: number) {
    onChange(
      cloneSections(sections).filter((_, index) => index !== sectionIndex),
    );
  }

  function addBlock(sectionIndex: number) {
    const next = cloneSections(sections);
    const target = next[sectionIndex];
    if (!target) return;
    target.blocks.push({ kind: "paragraph", text: "" });
    onChange(next);
  }

  function updateBlock(
    sectionIndex: number,
    blockIndex: number,
    changes: { kind?: GuideBlockKind; text?: string },
  ) {
    const next = cloneSections(sections);
    const block = next[sectionIndex]?.blocks[blockIndex];
    if (!block) return;
    if (changes.kind !== undefined) block.kind = changes.kind;
    if (changes.text !== undefined) block.text = changes.text;
    onChange(next);
  }

  function removeBlock(sectionIndex: number, blockIndex: number) {
    const next = cloneSections(sections);
    const target = next[sectionIndex];
    if (!target) return;
    target.blocks = target.blocks.filter((_, index) => index !== blockIndex);
    onChange(next);
  }

  return (
    <div className={styles.sectionsEditor}>
      {sections.length === 0 && (
        <p className={styles.sectionsEmpty}>
          {t("admin:adminResourceGuides.sections.empty")}
        </p>
      )}

      {sections.map((section, sectionIndex) => (
        <div key={`${idPrefix}-${sectionIndex}`} className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <label
              className={styles.fieldLabel}
              htmlFor={`${idPrefix}-heading-${sectionIndex}`}
            >
              {t("admin:adminResourceGuides.sections.headingLabel")}
            </label>
            <div className={styles.sectionHeadRow}>
              <input
                id={`${idPrefix}-heading-${sectionIndex}`}
                className={styles.textInput}
                value={section.heading}
                onChange={(event) =>
                  updateSection(sectionIndex, { heading: event.target.value })
                }
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => moveSection(sectionIndex, -1)}
                disabled={sectionIndex === 0}
                aria-label={t("admin:adminResourceGuides.sections.moveUp")}
              >
                <FiChevronUp aria-hidden />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => moveSection(sectionIndex, 1)}
                disabled={sectionIndex === sections.length - 1}
                aria-label={t("admin:adminResourceGuides.sections.moveDown")}
              >
                <FiChevronDown aria-hidden />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => removeSection(sectionIndex)}
                aria-label={t(
                  "admin:adminResourceGuides.sections.removeSection",
                )}
              >
                <FiTrash2 aria-hidden />
              </button>
            </div>

            <label
              className={styles.fieldLabel}
              htmlFor={`${idPrefix}-anchor-${sectionIndex}`}
            >
              {t("admin:adminResourceGuides.sections.anchorLabel")}
            </label>
            <input
              id={`${idPrefix}-anchor-${sectionIndex}`}
              className={styles.textInput}
              value={section.id}
              onChange={(event) =>
                updateSection(sectionIndex, { id: event.target.value })
              }
            />
          </div>

          {section.blocks.map((block, blockIndex) => (
            <div
              key={`${idPrefix}-${sectionIndex}-${blockIndex}`}
              className={styles.blockRow}
            >
              <Select
                aria-label={t("admin:adminResourceGuides.sections.kindLabel")}
                value={block.kind}
                options={GUIDE_BLOCK_KINDS.map((kind) => ({
                  value: kind,
                  label: t(`admin:adminResourceGuides.blockKind.${kind}`),
                }))}
                onChange={(value) =>
                  updateBlock(sectionIndex, blockIndex, {
                    kind: (value ?? block.kind) as GuideBlockKind,
                  })
                }
              />
              <textarea
                className={styles.textarea}
                value={block.text}
                aria-label={t("admin:adminResourceGuides.sections.textLabel")}
                onChange={(event) =>
                  updateBlock(sectionIndex, blockIndex, {
                    text: event.target.value,
                  })
                }
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => removeBlock(sectionIndex, blockIndex)}
                aria-label={t("admin:adminResourceGuides.sections.removeBlock")}
              >
                <FiTrash2 aria-hidden />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addBlock(sectionIndex)}
          >
            <FiPlus aria-hidden />{" "}
            {t("admin:adminResourceGuides.sections.addBlockCta")}
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange([...cloneSections(sections), newSection(sections)])
        }
      >
        <FiPlus aria-hidden />{" "}
        {t("admin:adminResourceGuides.sections.addSectionCta")}
      </Button>
    </div>
  );
}
