import { useMemo } from "react";
import { FiPlay } from "react-icons/fi";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { monthDate, type VouchEdge } from "./trustGraph/trustGraphModel";
import type { VouchMode } from "./vouchGraph.types";
import { VouchGraphLegend } from "./VouchGraphLegend";
import styles from "./vouchGraphFooter.module.css";

/** D4: replay controls need at least this many events to be worth showing. */
const MIN_REPLAY_EVENT_COUNT = 3;

interface VouchGraphFooterProps {
  mode: VouchMode;
  timeCut: number;
  eventCount: number;
  currentEvent: VouchEdge | null;
  isReplaying: boolean;
  onReplay: () => void;
  onSetTime: (step: number) => void;
  /** A7: every connection is revealed. */
  isFullyRevealed?: boolean;
  visIds?: string[];
  visEdges?: VouchEdge[];
  focusName?: string;
  /** Hides the replay and time controls (invites and list views). */
  isTimeControlsHidden?: boolean;
  /** Hides the legend (the list view draws none of its swatches). */
  isLegendHidden?: boolean;
}

export function VouchGraphFooter({
  mode,
  timeCut,
  eventCount,
  currentEvent,
  isReplaying,
  onReplay,
  onSetTime,
  isFullyRevealed = false,
  visIds,
  visEdges,
  focusName = "",
  isTimeControlsHidden = false,
  isLegendHidden = false,
}: VouchGraphFooterProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const graph = useTrustGraph();
  const allPersonIds = useMemo(
    () => graph.people.map((person) => person.id),
    [graph.people],
  );
  const legendIds = visIds ?? allPersonIds;
  const legendEdges = visEdges ?? graph.edges;
  const isPhone = useMediaQuery("(max-width: 920px)");
  /** Once every connection is revealed, the count is what the view shows. */
  const visibleEventCount = visEdges ? visEdges.length : eventCount;
  const hasNothingToReplay = isFullyRevealed && visibleEventCount === 0;
  const isTimeShown =
    !isTimeControlsHidden &&
    eventCount >= MIN_REPLAY_EVENT_COUNT &&
    !hasNothingToReplay;
  return (
    <footer className={styles.bottom}>
      {!isLegendHidden && (
        <VouchGraphLegend
          mode={mode}
          visIds={legendIds}
          visEdges={legendEdges}
          isFoldable={isPhone}
        />
      )}
      {graph.truncated && (
        <span className={`${styles.leg} ${styles.truncated}`}>
          {t("admin:vouchGraph.modal.truncatedNotice", { name: focusName })}
        </span>
      )}
      <Collapse isOpen={isTimeShown} className={styles.timeCollapse}>
        <div className={styles.timeWrap}>
          <button
            type="button"
            className={styles.replay}
            onClick={onReplay}
            disabled={isReplaying}
          >
            <FiPlay aria-hidden /> {t("admin:vouchGraph.modal.replayCta")}
          </button>
          <input
            type="range"
            min={0}
            max={eventCount}
            step={1}
            value={timeCut}
            onChange={(event) => onSetTime(Number(event.target.value))}
            aria-label={t("admin:vouchGraph.modal.timeCutAriaLabel")}
            disabled={eventCount === 0}
          />
          <span className={styles.timeLbl}>
            {isFullyRevealed ? (
              t("admin:vouchGraph.modal.replayFull", {
                count: visibleEventCount,
              })
            ) : currentEvent ? (
              <>
                <b>{graph.peopleById[currentEvent.to]?.name}</b> ·{" "}
                {t(`admin:vouchGraph.edgeKind.${currentEvent.kind ?? "vouch"}`)}{" "}
                ·{" "}
                {fmt.date(monthDate(currentEvent.date), {
                  month: "short",
                  year: "numeric",
                })}
              </>
            ) : (
              t("admin:vouchGraph.modal.replayStart")
            )}
          </span>
        </div>
      </Collapse>
    </footer>
  );
}
