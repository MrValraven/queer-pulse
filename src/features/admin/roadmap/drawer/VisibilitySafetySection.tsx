import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  RoadmapItemUpdateBody,
  RoadmapSafetyStatus,
} from "../../api/roadmapAdmin.types";
import { AdminSeg, AdminToggle } from "../../ui";
import styles from "./ItemDrawer.module.css";

const SAFETY_VALUES: RoadmapSafetyStatus[] = [0, 1, 2];
const SAFETY_KEYS: Record<RoadmapSafetyStatus, string> = {
  0: "none",
  1: "required",
  2: "cleared",
};

/**
 * Public/requested toggles + the safety-review segment. `onPublicToggle` is
 * the caller's guarded handler (`ItemDrawer.tsx`) — turning "visible on the
 * public roadmap" on while `safetyStatus === 1` must open the Safety-gate
 * modal instead of writing directly, so this section never calls
 * `onFieldChange({ isPublic: true })` itself.
 */
export function VisibilitySafetySection({
  isPublic,
  requested,
  safetyStatus,
  onPublicToggle,
  onFieldChange,
}: {
  isPublic: boolean;
  requested: boolean;
  safetyStatus: RoadmapSafetyStatus;
  onPublicToggle: (next: boolean) => void;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();
  const safetyOptions = SAFETY_VALUES.map((value) => ({
    value: String(value),
    label: t(`admin:roadmap.drawer.visibility.safety.${SAFETY_KEYS[value]}`),
  }));

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin:roadmap.drawer.visibility.title")}
      </h3>

      <div className={styles.toggleRow}>
        <div className={styles.toggleTx}>
          <span className={styles.toggleTitle}>
            {t("admin:roadmap.drawer.visibility.publicToggle.title")}
          </span>
          <span className={styles.toggleSub}>
            {t("admin:roadmap.drawer.visibility.publicToggle.sub")}
          </span>
        </div>
        <AdminToggle
          checked={isPublic}
          onChange={onPublicToggle}
          label={t("admin:roadmap.drawer.visibility.publicToggle.title")}
        />
      </div>

      <div className={styles.toggleRow}>
        <div className={styles.toggleTx}>
          <span className={styles.toggleTitle}>
            {t("admin:roadmap.drawer.visibility.requestedToggle.title")}
          </span>
          <span className={styles.toggleSub}>
            {t("admin:roadmap.drawer.visibility.requestedToggle.sub")}
          </span>
        </div>
        <AdminToggle
          checked={requested}
          onChange={(value) => onFieldChange({ requested: value })}
          label={t("admin:roadmap.drawer.visibility.requestedToggle.title")}
        />
      </div>

      <label className={styles.fieldLabel}>
        {t("admin:roadmap.drawer.visibility.safetyLabel")}
      </label>
      <AdminSeg
        options={safetyOptions}
        value={String(safetyStatus)}
        onChange={(value) =>
          onFieldChange({ safetyStatus: Number(value) as RoadmapSafetyStatus })
        }
      />

      {safetyStatus === 1 && (
        <p className={styles.warningBanner}>
          {t("admin:roadmap.drawer.visibility.gatedWarning")}
        </p>
      )}
    </div>
  );
}
