import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DraftSection } from "./guideDraft";
import styles from "./GuideDocument.module.css";

/** The English section sharing this PT section's anchor, read-only, so a
 *  translator never has to switch languages to see the source. */
export function GuideTranslationReference({
  section,
}: {
  section: DraftSection | null;
}) {
  const { t } = useTranslation();
  return (
    <aside
      className={styles.reference}
      aria-label={t("admin:guideWorkspace.translation.referenceLabel")}
    >
      <p className={styles.referenceEyebrow}>
        {t("admin:guideWorkspace.translation.englishEyebrow")}
      </p>
      {section ? (
        <>
          {section.heading && (
            <p className={styles.referenceHeading}>{section.heading}</p>
          )}
          {section.blocks
            .filter((block) => block.text.trim() !== "")
            .map((block) => (
              <p key={block.key} className={styles.referenceText}>
                {block.text}
              </p>
            ))}
        </>
      ) : (
        <p className={styles.referenceEmpty}>
          {t("admin:guideWorkspace.translation.noEnglishMatch")}
        </p>
      )}
    </aside>
  );
}
