import styles from "./AdminBarCharts.module.css";

const PILL_HEIGHT = 20;

interface ResponseSlaMarkerProps {
  label: string;
  lineX: number;
  plotBottom: number;
  minX: number;
  maxX: number;
}

/** Dashed threshold line between the last in-SLA bucket and the first late
 *  one, with its label in a pill above the plot so no bar can touch it. */
export function ResponseSlaMarker({
  label,
  lineX,
  plotBottom,
  minX,
  maxX,
}: ResponseSlaMarkerProps) {
  const pillWidth = label.length * 6.4 + 18;
  const pillX = Math.min(
    Math.max(lineX - pillWidth / 2, minX),
    maxX - pillWidth,
  );
  return (
    <g className={styles.slaMarker} pointerEvents="none">
      <line
        x1={lineX}
        x2={lineX}
        y1={PILL_HEIGHT + 6}
        y2={plotBottom}
        className={styles.slaLine}
      />
      <rect
        className={styles.slaPill}
        x={pillX}
        y={4}
        width={pillWidth}
        height={PILL_HEIGHT}
        rx={PILL_HEIGHT / 2}
      />
      <text
        x={pillX + pillWidth / 2}
        y={4 + PILL_HEIGHT / 2 + 4}
        textAnchor="middle"
        className={styles.slaPillText}
      >
        {label}
      </text>
    </g>
  );
}
