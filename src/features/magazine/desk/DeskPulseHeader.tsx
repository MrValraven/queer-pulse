import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Issue, IssueSummary } from "../data/desk.data";
import { DeskNewMenu } from "./DeskNewMenu";
import { DeskPulseLine } from "./DeskPulseLine";
import { DeskScopeMenu } from "./DeskScopeMenu";
import type { DeskTrack } from "./deskTrack";
import type { IssueSlotTotals } from "./issueSlots";
import styles from "./DeskPulseHeader.module.css";

export interface DeskPulseHeaderProps {
  issue: Issue;
  /** Every issue, newest number first, for the scope menu. */
  issues: IssueSummary[];
  /** Selects the issue AND switches to the issue scope, in ONE URL write
   *  (`issue` and `track=issue` together). */
  onSelectIssueScope: (issueNumber: string) => void;
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  hasCurrentIssue: boolean;
  unassignedCount: number;
  everythingCount: number;
  /** How many distinct issues the in-flight pieces sit on, for the
   *  everything scope's pulse line. */
  everythingIssueCount: number;
  /** In-flight pieces per issue id, shown under each issue in the scope
   *  menu. Optional: issues without an entry show their title alone. */
  pieceCountByIssueId?: Readonly<Record<string, number>>;
  onNewIssue: () => void;
  onWrite: () => void;
  isWriting: boolean;
  onBuildDeck: () => void;
  isBuildingDeck?: boolean;
  onCommission: () => void;
  /** Opens the selected issue's production page, from the scope menu. */
  onProduce: () => void;
  /** The selected issue's slots counted from its pieces and the section
   *  targets (`issueSlotTotals`), so the pulse matches the plan and rail. */
  slotTotals?: IssueSlotTotals;
  /** Opens the issue plan layout; turns "9 of 15 slots filled" into a text
   *  button. Leave unset and the slot count stays plain text. */
  onOpenPlan?: () => void;
}

/**
 * How the in-flight pieces split between issues and no issue, from the scope
 * menu's per-issue counts: the unfiled remainder, and the issue's number when
 * one issue holds all the filed work. Without the counts the split is
 * unknown and both stay unset.
 */
function describeInFlightSpread(
  everythingCount: number,
  pieceCountByIssueId: Readonly<Record<string, number>> | undefined,
  issues: IssueSummary[],
): { everythingUnfiledCount?: number; everythingIssueNumber?: string } {
  if (!pieceCountByIssueId) return {};
  const issueIds = Object.keys(pieceCountByIssueId);
  const filedCount = issueIds.reduce(
    (sum, issueId) => sum + (pieceCountByIssueId[issueId] ?? 0),
    0,
  );
  const onlyIssue =
    issueIds.length === 1
      ? issues.find((summary) => summary.id === issueIds[0])
      : undefined;
  return {
    everythingUnfiledCount: Math.max(everythingCount - filedCount, 0),
    everythingIssueNumber: onlyIssue?.number,
  };
}

/**
 * The desk header, redesigned: what you are looking at (the scope menu), the
 * one line that says how it is going (the pulse), and every way to start work
 * (the New menu). The layout switch lives in the toolbar, and the page's one
 * filled action is the shell sidebar's Write, so every control here is ghost
 * or text. "Viewing as" has no place in this header, and Issue production
 * sits in the scope menu under the issues, which keeps this row to two
 * controls and fits it on one line on a phone.
 *
 * It stacks the scope, a large title and the pulse line. The `<h1>` comes
 * first in the DOM, so a screen reader meets the page's name before any
 * control; CSS places it visually.
 */
export function DeskPulseHeader({
  issue,
  issues,
  onSelectIssueScope,
  track,
  onTrack,
  hasCurrentIssue,
  unassignedCount,
  everythingCount,
  everythingIssueCount,
  pieceCountByIssueId,
  onNewIssue,
  onWrite,
  isWriting,
  onBuildDeck,
  isBuildingDeck,
  onCommission,
  onProduce,
  slotTotals,
  onOpenPlan,
}: DeskPulseHeaderProps) {
  const { t } = useTranslation();
  const hasIssue = hasCurrentIssue && issue.number !== "";
  const pulseProps = {
    issue,
    track,
    hasIssue,
    unassignedCount,
    everythingCount,
    everythingIssueCount,
    slotTotals,
    onOpenPlan,
    ...describeInFlightSpread(everythingCount, pieceCountByIssueId, issues),
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{t("magazine:desk.header.title")}</h1>
      <div className={styles.topRow}>
        <DeskScopeMenu
          issue={issue}
          issues={issues}
          onSelectIssueScope={onSelectIssueScope}
          track={track}
          onTrack={onTrack}
          hasCurrentIssue={hasCurrentIssue}
          unassignedCount={unassignedCount}
          everythingCount={everythingCount}
          pieceCountByIssueId={pieceCountByIssueId}
          onNewIssue={onNewIssue}
          onProduce={onProduce}
        />
        <div className={styles.actions}>
          <DeskNewMenu
            onWrite={onWrite}
            isWriting={isWriting}
            onBuildDeck={onBuildDeck}
            isBuildingDeck={isBuildingDeck}
            onCommission={onCommission}
            onNewIssue={onNewIssue}
          />
        </div>
      </div>
      <DeskPulseLine {...pulseProps} />
    </header>
  );
}
