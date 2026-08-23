import { useMemo } from "react";
import styles from "./InsightsSparkline.module.css";

/** Which of the two series this is, which is also the only thing that picks
 *  its colour (see the tone classes in the stylesheet). */
export type SparklineTone = "members" | "posts";

const VIEW_WIDTH = 240;
const VIEW_HEIGHT = 52;
/** Head/foot room so a peak's 2px stroke is never clipped by the viewBox. */
const VERTICAL_PADDING = 5;

interface Geometry {
  linePoints: string;
  areaPoints: string;
  lastX: number;
  lastY: number;
}

/**
 * Map counts onto the viewBox. The vertical scale is always anchored at zero
 * (never at the series minimum), so a line sitting near the floor reads as a
 * quiet community instead of being stretched into a dramatic-looking climb.
 */
function buildGeometry(values: number[]): Geometry | null {
  if (values.length < 2) return null;
  const peak = Math.max(...values, 1);
  const usableHeight = VIEW_HEIGHT - VERTICAL_PADDING * 2;
  const xFor = (index: number) => (index / (values.length - 1)) * VIEW_WIDTH;
  const yFor = (value: number) =>
    VIEW_HEIGHT - VERTICAL_PADDING - (value / peak) * usableHeight;

  const coordinates = values.map(
    (value, index) => `${xFor(index).toFixed(2)},${yFor(value).toFixed(2)}`,
  );
  return {
    linePoints: coordinates.join(" "),
    areaPoints: [
      `0,${VIEW_HEIGHT}`,
      ...coordinates,
      `${VIEW_WIDTH},${VIEW_HEIGHT}`,
    ].join(" "),
    lastX: VIEW_WIDTH,
    lastY: yFor(values[values.length - 1]!),
  };
}

export interface InsightsSparklineProps {
  /** Series name, e.g. "New members a week". */
  label: string;
  /**
   * The text alternative, and the whole point of this component being
   * readable. A sparkline says nothing to a screen reader, so the trend is
   * stated in words here and rendered as ordinary visible copy, which serves
   * sighted readers just as well as a shape does.
   */
  caption: string;
  /** Weekly counts, oldest first. */
  values: number[];
  tone: SparklineTone;
}

/**
 * A 12-week aggregate trend line, drawn as inline SVG (no charting library,
 * and none warranted for twelve points).
 *
 * The drawing is `aria-hidden` on purpose: it carries no information the
 * caption does not already state in words, so exposing it to assistive tech
 * would only add noise. Colour comes from a single `--spark-line` custom
 * property set by the tone class, so both themes are handled by the tokens
 * rather than by a second set of values here.
 *
 * Aggregate only. Each point is how many members joined or how many posts
 * landed in one week, and nothing here can be traced to an individual member.
 */
export function InsightsSparkline({
  label,
  caption,
  values,
  tone,
}: InsightsSparklineProps) {
  const geometry = useMemo(() => buildGeometry(values), [values]);
  const toneClass = tone === "members" ? styles.toneMembers : styles.tonePosts;

  return (
    <div className={[styles.card, toneClass].join(" ")}>
      <div className={styles.label}>{label}</div>
      {geometry && (
        <svg
          className={styles.chart}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <line
            className={styles.baseline}
            x1={0}
            y1={VIEW_HEIGHT - 0.5}
            x2={VIEW_WIDTH}
            y2={VIEW_HEIGHT - 0.5}
            vectorEffect="non-scaling-stroke"
          />
          <polygon className={styles.area} points={geometry.areaPoints} />
          <polyline
            className={styles.line}
            points={geometry.linePoints}
            vectorEffect="non-scaling-stroke"
          />
          {/* The current (partial) week, marked with a vertical tick rather
              than a dot: the viewBox is stretched horizontally, which would
              squash a circle into an ellipse. */}
          <line
            className={styles.tick}
            x1={geometry.lastX}
            y1={geometry.lastY}
            x2={geometry.lastX}
            y2={VIEW_HEIGHT}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
