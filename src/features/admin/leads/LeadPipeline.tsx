import { FiClock } from "react-icons/fi";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminStat, AdminStatTiles } from "../ui";
import { LEAD_STAGES, type LeadStage } from "./api/leads.types";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import type { LeadListControls } from "./useLeadListFilters";

/** A count as a rolling figure, so a stage move ticks the tile it left and
 *  the tile it joined. */
function rollingCount(count: number) {
  return <RollingNumber value={String(count)} numericValue={count} />;
}

/** The visible figure hides from assistive tech; the hidden phrase carries
 *  the stage, the count and the unit ("On board, 2 leads"). */
function SpokenCount({ count, phrase }: { count: number; phrase: string }) {
  return (
    <>
      <span aria-hidden>{rollingCount(count)}</span>
      <span className="visuallyHidden">{phrase}</span>
    </>
  );
}

/**
 * The pipeline at a glance, and the stage filter in one: a tile per stage
 * with how many leads sit in it (the counts follow the search and the type),
 * then the Follow-up due tile with how many open leads wait on a follow-up,
 * over the same search and type, so every number in the strip answers the
 * same question. Pressing a tile filters the list by it, and pressing the
 * chosen tile again clears it. Every count comes from the list's first page.
 */
export function LeadPipeline({
  controls,
  stageCounts,
  dueCount,
}: {
  controls: LeadListControls;
  stageCounts: Record<LeadStage, number> | null;
  dueCount: number | null;
}) {
  const { t } = useTranslation();
  const { filters } = controls;

  return (
    <AdminStatTiles columns={3} label={t("admin:leads.list.stageFilterLabel")}>
      {LEAD_STAGES.map((stage) => {
        const stageLabel = t(LEAD_STAGE_LABEL_KEY[stage]);
        const count = stageCounts?.[stage] ?? null;
        return (
          <AdminStat
            key={stage}
            label={
              <span aria-hidden={count === null ? undefined : true}>
                {stageLabel}
              </span>
            }
            value={
              count === null ? null : (
                <SpokenCount
                  count={count}
                  phrase={t("admin:leads.list.stageChipAria", {
                    stage: stageLabel,
                    count,
                  })}
                />
              )
            }
            isLoading={count === null}
            isPressed={filters.stage === stage}
            onClick={() =>
              controls.setStage(filters.stage === stage ? null : stage)
            }
          />
        );
      })}
      <AdminStat
        icon={FiClock}
        label={t("admin:leads.list.dueOnly")}
        value={
          dueCount === null ? null : (
            <span aria-hidden>{rollingCount(dueCount)}</span>
          )
        }
        delta={
          dueCount === null
            ? undefined
            : {
                text: t("admin:leads.pipeline.dueCount", { count: dueCount }),
                tone: dueCount > 0 ? "warn" : "flat",
              }
        }
        isLoading={dueCount === null}
        tone={(dueCount ?? 0) > 0 ? "warn" : "default"}
        isPressed={filters.isDueOnly}
        onClick={() => controls.setIsDueOnly(!filters.isDueOnly)}
      />
    </AdminStatTiles>
  );
}
