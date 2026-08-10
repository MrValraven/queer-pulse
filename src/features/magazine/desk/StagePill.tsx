import { STAGE_CLASS } from "../data/desk.copy";
import type { Stage } from "../data/desk.data";
import { cx } from "../../../shared/lib/cx";
import styles from "./StagePill.module.css";

const VARIANT_CLASS: Record<string, string | undefined> = {
  "": undefined,
  review: styles.review,
  sens: styles.sens,
  lay: styles.lay,
  ready: styles.ready,
};

/** Small rounded pill showing a piece's workflow stage, colour-coded per `STAGE_CLASS`. */
export function StagePill({ stage }: { stage: Stage }) {
  const variant = STAGE_CLASS[stage];
  return (
    <span className={cx(styles.pill, VARIANT_CLASS[variant])}>{stage}</span>
  );
}
