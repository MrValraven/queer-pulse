import type { CSSProperties } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Piece, Section, Stage } from "../../data/desk.data";
import { countForFocus } from "../deskFocus";
import { viewStageLabelKey } from "../stageLabels";
import { sectionSlots, stageShares } from "./issueHealth";
import { IssueForecast } from "./IssueForecast";
import { IssueSlots } from "./IssueSlots";
import { RailCard } from "./RailCard";
import { RailToggle } from "./RailToggle";
import styles from "./rail.module.css";

export interface IssueHealthCardProps {
  /** The current issue's pieces (the issue scope's list). */
  pieces: Piece[];
  /** The signed-in editor's id, read by `countForFocus` for the new-voices
   *  line. The `new-voices` focus definition does not use it today, so
   *  omitting it is harmless; pass it through for any focus id that does. */
  me?: string;
  sections: Section[];
  /** The issue's close day, or `null`/unset while none has been picked; the
   *  forecast block renders only once one is known. */
  closesOn?: string | null;
  today: Date;
  /** The table's stage filter; its stages show as pressed in the legend. */
  stageFilter?: Stage[];
  /** When given, each legend stage is a toggle that filters the table. */
  onStageFilter?: (stage: Stage) => void;
  /** The table's section filter; its sections show as pressed in the slots. */
  sectionFilter?: string[];
  /** When given, each slot row is a toggle that filters the table. */
  onSectionFilter?: (sectionName: string) => void;
  /** Opens an at-risk piece from the forecast. */
  onOpenPiece?: (piece: Piece) => void;
  /** Shows every at-risk piece in the table; the forecast's headline is
   *  the button for it. */
  onShowAtRisk?: () => void;
  /** True while the table shows only new voices (the `new-voices` chip). */
  isNewVoicesFiltered?: boolean;
  /** When given, the new-voices line is a toggle for that chip. */
  onNewVoicesFilter?: () => void;
}

/** Inline custom property carrying a stage's colour token to a segment or dot. */
function stageToneStyle(step: number): CSSProperties {
  return { "--rail-stage-tone": `var(--desk-stage-${step})` } as CSSProperties;
}

/**
 * Where the current issue stands: a forecast at the top (on track, or which
 * pieces may miss the close and why), then one stacked bar of its pieces by
 * stage, the sections with open slots (IssueSlots), and how many pieces come
 * from first-time writers. Each part stays a line or two per item, so the
 * whole card fits above Pitches on the first screen. Every count filters the
 * table to what it counted once the desk passes the filter callbacks (the
 * new-voices line toggles the `new-voices` focus chip). The
 * number of days to close stays in the desk header, which already shows it.
 * Derived from the pieces the desk already holds, so demo and live render
 * the same way.
 */
export function IssueHealthCard({
  pieces,
  me = "",
  sections,
  closesOn,
  today,
  stageFilter,
  onStageFilter,
  sectionFilter,
  onSectionFilter,
  onOpenPiece,
  onShowAtRisk,
  isNewVoicesFiltered = false,
  onNewVoicesFilter,
}: IssueHealthCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const shares = stageShares(pieces);
  const slots = sectionSlots(pieces, sections);
  // The same predicate the `new-voices` focus chip and the table filter use,
  // so this line and the chip it toggles always count the same pieces.
  const freshCount = countForFocus(pieces, me, "new-voices");
  // A zero line stays text, like the legend's absent stages, unless it is
  // the pressed filter and has to stay reachable to turn it off.
  const isNewVoicesToggle = freshCount > 0 || isNewVoicesFiltered;

  return (
    <RailCard kind="health" title={t("magazine:desk.rail.health.title")}>
      <IssueForecast
        pieces={pieces}
        closesOn={closesOn}
        today={today}
        onOpenPiece={onOpenPiece}
        onShowAtRisk={onShowAtRisk}
      />

      {pieces.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("magazine:desk.sidebar.noPiecesYet")}
        </p>
      ) : (
        <div className={styles.stageBlock}>
          {/* The legend below carries the same numbers as text, so the bar
              itself is decoration for screen readers. */}
          <div className={styles.stackBar} aria-hidden="true">
            {shares.map((share) => (
              <span
                key={share.stage}
                className={styles.stackSegment}
                style={{ ...stageToneStyle(share.step), flexGrow: share.count }}
              />
            ))}
          </div>
          <ul
            className={styles.legend}
            aria-label={t("magazine:desk.rail.health.byStage")}
          >
            {shares.map((share) => (
              <li key={share.stage} style={stageToneStyle(share.step)}>
                <RailToggle
                  className={styles.legendItem}
                  isPressed={stageFilter?.includes(share.stage) ?? false}
                  onToggle={
                    onStageFilter ? () => onStageFilter(share.stage) : undefined
                  }
                >
                  <span className={styles.legendDot} aria-hidden="true" />
                  <span className={styles.legendLabel}>
                    {t(viewStageLabelKey(share.stage))}
                  </span>
                  <span className={styles.number}>
                    {format.number(share.count)}
                  </span>
                </RailToggle>
              </li>
            ))}
          </ul>
        </div>
      )}

      <IssueSlots
        slots={slots}
        sectionFilter={sectionFilter}
        onSectionFilter={onSectionFilter}
      />

      {pieces.length > 0 ? (
        <p className={styles.newVoices} data-zero={freshCount === 0}>
          <RailToggle
            className={styles.newVoices}
            isPressed={isNewVoicesFiltered}
            onToggle={isNewVoicesToggle ? onNewVoicesFilter : undefined}
          >
            {t("magazine:desk.rail.health.newVoices", {
              count: pieces.length,
              total: format.number(pieces.length),
              fresh: format.number(freshCount),
            })}
          </RailToggle>
        </p>
      ) : null}
    </RailCard>
  );
}
