import { Tabs, type Tab } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskTrackTabs.module.css";

/** The two editorial tracks the desk groups pieces into: standalone platform
 *  highlights (`issueId === null`) vs. work bound to the current full issue. */
export type DeskTrack = "highlights" | "issue";

export interface DeskTrackTabsProps {
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  /** The current issue's display number, for the "Issue N" tab label. */
  issueNumber: string;
  /** Whether a current issue exists at all — the tab loses its number when not. */
  hasCurrentIssue: boolean;
  highlightsCount: number;
  issueCount: number;
}

/**
 * Top-level track switch above the desk pipeline: Highlights ⇄ Issue N.
 * Switching swaps the whole pipeline/list to that track. Reuses the shared
 * `Tabs` primitive (pill variant, count badges, APG tablist keyboard nav).
 */
export function DeskTrackTabs({
  track,
  onTrack,
  issueNumber,
  hasCurrentIssue,
  highlightsCount,
  issueCount,
}: DeskTrackTabsProps) {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    {
      id: "highlights",
      label: t("magazine:desk.trackTabs.highlights"),
      count: highlightsCount || undefined,
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
