import { DeskHeader, type DeskLayout } from "./DeskHeader";
import { DeskTrackTabs, type DeskTrack } from "./DeskTrackTabs";
import { NeedsStrip } from "./NeedsStrip";
import { DeskStats } from "./DeskStats";
import { DeskToolbar, type DeskFormatFilter, type DeskSortKey } from "./DeskToolbar";
import { SavedViews } from "./SavedViews";
import { PiecesPipeline } from "./PiecesPipeline";
import { PiecesBoard } from "./PiecesBoard";
import { IssuePlan } from "./IssuePlan";
import { PitchInbox } from "./PitchInbox";
import { BulkTriageBar } from "./BulkTriageBar";
import { DeskSidebar } from "./DeskSidebar";
import { DeskSkeleton, DeskEmptyState, DeskErrorBand } from "./DeskStates";
import { EditorDecksSection } from "../EditorDecksSection";
import type { DeskSummaryDto } from "../api/pieces.api";
import type { Editor, Issue, Piece, Pitch, SavedViewId, Section, Stage } from "../data/desk.data";
import styles from "./DeskView.module.css";

export interface DeskViewProps {
  loading: boolean;
  showError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  issue: Issue;
  /** The active editorial track — partitions the pipeline into Highlights vs. Issue. */
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  /** Whether a current issue exists (drives the Issue tab number + reassignment). */
  hasCurrentIssue: boolean;
  /** Piece counts per track, for the tab badges. */
  highlightsCount: number;
  issueCount: number;
  editors: Editor[];
  me: string;
  onMe: (editorId: string) => void;
  layout: DeskLayout;
  onLayout: (layout: DeskLayout) => void;
  onCommission: () => void;
  onProduce: () => void;
  pieces: Piece[];
  visiblePieces: Piece[];
  focusId: string | null;
  pitches: Pitch[];
  pitchCount: number;
  stages: Stage[];
  sections: Section[];
  q: string;
  onQ: (value: string) => void;
  fmt: DeskFormatFilter;
  onFmt: (value: DeskFormatFilter) => void;
  mine: boolean;
  onMine: (value: boolean) => void;
  sort: DeskSortKey;
  onSort: (value: DeskSortKey) => void;
  onShortcuts: () => void;
  activeView: SavedViewId | null;
  onToggleView: (id: SavedViewId) => void;
  onSaveView: () => void;
  onOpenPiece: (piece: Piece) => void;
  onEditPiece: (piece: Piece) => void;
  onChasePiece: (piece: Piece) => void;
  onHandoffPiece: (piece: Piece) => void;
  onReassignPiece: (piece: Piece) => void;
  onMovePiece: (piece: Piece, stage: Stage) => void;
  onCommissionSection: (sectionName: string) => void;
  selectedPitchIds: string[];
  onTogglePitchSelect: (id: string) => void;
  onCommissionPitch: (pitch: Pitch) => void;
  onMaybePitch: (id: string) => void;
  onPassPitch: (pitch: Pitch) => void;
  leavingPitchIds: string[];
  onBulkMaybe: () => void;
  onBulkPass: () => void;
  onClearBulkSelection: () => void;
  summary: DeskSummaryDto | undefined;
}

/**
 * The magazine desk's visible composition: header, needs strip, stats,
 * toolbar, saved views, the active layout (pipeline/board/issue plan), the
 * decks section, the pitch inbox, and the right-rail sidebar. All data
 * fetching, mutations and overlay state live in `EditorDashboardPage`; this
 * component only renders what it is given.
 */
export function DeskView(props: DeskViewProps) {
  if (props.loading) {
    return (
      <div className={styles.page}>
        <DeskSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {props.showError && <DeskErrorBand onRetry={props.onRetry} />}
      <DeskTrackTabs
        track={props.track}
        onTrack={props.onTrack}
        issueNumber={props.issue.number}
        hasCurrentIssue={props.hasCurrentIssue}
        highlightsCount={props.highlightsCount}
        issueCount={props.issueCount}
      />
      <DeskHeader
        issue={props.issue}
        track={props.track}
        editors={props.editors}
        me={props.me}
        onMe={props.onMe}
        layout={props.layout}
        onLayout={props.onLayout}
        onCommission={props.onCommission}
        onProduce={props.onProduce}
      />
      <NeedsStrip
        pieces={props.pieces}
        me={props.me}
        onOpen={props.onOpenPiece}
        onEdit={props.onEditPiece}
        onChase={props.onChasePiece}
      />
      <DeskStats pieces={props.pieces} pitchCount={props.pitchCount} />
      <DeskToolbar
        q={props.q}
        onQ={props.onQ}
        fmt={props.fmt}
        onFmt={props.onFmt}
        mine={props.mine}
        onMine={props.onMine}
        sort={props.sort}
        onSort={props.onSort}
        onShortcuts={props.onShortcuts}
      />
      <SavedViews
        pieces={props.pieces}
        active={props.activeView}
        onToggle={props.onToggleView}
        onSave={props.onSaveView}
      />
      <EditorDecksSection />
      <div className={styles.grid}>
        <div>
          {props.isEmpty ? (
            <DeskEmptyState issueNumber={props.issue.number} onCommission={props.onCommission} />
          ) : (
            <>
              {props.layout === "list" && (
                <PiecesPipeline
                  pieces={props.visiblePieces}
                  focusId={props.focusId}
                  track={props.track}
                  hasCurrentIssue={props.hasCurrentIssue}
                  issueNumber={props.issue.number}
                  onOpen={props.onOpenPiece}
                  onEdit={props.onEditPiece}
                  onChase={props.onChasePiece}
                  onHandoff={props.onHandoffPiece}
                  onReassign={props.onReassignPiece}
                />
              )}
              {props.layout === "board" && (
                <PiecesBoard
                  pieces={props.visiblePieces}
                  stages={props.stages}
                  onOpen={props.onOpenPiece}
                  onMove={props.onMovePiece}
                />
              )}
              {props.layout === "plan" && (
                <IssuePlan
                  pieces={props.visiblePieces}
                  sections={props.sections}
                  stages={props.stages}
                  onOpen={props.onOpenPiece}
                  onCommission={props.onCommissionSection}
                />
              )}
              <PitchInbox
                pitches={props.pitches}
                selected={props.selectedPitchIds}
                onToggleSelect={props.onTogglePitchSelect}
                onCommission={props.onCommissionPitch}
                onMaybe={props.onMaybePitch}
                onPass={props.onPassPitch}
                leaving={props.leavingPitchIds}
              />
            </>
          )}
        </div>
        <DeskSidebar summary={props.summary} editors={props.editors} />
      </div>
      <BulkTriageBar
        count={props.selectedPitchIds.length}
        onMaybe={props.onBulkMaybe}
        onPass={props.onBulkPass}
        onClear={props.onClearBulkSelection}
      />
    </div>
  );
}
