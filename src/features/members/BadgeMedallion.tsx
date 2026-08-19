import type { CSSProperties } from "react";
import type { Badge } from "./badges.data";
import styles from "./BadgesPage.module.css";

const TINT_CLASS = {
  jade: styles.tJade,
  accent: styles.tCoral,
  plum: styles.tPlum,
} as const;

const SIZE_CLASS = {
  md: "",
  big: styles.medBig,
  sm: styles.medSm,
  xs: styles.medXs,
} as const;

/** Same hexagon as `.medPlate`/`.medRim`'s clip-path, as SVG points — so the
 *  progress ring traces the medallion's actual silhouette instead of a circle. */
const HEX_POINTS = "50,1 94,26 94,74 50,99 6,74 6,26";

/** Rim count drives the medallion's silhouette: a plain plate for common
 *  badges, a single rim for rare, a double rim for legendary. */
function tierFor(rarity: Badge["rarity"]): 1 | 2 | 3 {
  if (rarity === "legendary") return 3;
  if (rarity === "rare") return 2;
  return 1;
}

interface BadgeMedallionProps {
  badge: Pick<Badge, "tint" | "rarity" | "icon">;
  earned: boolean;
  /** 0..100 progress toward earning — ignored (treated as 100) once earned. */
  progressPercent?: number;
  size?: "md" | "big" | "sm" | "xs";
  /** Plays the land-in animation once, for the earn-moment celebration. */
  landing?: boolean;
  className?: string;
}

/** The tiered, tinted badge medallion: rim silhouette from rarity, fill/ring
 *  colour from category tint, progress ring from `progressPercent`, and a
 *  legendary/rare gold or tinted border. Reused by the case grid, the
 *  momentum cards, the drawer, the earn moment, and the case card. */
export function BadgeMedallion({
  badge,
  earned,
  progressPercent = 0,
  size = "md",
  landing = false,
  className,
}: BadgeMedallionProps) {
  const tier = tierFor(badge.rarity);
  const percent = earned ? 100 : progressPercent;
  const rarityClass =
    badge.rarity === "legendary"
      ? styles.medRare
      : badge.rarity === "rare"
        ? styles.medUncommon
        : "";
  const classes = [
    styles.med,
    TINT_CLASS[badge.tint],
    earned ? styles.medEarned : styles.medLocked,
    rarityClass,
    !earned && percent === 0 ? styles.medZero : "",
    SIZE_CLASS[size],
    landing ? styles.medLand : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{ "--p": percent } as CSSProperties}
      aria-hidden
    >
      <svg className={styles.medRing} viewBox="0 0 100 100" aria-hidden focusable="false">
        <polygon className={styles.medRingTrack} points={HEX_POINTS} pathLength={100} />
        <polygon className={styles.medRingFill} points={HEX_POINTS} pathLength={100} />
      </svg>
      {tier >= 2 && <span className={`${styles.medRim} ${styles.medRimR1}`} />}
      {tier >= 3 && <span className={`${styles.medRim} ${styles.medRimR2}`} />}
      <span className={styles.medPlate}>{badge.icon}</span>
    </span>
  );
}
