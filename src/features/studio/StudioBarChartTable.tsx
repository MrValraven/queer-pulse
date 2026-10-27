import { useId, useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import type { StudioBarChartLabels } from "./StudioBarChart";
import type { StudioBarBucket } from "./studioBarBuckets";
import styles from "./StudioDashboardActivityChart.module.css";

/** The data table that mirrors a Studio bar chart, newest first, behind a
 *  toggle. The table id comes from `useId`, so two charts on one page keep
 *  their own `aria-controls` target. */
export function StudioBarChartTable({
  buckets,
  labels,
  bucketLabelOf,
  countLabelOf,
}: {
  buckets: StudioBarBucket[];
  labels: StudioBarChartLabels;
  bucketLabelOf: (bucket: StudioBarBucket) => string;
  countLabelOf: (bucket: StudioBarBucket) => string;
}) {
  const tableId = useId();
  const [isTableShown, setIsTableShown] = useState(false);
  return (
    <>
      <Button
        variant="quiet"
        size="sm"
        aria-expanded={isTableShown}
        aria-controls={tableId}
        onClick={() => setIsTableShown((current) => !current)}
      >
        {isTableShown ? labels.hideTable : labels.showTable}
      </Button>
      <Collapse isOpen={isTableShown}>
        <table id={tableId} className={styles.table}>
          <caption className={styles.caption}>{labels.tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{labels.bucketColumn}</th>
              <th scope="col">{labels.countColumn}</th>
            </tr>
          </thead>
          <tbody>
            {[...buckets].reverse().map((bucket) => (
              <tr key={bucket.key}>
                <th scope="row">{bucketLabelOf(bucket)}</th>
                <td>{countLabelOf(bucket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Collapse>
    </>
  );
}
