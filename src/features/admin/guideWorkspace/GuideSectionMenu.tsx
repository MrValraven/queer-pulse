import { useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiMoreHorizontal,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { guideSectionMoveButtonId } from "./guideCaret";
import type { DraftSection } from "./guideDraft";
import { guideSectionAnchorId } from "./guideWorkspace.data";
import type { GuideStructureEditing } from "./useGuideStructureEditing";
import styles from "./GuideDocument.module.css";

/**
 * The section's options: its anchor, move and remove. Rendered inline under
 * the heading row (no popover to clip), and forced open while the anchor has
 * a validation issue so the field it points at is on screen.
 */
export function GuideSectionMenu({
  section,
  sectionIndex,
  sectionCount,
  hasAnchorIssue,
  structure,
}: {
  section: DraftSection;
  sectionIndex: number;
  sectionCount: number;
  hasAnchorIssue: boolean;
  structure: GuideStructureEditing;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isPanelOpen = isOpen || hasAnchorIssue;
  const panelId = `guide-section-menu-${section.key}`;
  const anchorId = guideSectionAnchorId(section.key);

  return (
    <div className={styles.sectionMenu}>
      <Button
        variant="icon"
        size="sm"
        aria-label={t("admin:guideWorkspace.section.menuLabel")}
        aria-expanded={isPanelOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <FiMoreHorizontal aria-hidden />
      </Button>
      {isPanelOpen && (
        <div id={panelId} className={styles.sectionMenuPanel}>
          <label className={styles.menuLabel} htmlFor={anchorId}>
            {t("admin:guideWorkspace.section.anchorLabel")}
          </label>
          <input
            id={anchorId}
            className={styles.anchorInput}
            value={section.id}
            spellCheck={false}
            aria-invalid={hasAnchorIssue || undefined}
            onChange={(event) =>
              structure.setSectionAnchor(section.key, event.target.value)
            }
          />
          <p className={styles.menuHint}>
            {t("admin:guideWorkspace.section.anchorHint", {
              anchor: section.id,
            })}
          </p>
          <div className={styles.menuActions}>
            <Button
              id={guideSectionMoveButtonId(section.key, "up")}
              variant="ghost"
              size="sm"
              disabled={sectionIndex === 0}
              onClick={() => structure.moveSection(section.key, "up")}
            >
              <FiArrowUp aria-hidden />{" "}
              {t("admin:guideWorkspace.section.moveUp")}
            </Button>
            <Button
              id={guideSectionMoveButtonId(section.key, "down")}
              variant="ghost"
              size="sm"
              disabled={sectionIndex === sectionCount - 1}
              onClick={() => structure.moveSection(section.key, "down")}
            >
              <FiArrowDown aria-hidden />{" "}
              {t("admin:guideWorkspace.section.moveDown")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => structure.removeSection(section.key)}
            >
              <FiTrash2 aria-hidden />{" "}
              {t("admin:guideWorkspace.section.remove")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
