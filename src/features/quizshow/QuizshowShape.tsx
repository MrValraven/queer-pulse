import type { CSSProperties } from "react";
import type { QuizshowTeamColorKey } from "../../shared/contracts/quizshow";
import styles from "./QuizshowShape.module.css";
import { QUIZSHOW_SWATCHES } from "./quizshowSwatches";

export type QuizshowShapeSize = "small" | "medium" | "large" | "screen";

interface QuizshowShapeProps {
  colorKey: QuizshowTeamColorKey;
  size: QuizshowShapeSize;
  /** Accessible name, or null when a neighbour already names it (then aria-hidden). */
  label: string | null;
}

/** The two light fills that sit near 2:1 on the page; they get a faint ink edge in light. */
const EDGED_COLOR_KEYS: ReadonlySet<QuizshowTeamColorKey> = new Set([
  "circle",
  "hexagon",
]);

export function QuizshowShape({ colorKey, size, label }: QuizshowShapeProps) {
  const swatch = QUIZSHOW_SWATCHES[colorKey];
  const className = [
    styles.shape,
    styles[size],
    EDGED_COLOR_KEYS.has(colorKey) ? styles.edged : "",
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
    </span>
  );
}
