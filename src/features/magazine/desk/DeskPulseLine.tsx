import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Issue } from "../data/desk.data";
import { DeskIssuePulse } from "./DeskIssuePulse";
import type { IssueSlotTotals } from "./issueSlots";
import type { DeskTrack } from "./deskTrack";
import styles from "./DeskPulseHeader.module.css";

export interface DeskPulseLineProps {
  issue: Issue;
  track: DeskTrack;
  /** A real issue is selected (the magazine may have none yet). */
  hasIssue: boolean;
  unassignedCount: number;
  everythingCount: number;
  /** How many distinct issues the in-flight pieces sit on. */
  everythingIssueCount: number;
  /** How many in-flight pieces sit on no issue. Unset, the everything line
   *  cannot split filed from unfiled work and names only the issues. */
  everythingUnfiledCount?: number;
  /** The issue's number when every filed in-flight piece sits on one issue,
   *  so the line can name it ("9 in Issue 14"). */
  everythingIssueNumber?: string;
  /** The issue's slots counted from its pieces (`issueSlotTotals`). */
  slotTotals?: IssueSlotTotals;
  /** Opens the issue plan. When given (and the issue has slots), the slot
   *  count becomes a text button, since the plan is where those slots live. */
  onOpenPlan?: () => void;
}

/**
 * The header's one line of state for the current scope: the issue's calendar
 * and slot count, or how much unfiled or in-flight work there is. Calm by
 * default; only a close date two days out (or today) with slots still open
 * turns loud. Every figure prints through `useFormat().number`, with plural
 * selection kept on the raw count by `<Translation slots>`.
 *
 * Everything in flight counts filed and unfiled work apart once some of it
 * is unfiled ("12 pieces in flight · 9 in Issue 14 · 3 unfiled"), so the
 * line never files the unfiled pieces into an issue.
 */
export function DeskPulseLine({
  issue,
  track,
  hasIssue,
  unassignedCount,
  everythingCount,
  everythingIssueCount,
  everythingUnfiledCount,
  everythingIssueNumber,
  slotTotals,
  onOpenPlan,
}: DeskPulseLineProps) {
  const { t } = useTranslation();
  const format = useFormat();

  function countCopy(i18nKey: string, count: number) {
    return (
      <Translation
        i18nKey={i18nKey}
        values={{ count }}
        slots={{ count: format.number(count) }}
      />
    );
  }

  /** The filed share of the in-flight work: one named issue, or several. */
  function filedPart(filedCount: number) {
    if (everythingIssueCount > 1) {
      return (
        <Translation
          i18nKey="magazine:desk.pulse.filedAcrossIssues"
          values={{
            count: filedCount,
            issues: format.number(everythingIssueCount),
          }}
          slots={{ count: format.number(filedCount) }}
        />
      );
    }
    if (everythingIssueNumber) {
      return (
        <Translation
          i18nKey="magazine:desk.pulse.filedInIssue"
          values={{ count: filedCount, number: everythingIssueNumber }}
          slots={{ count: format.number(filedCount) }}
        />
      );
    }
    return countCopy("magazine:desk.pulse.filedInOneIssue", filedCount);
  }

  function describeEverything() {
    if (everythingCount === 0) return t("magazine:desk.pulse.everythingEmpty");
    const unfiledCount = everythingUnfiledCount ?? 0;
    if (everythingIssueCount > 0 && unfiledCount > 0) {
      return (
        <>
          <span className={styles.part}>
            {countCopy("magazine:desk.pulse.inFlight", everythingCount)}
          </span>
          <span className={styles.part}>
            {filedPart(everythingCount - unfiledCount)}
          </span>
          <span className={styles.part}>
            {countCopy("magazine:desk.pulse.unfiledPart", unfiledCount)}
          </span>
        </>
      );
    }
    // With every in-flight piece unfiled, "across 0 issues" says less than
    // the unfiled line does.
    if (everythingIssueCount === 0) {
      return countCopy(
        "magazine:desk.scope.unfiledDescription",
        everythingCount,
      );
    }
    if (everythingIssueCount === 1) {
      return countCopy(
        "magazine:desk.pulse.everythingOneIssue",
        everythingCount,
      );
    }
    return (
      <Translation
        i18nKey="magazine:desk.pulse.everything"
        values={{
          count: everythingCount,
          issues: format.number(everythingIssueCount),
        }}
        slots={{ count: format.number(everythingCount) }}
      />
    );
  }

  if (track === "unassigned") {
    return (
      <p className={styles.pulse}>
        {unassignedCount > 0
          ? countCopy("magazine:desk.scope.unfiledDescription", unassignedCount)
          : t("magazine:desk.pulse.unfiledEmpty")}
      </p>
    );
  }

  if (track === "everything") {
    return <p className={styles.pulse}>{describeEverything()}</p>;
  }

  if (!hasIssue) return null;

  return (
    <DeskIssuePulse
      issue={issue}
      slotTotals={slotTotals}
      onOpenPlan={onOpenPlan}
    />
  );
}
