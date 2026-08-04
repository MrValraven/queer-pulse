import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import styles from "./Card.module.css";

/**
 * The Board card's progress meter — building-column cards only, per the
 * spec. Fills with `transform: scaleX()` (not `width`) so the fill stays a
 * compositor-only animation; switches to the danger tone when the item is
 * also blocked, so a stalled bar reads as "stuck," not "steadily
 * progressing."
 */
export function CardProgressMeter({ item }: { item: AdminRoadmapItemDTO }) {
  const { t } = useTranslation();
  if (item.column !== "building") return null;

  const progress = Math.max(0, Math.min(100, item.progress ?? 0));
  const isBlocked = Boolean(item.blockedBy);

  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-label={t("admin:roadmap.drawer.progress.percentDoneLabel")}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[styles.progressFill, isBlocked && styles.progressFillBlocked]
          .filter(Boolean)
          .join(" ")}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
