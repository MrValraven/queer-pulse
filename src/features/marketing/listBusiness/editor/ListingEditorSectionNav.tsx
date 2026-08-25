import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { MissingField } from "../listBusiness.data";
import { countMissingInSection } from "./listingEditorMissing";
import type { ListingEditorSectionDefinition } from "./listingEditor.data";
import styles from "./ListingEditor.module.css";

/**
 * Jump nav for the single-screen editor: one link per section, each carrying
 * the count of fields still needed inside it.
 *
 * A sticky rail beside the form on wide screens, and a sticky horizontal
 * scroller above it on narrow ones, so a phone can reach any section without
 * scrolling the whole form to find it.
 */
export function ListingEditorSectionNav({
  sections,
  activeSectionId,
  missing,
  onJump,
}: {
  sections: ListingEditorSectionDefinition[];
  activeSectionId: string;
  missing: MissingField[];
  onJump: (sectionId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <nav
      className={styles.nav}
      aria-label={t("marketing:listBusiness.editor.nav.aria")}
    >
      <p className={styles.navLabel}>
        {t("marketing:listBusiness.editor.nav.label")}
      </p>
      <ul className={styles.navList}>
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          const missingCount = countMissingInSection(missing, section.anchors);
          return (
            <li key={section.id}>
              <button
                type="button"
                className={[styles.navItem, isActive && styles.navItemOn]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onJump(section.id)}
              >
                <span className={styles.navItemLabel}>
                  {t(section.labelKey)}
                </span>
                {missingCount > 0 && (
                  <span
                    className={styles.navBadge}
                    aria-label={t(
                      "marketing:listBusiness.editor.nav.missingCount",
                      { count: missingCount },
                    )}
                  >
                    {missingCount}
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
