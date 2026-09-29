import { useRef } from "react";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { DeskSummaryView } from "../../api/useDeskSummary";
import type {
  Editor,
  Piece,
  Pitch,
  Section,
  Stage,
} from "../../data/desk.data";
import type { DeskTrack } from "../deskTrack";
import { ActivityCard } from "./ActivityCard";
import { DESK_SPLIT_QUERY } from "./deskSplit";
import { IssueHealthCard } from "./IssueHealthCard";
import { PitchesCard } from "./PitchesCard";
import { TeamCard } from "./TeamCard";
import { useKeepFocusAcrossReorder } from "./useKeepFocusAcrossReorder";
import { useRailFitsViewport } from "./useRailFitsViewport";
import styles from "./DeskRail.module.css";

export interface DeskRailProps {
  track: DeskTrack;
  hasCurrentIssue: boolean;
  /** The active scope's pieces (the issue's pieces on the issue track). */
  pieces: Piece[];
  sections: Section[];
  /** `undefined` while the desk summary loads. */
  summary: DeskSummaryView | undefined;
  editors: Editor[];
  /** The signed-in editor's id. */
  me: string;
  /** Pitches awaiting a verdict, newest first. */
  pitches: Pitch[];
  onOpenTriage: () => void;
  /** Opens triage focused on that pitch. */
  onOpenPitch: (pitch: Pitch) => void;
  editorFilter: string | null;
  onEditorFilter: (editorId: string | null) => void;
  /** The table's stage filter, so Issue health can mark its pressed stages. */
  stageFilter?: Stage[];
  /** Called with the stage an editor pressed in the Issue health legend; the
   *  parent adds it to `stageFilter` or removes it. */
  onStageFilter?: (stage: Stage) => void;
  /** The table's section filter, so Issue health can mark its pressed slots. */
  sectionFilter?: string[];
  /** Called with the section an editor pressed in the Issue health slots; the
   *  parent adds it to `sectionFilter` or removes it. */
  onSectionFilter?: (sectionName: string) => void;
  /** The issue's close day, so Issue health can forecast which pieces may
   *  miss it. `null`/unset while none has been picked; nothing forecasts. */
  closesOn?: string | null;
  /** Defaults to now. A parameter so a caller can pin the clock. */
  today?: Date;
  /** Opens an at-risk piece from the forecast. */
  onOpenPiece?: (piece: Piece) => void;
  /** Shows every at-risk piece in the table (the `at-risk` focus chip).
   *  When given, the forecast's "N pieces may miss close" is its button. */
  onShowAtRisk?: () => void;
  /** True while the `new-voices` focus chip is on, so Issue health can
   *  mark its new-voices line as pressed. */
  isNewVoicesFiltered?: boolean;
  /** Toggles the `new-voices` focus chip from Issue health's new-voices
   *  line. Without it the line stays plain text. */
  onNewVoicesFilter?: () => void;
  /** Forces the stacked layout (a grid of cards, Pitches first) when the
   *  rail's container is narrow at a wide viewport. At or below
   *  `--desk-split` it stacks anyway. */
  isStacked?: boolean;
}

/**
 * The desk's right rail: the context an editor glances at while working the
 * table. Issue health (issue scope only), the newest pitches, the team's load
 * with a way into anyone's queue, and recent activity, read as one surface
 * separated by hairlines. Beside the table it stays pinned: by its top while
 * it fits the viewport, by its bottom when taller, so it never grows a
 * scroller of its own. Stacked under the table it becomes a grid of cards
 * and puts Pitches first, the card most likely to need a decision, in the
 * DOM, so Tab walks the cards in the order the eye reads them.
 */
export function DeskRail({
  track,
  hasCurrentIssue,
  pieces,
  sections,
  summary,
  editors,
  me,
  pitches,
  onOpenTriage,
  onOpenPitch,
  editorFilter,
  onEditorFilter,
  stageFilter,
  onStageFilter,
  sectionFilter,
  onSectionFilter,
  closesOn,
  today = new Date(),
  onOpenPiece,
  onShowAtRisk,
  isNewVoicesFiltered,
  onNewVoicesFilter,
  isStacked = false,
}: DeskRailProps) {
  const { t } = useTranslation();
  const isBelowSplit = useMediaQuery(DESK_SPLIT_QUERY);
  const isStackedLayout = isStacked || isBelowSplit;
  const isIssueHealthShown = track === "issue" && hasCurrentIssue;
  const railRef = useRef<HTMLElement>(null);
  useKeepFocusAcrossReorder(railRef, isStackedLayout);
  useRailFitsViewport(railRef, !isStackedLayout);

  // The two cards trade places when the layout stacks. Their keys let React
  // move each instance across the swap instead of remounting it, and the
  // focus hook returns focus to a control inside the card that moved.
  const issueHealthCard = isIssueHealthShown ? (
    <IssueHealthCard
      key="issue-health"
      pieces={pieces}
      me={me}
      sections={sections}
      closesOn={closesOn}
      today={today}
      stageFilter={stageFilter}
      onStageFilter={onStageFilter}
      sectionFilter={sectionFilter}
      onSectionFilter={onSectionFilter}
      onOpenPiece={onOpenPiece}
      onShowAtRisk={onShowAtRisk}
      isNewVoicesFiltered={isNewVoicesFiltered}
      onNewVoicesFilter={onNewVoicesFilter}
    />
  ) : null;
  const pitchesCard = (
    <PitchesCard
      key="pitches"
      pitches={pitches}
      onOpenPitch={onOpenPitch}
      onOpenTriage={onOpenTriage}
    />
  );

  return (
    <aside
      ref={railRef}
      className={styles.rail}
      aria-label={t("magazine:desk.rail.label")}
      data-stacked={isStackedLayout ? "true" : undefined}
    >
      {isStackedLayout ? pitchesCard : issueHealthCard}
      {isStackedLayout ? issueHealthCard : pitchesCard}
      <TeamCard
        editorLoad={summary?.editorLoad ?? []}
        editors={editors}
        me={me}
        editorFilter={editorFilter}
        onEditorFilter={onEditorFilter}
        pieces={pieces}
      />
      <ActivityCard activity={summary?.activity} editors={editors} />
    </aside>
  );
}
