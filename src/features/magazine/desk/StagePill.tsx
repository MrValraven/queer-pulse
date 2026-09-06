import { STAGE_CLASS } from "../data/desk.copy";
import type { Stage } from "../data/desk.data";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StagePill.module.css";

const VARIANT_CLASS: Record<string, string | undefined> = {
  "": undefined,
  review: styles.review,
  sens: styles.sens,
  lay: styles.lay,
  ready: styles.ready,
  published: styles.published,
};

/** Small rounded pill showing a piece's workflow stage, colour-coded per `STAGE_CLASS`. */
export function StagePill({ stage }: { stage: Stage }) {
  const { t } = useTranslation();
  const variant = STAGE_CLASS[stage];
  return (
    <span className={cx(styles.pill, VARIANT_CLASS[variant])}>
      {/* `stage` IS its own English label ("Sensitivity read"), so it goes
          through the shared stage-key lookup rather than straight to screen. */}
      {t(viewStageLabelKey(stage))}
    </span>
  );
}
