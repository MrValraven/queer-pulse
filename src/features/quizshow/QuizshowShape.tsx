import type { CSSProperties } from "react";
import type {
  QuizshowTeamColorKey,
  QuizshowTeamShape,
} from "../../shared/contracts/quizshow";
import styles from "./QuizshowShape.module.css";
import { QUIZSHOW_SWATCHES, type QuizshowSwatchTier } from "./quizshowSwatches";

export type QuizshowShapeSize = "small" | "medium" | "large" | "screen";

interface QuizshowShapeProps {
  colorKey: QuizshowTeamColorKey;
  size: QuizshowShapeSize;
  /** Accessible name from `teamShapeLabel` ("Circle 2"), or null when a neighbour already names it (then aria-hidden). */
  label: string | null;
  /** A soft halo in the shape's own colour, for the velvet stage. */
  isGlowing?: boolean;
}

/** The two light fills that sit near 2:1 on the page; they get a faint ink edge in light, every tier. */
const EDGED_SHAPES: ReadonlySet<QuizshowTeamShape> = new Set([
  "circle",
  "hexagon",
]);

/** Tier 1 solid (the base `.shape`), tier 2 outline, tier 3 dotted fill (C2.1). */
const TIER_CLASS_NAMES: Record<QuizshowSwatchTier, string | undefined> = {
  1: undefined,
  2: styles.tierOutline,
  3: styles.tierDotted,
};

export function QuizshowShape({
  colorKey,
  size,
  label,
  isGlowing = false,
}: QuizshowShapeProps) {
  const swatch = QUIZSHOW_SWATCHES[colorKey];
  const className = [
    styles.shape,
    styles[size],
    EDGED_SHAPES.has(swatch.shape) ? styles.edged : "",
    isGlowing ? styles.glowing : "",
    TIER_CLASS_NAMES[swatch.tier] ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const ShapeIcon = swatch.icon;
  const swatchStyle = {
    "--quizshow-shape-fill": swatch.fillVar,
    "--quizshow-shape-ink": swatch.inkVar,
  } as CSSProperties;
  const accessibilityProps =
    label === null
      ? { "aria-hidden": true }
      : { role: "img", "aria-label": label };
  return (
    <span className={className} style={swatchStyle} {...accessibilityProps}>
      <ShapeIcon
        className={styles.icon}
        fill="currentColor"
        strokeWidth={0}
        aria-hidden="true"
        focusable="false"
      />
      {swatch.tier !== 1 && (
        <span className={styles.tierBadge} aria-hidden="true">
          {swatch.tier}
        </span>
      )}
    </span>
  );
}
