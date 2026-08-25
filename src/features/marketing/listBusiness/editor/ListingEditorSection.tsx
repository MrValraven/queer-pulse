import type { ReactNode } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingEditorSectionDefinition } from "./listingEditor.data";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./ListingEditor.module.css";

/**
 * One titled block of the single-screen editor. Carries the section's stable
 * id so the jump nav can scroll to it, and is focusable so a jump also lands
 * the keyboard here instead of leaving it behind at the nav.
 *
 * The body wears the wizard's own `.stepBody` class, so field rhythm and the
 * open-dropdown stacking fix are identical on both surfaces.
 */
export function ListingEditorSection({
  section,
  children,
}: {
  section: ListingEditorSectionDefinition;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const titleId = `${section.id}-title`;
  return (
    <section
      id={section.id}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={styles.section}
    >
      <h2 id={titleId} className={styles.sectionTitle}>
        {t(section.labelKey)}
      </h2>
      <div className={pageStyles.stepBody}>{children}</div>
    </section>
  );
}
