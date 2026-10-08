import { useEffect, useRef } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EDIT_SECTIONS, type EditSectionKey } from "./editDetailsSections";
import styles from "./EditDetailsNav.module.css";

/**
 * The edit-details modal's map of its five sections: a column of rows in the
 * rail on a wide dialog, a row of chips in the strip above the form on a
 * narrow one. Both are drawn, and the layout's container query hides the one
 * that does not fit with `display: none`, so only one nav is ever in the
 * accessibility tree.
 *
 * Each entry shows the section's icon and title, a dot while it holds edits
 * and a marker while it holds the rule that holds Save, each with words for a
 * screen reader. The section being read carries `aria-current`.
 */
export function EditDetailsNav({
  variant,
  activeKey,
  editedKeys,
  needsFixKey,
  onSelect,
}: {
  variant: "rail" | "strip";
  activeKey: EditSectionKey;
  editedKeys: readonly EditSectionKey[];
  needsFixKey: EditSectionKey | null;
  onSelect: (key: EditSectionKey) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const listRef = useRef<HTMLUListElement>(null);

  // The strip scrolls sideways, so the active chip is brought into its view
  // as the host reads down the form, and again whenever the strip's list
  // resizes (the dialog narrows, or the strip takes over from the rail).
  // Measured by hand so only the strip moves sideways (an element's own
  // `scrollIntoView` would also try every scrolling box around it, the page
  // and the dialog included). A hidden strip has no width and is left alone.
  useEffect(() => {
    const list = listRef.current;
    if (variant !== "strip" || !list) return;
    const revealActiveChip = () => {
      if (list.clientWidth === 0) return;
      const activeChip = list.querySelector<HTMLElement>(
        '[aria-current="true"]',
      );
      if (!activeChip) return;
      const chipStart = activeChip.offsetLeft;
      const chipEnd = chipStart + activeChip.offsetWidth;
      const edgeRoom = 16;
      const behavior: ScrollBehavior = reducedMotion ? "instant" : "smooth";
      if (chipStart - edgeRoom < list.scrollLeft) {
        list.scrollTo({ left: chipStart - edgeRoom, behavior });
      } else if (chipEnd + edgeRoom > list.scrollLeft + list.clientWidth) {
        list.scrollTo({
          left: chipEnd + edgeRoom - list.clientWidth,
          behavior,
        });
      }
    };
    revealActiveChip();
    if (typeof ResizeObserver === "undefined") return;
    const listResizeObserver = new ResizeObserver(revealActiveChip);
    listResizeObserver.observe(list);
    return () => listResizeObserver.disconnect();
  }, [activeKey, variant, reducedMotion]);

  return (
    <nav
      className={variant === "rail" ? styles.rail : styles.strip}
      aria-label={t("gatherings:manage.editModal.navLabel")}
    >
      <ul ref={listRef} className={styles.list}>
        {EDIT_SECTIONS.map(({ key, titleKey, icon: SectionIcon }) => {
          const isEdited = editedKeys.includes(key);
          const isNeedingFix = needsFixKey === key;
          return (
            <li key={key} className={styles.item}>
              <button
                type="button"
                className={styles.entry}
                aria-current={activeKey === key ? "true" : undefined}
                onClick={() => onSelect(key)}
              >
                <SectionIcon className={styles.icon} aria-hidden />
                <span className={styles.title}>{t(titleKey)}</span>
                {isNeedingFix && (
                  <span className={styles.needsFix}>
                    <FiAlertCircle aria-hidden />
                    <span className="visuallyHidden">
                      {t("gatherings:manage.editModal.sectionNeedsFix")}
                    </span>
                  </span>
                )}
                {isEdited && (
                  <span className={styles.editedDot}>
                    <span className="visuallyHidden">
                      {t("gatherings:manage.editModal.sectionEdited")}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
