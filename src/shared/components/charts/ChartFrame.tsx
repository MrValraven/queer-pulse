import type { ReactNode } from "react";
import { SkeletonLine } from "../ui";
import styles from "./charts.module.css";

/**
 * Editorial chrome around a chart: title/subtitle, an optional head-aligned
 * legend, and the loading + "not measured yet" states. The chart body (and any
 * below-chart legend) renders as children. When `loading` or `empty` is set,
 * children are replaced by the skeleton / empty message.
 */
export function ChartFrame({
  title,
  subtitle,
  legend,
  loading = false,
  empty = false,
  skeletonHeight = 200,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  loading?: boolean;
  empty?: ReactNode | false;
  skeletonHeight?: number;
  children: ReactNode;
}) {
  return (
    <figure className={styles.card}>
      <div className={styles.head}>
        <div>
          <figcaption className={styles.title}>{title}</figcaption>
          {subtitle ? <div className={styles.sub}>{subtitle}</div> : null}
        </div>
        {legend}
      </div>
      {loading ? (
        <SkeletonLine
          height={skeletonHeight}
          style={{ borderRadius: 14, marginTop: 8 }}
        />
      ) : empty ? (
        <p className={styles.notMeasured}>{empty}</p>
      ) : (
        children
      )}
    </figure>
  );
}
