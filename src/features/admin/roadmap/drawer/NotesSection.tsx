import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { RoadmapItemUpdateBody } from "../../api/roadmapAdmin.types";
import styles from "./ItemDrawer.module.css";

/**
 * Internal notes (never shown to members) + the public one-liner shown on
 * `/roadmap`. Two independent fields, both plain text.
 */
export function NotesSection({
  description,
  publicNote,
  onFieldChange,
}: {
  description: string;
  publicNote: string | null;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.internalNotes.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.internalNotes.note")}
        </p>
      </div>
      <textarea
        className={styles.textarea}
        rows={3}
        value={description}
        placeholder={t("admin:roadmap.drawer.internalNotes.placeholder")}
        aria-label={t("admin:roadmap.drawer.internalNotes.title")}
        onChange={(event) => onFieldChange({ description: event.target.value })}
      />

      <div className={`${styles.sectionHead} ${styles.sectionHeadSpaced}`}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.publicOneLiner.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.publicOneLiner.note")}
        </p>
      </div>
      <input
        className={styles.textInput}
        value={publicNote ?? ""}
        placeholder={t("admin:roadmap.drawer.publicOneLiner.placeholder")}
        aria-label={t("admin:roadmap.drawer.publicOneLiner.title")}
        onChange={(event) =>
          onFieldChange({
            publicNote:
              event.target.value.length > 0 ? event.target.value : null,
          })
        }
      />
    </div>
  );
}
