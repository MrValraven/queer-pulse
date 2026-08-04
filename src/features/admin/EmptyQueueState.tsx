import { FiCheck } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EmptyQueueState.module.css";

/** Small resting orb on the calm line — position only; all share one tone. */
type RestOrb = { cx: number; cy: number; r: number };

/** Three orbs settled along the horizon, evenly spaced within the 300×150
 *  viewBox — nothing left drifting in, nothing waiting to be picked up. */
const ORBS: RestOrb[] = [
  { cx: 104, cy: 96, r: 6 },
  { cx: 150, cy: 90, r: 7 },
  { cx: 196, cy: 96, r: 6 },
];

/**
 * Shown in the admin listings queue once every submission has been triaged.
 * The repo's plum-panel success pattern (cream text, coral `<em>`, jade mark)
 * paired with a small abstract illustration: orbs at rest on a calm horizon,
 * nothing left pending. Follows the `illustration` skill — abstract, token-
 * built, ≤2 stroke weights, one idea, gated motion.
 */
export function EmptyQueueState() {
  const { t } = useTranslation();
  return (
    <div className={styles.panel} role="status">
      <div className={styles.mark}>
        <FiCheck size={24} color="var(--jade)" aria-hidden />
      </div>

      <svg
        className={styles.art}
        viewBox="0 0 300 150"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="qpQueueGlow">
            <stop offset="0%" stopColor="rgba(var(--jade-rgb), 0.28)" />
            <stop offset="60%" stopColor="rgba(var(--jade-rgb), 0)" />
          </radialGradient>
        </defs>

        {/* Soft field behind the horizon — settles in once, no loop */}
        <circle
          className={styles.artGlow}
          cx={150}
          cy={92}
          r={92}
          fill="url(#qpQueueGlow)"
        />

        {/* The calm horizon everything has come to rest on */}
        <path
          className={styles.artLine}
          d="M40 108 Q150 132 260 108"
          fill="none"
          stroke="rgba(var(--cream-rgb), 0.28)"
          strokeWidth={1.4}
          strokeLinecap="round"
        />

        {/* Orbs at rest — every submission has already found its place */}
        {ORBS.map((orb, index) => (
          <circle
            key={index}
            className={styles.artOrb}
            style={{ animationDelay: `${index * 0.06}s` }}
            cx={orb.cx}
            cy={orb.cy}
            r={orb.r}
            fill="var(--jade)"
            stroke="rgba(var(--cream-rgb), 0.5)"
            strokeWidth={1.2}
          />
        ))}
      </svg>

      <h3 className={styles.title}>
        <Translation
          i18nKey="admin:adminListings.emptyQueue.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.body}>{t("admin:adminListings.emptyQueue.body")}</p>
    </div>
  );
}
