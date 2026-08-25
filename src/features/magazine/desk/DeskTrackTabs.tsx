import { Tabs, type Tab } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskTrackTabs.module.css";

/** The two tracks the desk groups pieces into: unfiled work
 *  (`issueId === null`) vs. work bound to the SELECTED issue. Pieces on any
 *  other issue belong to neither and are reached by switching issue. */
export type DeskTrack = "unassigned" | "issue";

export interface DeskTrackTabsProps {
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  /** The selected issue's display number, for the "Issue N" tab label. */
  issueNumber: string;
  /** Whether an issue is selected at all — the tab loses its number when not. */
  hasCurrentIssue: boolean;
  unassignedCount: number;
  issueCount: number;
}

/**
 * Top-level track switch above the desk pipeline: Unassigned ⇄ Issue N.
 * Switching swaps the whole pipeline/list to that track. Reuses the shared
 * `Tabs` primitive (pill variant, count badges, APG tablist keyboard nav).
 */
export function DeskTrackTabs({
  track,
  onTrack,
  issueNumber,
  hasCurrentIssue,
  unassignedCount,
  issueCount,
}: DeskTrackTabsProps) {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    {
      id: "unassigned",
      label: t("magazine:desk.trackTabs.unassigned"),
      count: unassignedCount || undefined,
    },
    {
      id: "issue",
      label: hasCurrentIssue
        ? t("magazine:desk.trackTabs.issue", { number: issueNumber })
        : t("magazine:desk.trackTabs.issueNoNumber"),
      count: issueCount || undefined,
    },
  ];

  return (
    <div className={styles.wrap}>
      <Tabs tabs={tabs} active={track} onChange={(id) => onTrack(id as DeskTrack)} />
    </div>
  );
}
