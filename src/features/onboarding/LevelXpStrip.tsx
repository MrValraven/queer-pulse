import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRecognition } from "../members/api/useRecognition";
import styles from "./GettingStartedPage.module.css";

/**
 * A quiet level/XP strip above the checklist, surfacing the incentive for
 * finishing the first-steps: current level, a progress bar toward the next
 * one, and a hint that each step contributes XP. Gated on `hasRealData` so it
 * never renders the zeroed live placeholder while the fetch is in flight, and
 * simply doesn't render until real data lands (the checklist above it already
 * covers the loading state).
 */
export function LevelXpStrip() {
  const { t } = useTranslation();
  const recognition = useRecognition();
  if (!recognition.hasRealData || recognition.isLoading) return null;
  const { level } = recognition;
  return (
    <section
      className={styles.levelStrip}
      aria-label={t("auth:gettingStarted.levelStrip.eyebrow")}
    >
      <div className={styles.levelStripHead}>
        <span className={styles.levelStripEyebrow}>
          {t("auth:gettingStarted.levelStrip.eyebrow")}
        </span>
        <strong className={styles.levelStripName}>{level.name}</strong>
      </div>
      <div
        className={styles.levelStripTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level.percent)}
        aria-label={t("auth:gettingStarted.levelStrip.progress", {
          xp: String(level.xp),
          xpMax: String(level.xpMax),
        })}
      >
        <span
          className={styles.levelStripFill}
          style={{ width: `${level.percent}%` }}
        />
      </div>
      <span className={styles.levelStripMeta}>
        {t("auth:gettingStarted.levelStrip.progress", {
          xp: String(level.xp),
          xpMax: String(level.xpMax),
        })}
      </span>
      <p className={styles.levelStripHint}>
        {t("auth:gettingStarted.levelStrip.hint")}
      </p>
    </section>
  );
}
