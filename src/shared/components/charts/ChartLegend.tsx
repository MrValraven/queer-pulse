import styles from "./charts.module.css";

export interface LegendItem {
  color: string;
  label: string;
  /** Small dot instead of a square swatch (used for line series). */
  dot?: boolean;
  /** Short dashed line for a dashed line series (e.g. a previous period).
   *  Takes precedence over `dot`. */
  dashed?: boolean;
  /** Muted italic row with no swatch (e.g. "churned · not measured yet"). */
  muted?: boolean;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className={styles.legend}>
      {items.map((item) =>
        item.muted ? (
          <span key={item.label} className={styles.legendMuted}>
            {item.label}
          </span>
        ) : (
          <span key={item.label} className={styles.legendItem}>
            {item.dashed ? (
              <svg width={20} height={10} viewBox="0 0 20 10" aria-hidden>
                <line
                  x1={0}
                  y1={5}
                  x2={20}
                  y2={5}
                  stroke={item.color}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </svg>
            ) : (
              <span
                className={item.dot ? styles.swatchDot : styles.swatch}
                style={{ background: item.color }}
              />
            )}
            {item.label}
          </span>
        ),
      )}
    </div>
  );
}
