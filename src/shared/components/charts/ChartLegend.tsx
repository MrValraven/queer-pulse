import styles from "./charts.module.css";

export interface LegendItem {
  color: string;
  label: string;
  /** Small dot instead of a square swatch (used for line series). */
  dot?: boolean;
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
            <span
              className={item.dot ? styles.swatchDot : styles.swatch}
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ),
      )}
    </div>
  );
}
