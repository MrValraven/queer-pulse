import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { RoadmapItemUpdateBody } from "../../api/roadmapAdmin.types";
import { Button } from "../../../../shared/components/ui";
import { DEFAULT_GUIDE } from "./itemDrawer.data";
import styles from "./ItemDrawer.module.css";

/**
 * Shown instead of `GuideSection` when `item.guide` is `null` — a plain
 * percent-done slider, with a shortcut to promote the item into a resource
 * guide (sets a fresh `guide`, which flips the drawer to the checklist).
 */
export function ProgressSection({
  progress,
  onFieldChange,
}: {
  progress: number | null;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();
  const value = progress ?? 0;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin:roadmap.drawer.progress.title")}
      </h3>

      <label className={styles.fieldLabel} htmlFor="drawer-progress">
        {t("admin:roadmap.drawer.progress.percentDoneLabel")}
      </label>
      <div className={styles.sliderRow}>
        <input
          id="drawer-progress"
          type="range"
          min={0}
          max={100}
          step={5}
          className={styles.slider}
          value={value}
          onChange={(event) =>
            onFieldChange({ progress: Number(event.target.value) })
          }
        />
        <span className={styles.sliderValue}>{value}%</span>
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={() => onFieldChange({ guide: DEFAULT_GUIDE })}
      >
        {t("admin:roadmap.drawer.progress.trackAsGuideCta")}
      </Button>
    </div>
  );
}
