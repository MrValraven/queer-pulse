import type { CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRecognition } from "../members/api/useRecognition";
import { levelNameKeyFor } from "../members/levelLadder.data";
import styles from "./GettingStartedPage.module.css";

/**
 * A quiet level/XP card above the checklist, surfacing the incentive for
 * finishing the first-steps: current level on a plum dial (mirroring the
 * badges page's hero dial), a progress ring toward the next level, and a
 * hint that each step contributes XP. Gated on `hasRealData` so it never
 * renders the zeroed live placeholder while the fetch is in flight, and
 * simply doesn't render until real data lands (the checklist above it
 * already covers the loading state).
 *
 * `hint` overrides the default "each step earns XP" copy — the checklist's
 * all-done screen has no remaining steps to point at, so it passes its own.
 *
 * `force` bypasses the backend's recompute throttle — pass it while the
 * checklist still has steps left, since a member can complete several of
 * them within minutes and would otherwise see a stale XP total.
 */
export function LevelXpStrip({
  hint,
  force,
}: { hint?: string; force?: boolean } = {}) {
  const { t } = useTranslation();
  const recognition = useRecognition(undefined, { force });
  if (!recognition.hasRealData || recognition.isLoading) return null;
  const { level } = recognition;
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);
  const dialStyle = { "--p": level.percent } as CSSProperties;
  const progressLabel = t("auth:gettingStarted.levelStrip.progress", {
    xp: String(level.xp),
    xpMax: String(level.xpMax),
  });

  return (
    <section
      className={styles.levelCard}
      aria-label={t("auth:gettingStarted.levelStrip.eyebrow")}
    >
      <div className={styles.levelCardGlow} aria-hidden />
      <span className={styles.levelCardEyebrow}>
        {t("auth:gettingStarted.levelStrip.eyebrow")}
      </span>
      <div
        className={styles.levelDial}
        style={dialStyle}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level.percent)}
        aria-label={progressLabel}
      >
        <span className={styles.levelDialRing} aria-hidden />
        <span className={styles.levelDialIn}>
          <span className={styles.levelDialNum}>{level.level}</span>
          <span className={styles.levelDialName}>
            {levelNameKey ? t(levelNameKey) : level.name}
          </span>
        </span>
      </div>
      <span className={styles.levelCardXp}>{progressLabel}</span>
      <p className={styles.levelCardHint}>
        {hint ?? t("auth:gettingStarted.levelStrip.hint")}
      </p>
    </section>
  );
}
