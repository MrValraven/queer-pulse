import { useId } from "react";
import { FiClock } from "react-icons/fi";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LEAD_STAGES, type LeadStage } from "./api/leads.types";
import { useLeadDueCount } from "./api/useLeadDueCount";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import type { LeadListControls } from "./useLeadListFilters";
import styles from "./LeadPipeline.module.css";

/** The colour of each stage's share bar, by the tone its pill keeps. */
const STAGE_BAR_CLASS: Record<LeadStage, string | undefined> = {
  to_contact: styles.barGhost,
  contacted: styles.barViolet,
  in_talks: styles.barAmber,
  on_board: styles.barJade,
  not_now: styles.barPlum,
};

/** One stage tile: its name, its count and its share of all leads. */
function PipelineTile({
  label,
  count,
  share,
  ariaLabel,
  isPressed,
  barClass,
  onPress,
}: {
  label: string;
  count: number | null;
  share: number | null;
  ariaLabel: string | undefined;
  isPressed: boolean;
  barClass: string | undefined;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.tile}
      aria-pressed={isPressed}
      aria-label={ariaLabel}
      onClick={onPress}
    >
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileCount}>
        {count === null ? (
          <span className={styles.tileCountPending} aria-hidden />
        ) : (
          <RollingNumber value={String(count)} numericValue={count} />
        )}
      </span>
      <span className={styles.tileTrack} aria-hidden>
        <span
          className={[styles.tileBar, barClass].filter(Boolean).join(" ")}
          style={{ inlineSize: `${Math.round((share ?? 0) * 100)}%` }}
        />
      </span>
    </button>
  );
}

/**
 * The pipeline at a glance, and the stage filter in one: a tile per stage
 * with how many leads sit in it and its share of the whole (both follow the
 * search and the type), All first. Beside it, the Follow-up due switch,
 * with how many open leads wait on a follow-up across the whole directory.
 * On a phone the tiles scroll sideways in one row.
 */
export function LeadPipeline({
  controls,
  stageCounts,
  totalCount,
}: {
  controls: LeadListControls;
  stageCounts: Record<LeadStage, number> | null;
  totalCount: number | null;
}) {
  const { t } = useTranslation();
  const groupLabelId = useId();
  const dueCountId = useId();
  const dueCount = useLeadDueCount({ isEnabled: true }).data ?? null;
  const { filters } = controls;
  const allLabel = t("admin:leads.list.stageAll");
  const shareOf = (count: number | null) =>
    count === null || totalCount === null || totalCount === 0
      ? null
      : count / totalCount;
  const ariaOf = (stage: string, count: number | null) =>
    count === null
      ? undefined
      : t("admin:leads.list.stageChipAria", { stage, count });

  return (
    <div className={styles.frame}>
      <div className={styles.pipeline}>
        <div
          className={styles.stages}
          role="group"
          aria-labelledby={groupLabelId}
        >
          <span id={groupLabelId} className="visuallyHidden">
            {t("admin:leads.list.stageFilterLabel")}
          </span>
          <PipelineTile
            label={allLabel}
            count={totalCount}
            share={totalCount === null ? null : 1}
            ariaLabel={ariaOf(allLabel, totalCount)}
            isPressed={filters.stage === null}
            barClass={styles.barAll}
            onPress={() => controls.setStage(null)}
          />
          {LEAD_STAGES.map((stage) => {
            const stageLabel = t(LEAD_STAGE_LABEL_KEY[stage]);
            const count = stageCounts?.[stage] ?? null;
            return (
              <PipelineTile
                key={stage}
                label={stageLabel}
                count={count}
                share={shareOf(count)}
                ariaLabel={ariaOf(stageLabel, count)}
                isPressed={filters.stage === stage}
                barClass={STAGE_BAR_CLASS[stage]}
                onPress={() =>
                  controls.setStage(filters.stage === stage ? null : stage)
                }
              />
            );
          })}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={filters.isDueOnly}
          aria-label={t("admin:leads.list.dueOnly")}
          aria-describedby={dueCount === null ? undefined : dueCountId}
          className={styles.due}
          data-has-due={(dueCount ?? 0) > 0 || undefined}
          onClick={() => controls.setIsDueOnly(!filters.isDueOnly)}
        >
          <span className={styles.dueIcon} aria-hidden>
            <FiClock />
          </span>
          <span className={styles.dueText} aria-hidden>
            <span className={styles.tileLabel}>
              {t("admin:leads.list.dueOnly")}
            </span>
            <span id={dueCountId} className={styles.dueCount}>
              {dueCount === null
                ? null
                : t("admin:leads.pipeline.dueCount", { count: dueCount })}
            </span>
          </span>
          <span className={styles.dueSwitch} aria-hidden />
        </button>
      </div>
    </div>
  );
}
