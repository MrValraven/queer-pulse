import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { MissingField } from "../listBusiness.data";
import { countMissingInSection } from "./listingEditorMissing";
import type {
  ListingEditorSectionDefinition,
  ListingEditorSectionKey,
} from "./listingEditor.data";
import teamStyles from "../team/ListingTeam.module.css";
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
  sectionBadges,
  onJump,
}: {
  sections: ListingEditorSectionDefinition[];
  activeSectionId: string;
  missing: MissingField[];
  /** Counts of answers waiting inside a section, shown as a coral pill. */
  sectionBadges?: Partial<Record<ListingEditorSectionKey, number>>;
  onJump: (sectionId: string) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();

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
          const attentionCount = sectionBadges?.[section.key] ?? 0;
          return (
            <li key={section.id}>
              <button
                type="button"
                className={[
                  styles.navItem,
                  section.key === "dangerZone" && styles.navItemDanger,
                  isActive && styles.navItemOn,
                ]
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
                <AnimatePresence initial={false}>
                  {attentionCount > 0 && (
                    <m.span
                      key="attention"
                      className={teamStyles.navBadgeAttention}
                      role="img"
                      aria-label={t(
                        "marketing:listBusiness.editor.nav.awaitingCount",
                        { count: attentionCount },
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: reducedMotion ? 0 : 0.18 }}
                    >
                      {attentionCount}
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
