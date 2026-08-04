import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { RoadmapItemUpdateBody } from "../../api/roadmapAdmin.types";
import { Button } from "../../../../shared/components/ui";
import styles from "./ItemDrawer.module.css";

/**
 * Blocked-by / blocked-why — shown publicly on purpose (per the catalog
 * copy: "blockers are not embarrassing"). `blockedBy !== null` is the
 * "is blocked" state; marking blocked starts both fields at `""` so the two
 * inputs appear for the admin to fill in immediately.
 */
export function BlockedSection({
  blockedBy,
  blockedWhy,
  onFieldChange,
}: {
  blockedBy: string | null;
  blockedWhy: string | null;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();
  const isBlocked = blockedBy !== null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.blocked.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.blocked.note")}
        </p>
      </div>

      {!isBlocked ? (
        <>
          <p className={styles.emptyNote}>
            {t("admin:roadmap.drawer.blocked.none")}
          </p>
          <Button
            variant="ghost"
            size="md"
            onClick={() => onFieldChange({ blockedBy: "", blockedWhy: "" })}
          >
            {t("admin:roadmap.drawer.blocked.markCta")}
          </Button>
        </>
      ) : (
        <>
          <label className={styles.fieldLabel} htmlFor="blocked-by">
            {t("admin:roadmap.drawer.blocked.byLabel")}
          </label>
          <input
            id="blocked-by"
            className={styles.textInput}
            value={blockedBy}
            placeholder={t("admin:roadmap.drawer.blocked.byPlaceholder")}
            onChange={(event) => onFieldChange({ blockedBy: event.target.value })}
          />

          <label className={styles.fieldLabel} htmlFor="blocked-why">
            {t("admin:roadmap.drawer.blocked.whyPlaceholder")}
          </label>
          <textarea
            id="blocked-why"
            className={styles.textarea}
            rows={2}
            value={blockedWhy ?? ""}
            placeholder={t("admin:roadmap.drawer.blocked.whyPlaceholder")}
            onChange={(event) => onFieldChange({ blockedWhy: event.target.value })}
          />

          <Button
            variant="ghost"
            size="md"
            onClick={() => onFieldChange({ blockedBy: null, blockedWhy: null })}
          >
            {t("admin:roadmap.drawer.blocked.unblockCta")}
          </Button>
        </>
      )}
    </div>
  );
}
