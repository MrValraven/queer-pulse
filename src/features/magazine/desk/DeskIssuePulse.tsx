import {
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Issue } from "../data/desk.data";
import { issueCloseState } from "./deskHeaderCopy";
import { IssueCloseDatePopover } from "./IssueCloseDatePopover";
import type { IssueSlotTotals } from "./issueSlots";
import styles from "./DeskPulseHeader.module.css";

export interface DeskIssuePulseProps {
  issue: Issue;
  /** The issue's slots counted from its pieces and the section targets
   *  (`issueSlotTotals`), the same count the Issue plan and the rail show.
   *  Leave unset only where no section list exists; the issue's stored
   *  `filled` / `slots` then stand in. */
  slotTotals?: IssueSlotTotals;
  /** Turns the slot count into a text button that opens the issue plan. */
  onOpenPlan?: () => void;
  /** Whether the viewer may set the close date. The desk route and the
   *  close-date endpoint share one gate (the `magazine_editor` grant), so
   *  on the desk this is always true; a read-only reuse passes false and
   *  the countdown stays plain text. */
  canEditCloseDate?: boolean;
}

/** "Days left" turns the late tone at this many days or fewer, while the
 *  issue still has empty slots. */
const CLOSING_SOON_DAYS = 2;

/**
 * The issue scope's facts, gated on what exists. A live issue may have no
 * close date: then "Publishes" stands in, and the slot count shows alone when
 * neither date is set. `daysLeft` is clamped at 0, so the ISO close day
 * decides between "Closes today" and "Closed" (see `issueCloseState`).
 *
 * An issue with no close date at all also gets a quiet "Set close date"
 * button at the end of the line (`IssueCloseDatePopover`), so the pulse line
 * is never the reason a close date stays unset. Once it has one, the
 * countdown ("9 days left", "Closes today") is that same popover's trigger,
 * so the number that says how long is left is also where the date moves.
 */
export function DeskIssuePulse({
  issue,
  slotTotals,
  onOpenPlan,
  canEditCloseDate = true,
}: DeskIssuePulseProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const closeState = issueCloseState(issue, new Date());
  const filledSlots = slotTotals?.filled ?? issue.filled;
  const totalSlots = slotTotals?.slots ?? issue.slots;
  const hasSlots = totalSlots > 0;
  const hasOpenSlots = filledSlots < totalSlots;
  const hasPublishDate = Boolean(issue.publishes);
  const isClosingSoon =
    hasOpenSlots &&
    (closeState === "today" ||
      (closeState === "open" && issue.daysLeft <= CLOSING_SOON_DAYS));
  const closingPartClass = isClosingSoon
    ? `${styles.part} ${styles.late}`
    : styles.part;

  const slotsText = t("magazine:desk.header.slotsFilled", {
    filled: format.number(filledSlots),
    slots: format.number(totalSlots),
  });
  const filledShare = hasSlots ? Math.min(filledSlots / totalSlots, 1) : 0;
  // "Set close date" unmounts once its save lands and the countdown takes
  // its place, so the countdown takes the focus the button had.
  const [shouldCountdownTakeFocus, setShouldCountdownTakeFocus] =
    useState(false);
  const handleCountdownFocused = useCallback(
    () => setShouldCountdownTakeFocus(false),
    [],
  );

  // The slot meter, a full-width hairline under the pulse line.
  const meter = hasSlots && (
    <span
      className={styles.meter}
      role="progressbar"
      aria-valuenow={filledSlots}
      aria-valuemin={0}
      aria-valuemax={totalSlots}
      aria-label={t("magazine:desk.header.slotsFilledAria")}
    >
      <span
        className={styles.meterFill}
        style={{ "--slot-share": filledShare } as CSSProperties}
      />
    </span>
  );

  /** The countdown, as a door to the close-date popover when editable. */
  function countdown(text: ReactNode) {
    if (!canEditCloseDate) return text;
    return (
      <IssueCloseDatePopover
        issueNumber={issue.number}
        publishedOn={issue.publishedOn}
        closesOn={issue.closesOn}
        shouldTakeFocus={shouldCountdownTakeFocus}
        onFocusTaken={handleCountdownFocused}
      >
        {text}
        <span className="visuallyHidden">
          {` ${t("magazine:desk.pulse.changeCloseDateAria")}`}
        </span>
      </IssueCloseDatePopover>
    );
  }

  return (
    <div className={styles.pulseBlock}>
      <p className={styles.pulse}>
        {closeState === "none" && hasPublishDate && (
          <span className={styles.part}>
            {t("magazine:desk.header.metaPublishesOnly", {
              publishes: issue.publishes,
            })}
          </span>
        )}
        {closeState === "open" && (
          <span className={`${styles.part} ${styles.closesPart}`}>
            {t("magazine:desk.pulse.closes", { closes: issue.closes })}
          </span>
        )}
        {/* One slot for both countdowns, so a save that moves the issue
            between "9 days left" and "Closes today" keeps the same trigger
            (and its focus). */}
        {(closeState === "open" || closeState === "today") && (
          <span
            className={closingPartClass}
            data-closing-soon={isClosingSoon || undefined}
          >
            {countdown(
              closeState === "today" ? (
                t("magazine:desk.pulse.closesToday")
              ) : (
                <Translation
                  i18nKey="magazine:desk.pulse.daysLeft"
                  values={{ count: issue.daysLeft }}
                  slots={{ count: format.number(issue.daysLeft) }}
                />
              ),
            )}
          </span>
        )}
        {closeState === "closed" && (
          <span className={styles.part}>
            {t("magazine:desk.pulse.closed", { closes: issue.closes })}
          </span>
        )}
        {hasSlots && (
          <span className={styles.part}>
            {onOpenPlan ? (
              <button
                type="button"
                className={styles.planLink}
                onClick={onOpenPlan}
                data-tap-target
              >
                {slotsText}
                <span className="visuallyHidden">
                  {` ${t("magazine:desk.pulse.openPlanAria")}`}
                </span>
              </button>
            ) : (
              slotsText
            )}
          </span>
        )}
        {closeState === "none" && canEditCloseDate && (
          <span className={styles.part}>
            <IssueCloseDatePopover
              issueNumber={issue.number}
              publishedOn={issue.publishedOn}
              onSaved={() => setShouldCountdownTakeFocus(true)}
            />
          </span>
        )}
      </p>
      {meter}
    </div>
  );
}
