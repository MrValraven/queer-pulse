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
import { BulkAssignBar } from "./BulkAssignBar";
import { DeskSidebar } from "./DeskSidebar";
import { DeskSkeleton, DeskEmptyState, DeskErrorBand } from "./DeskStates";
import { EditorDecksSection } from "../EditorDecksSection";
import type { DeskSummaryView } from "../api/useDeskSummary";
import type {
  Editor,
  Issue,
  IssueSummary,
  Piece,
  Pitch,
  SavedViewId,
  Section,
  Stage,
} from "../data/desk.data";
import styles from "./DeskView.module.css";

export interface DeskViewProps {
  loading: boolean;
  showError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  issue: Issue;
  /** Every issue, newest number first — the header's issue switcher. */
  issues: IssueSummary[];
  onSelectIssue: (issueNumber: string) => void;
  onNewIssue: () => void;
  /** The active track — partitions the pipeline into Unassigned vs. Issue. */
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  /** Whether an issue is selected (drives the Issue tab number + assignment). */
  hasCurrentIssue: boolean;
  /** Piece counts per track, for the tab badges. */
  unassignedCount: number;
  issueCount: number;
  editors: Editor[];
  me: string;
  onMe: (editorId: string) => void;
  layout: DeskLayout;
  onLayout: (layout: DeskLayout) => void;
  onWrite: () => void;
  /** True while a new self-written draft is being created. */
  isWriting: boolean;
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
  /** Opens the issue picker for one piece. */
  onAssignPieceIssue: (piece: Piece) => void;
  /** Bulk selection over the pipeline rows, for assign-to-issue. */
  selectedPieceIds: string[];
  areAllPiecesSelected: boolean;
  onTogglePieceSelect: (piece: Piece) => void;
  onToggleAllPieceSelect: () => void;
  onBulkAssignIssue: () => void;
  onClearPieceSelection: () => void;
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
  summary: DeskSummaryView | undefined;
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
        unassignedCount={props.unassignedCount}
        issueCount={props.issueCount}
      />
      <DeskHeader
        issue={props.issue}
        issues={props.issues}
        onSelectIssue={props.onSelectIssue}
        onNewIssue={props.onNewIssue}
        track={props.track}
        editors={props.editors}
        me={props.me}
        onMe={props.onMe}
        layout={props.layout}
        onLayout={props.onLayout}
        onWrite={props.onWrite}
        isWriting={props.isWriting}
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
            <DeskEmptyState
              issueNumber={props.issue.number}
              onWrite={props.onWrite}
              onCommission={props.onCommission}
            />
          ) : (
            <>
              {props.layout === "list" && (
                <PiecesPipeline
                  pieces={props.visiblePieces}
                  focusId={props.focusId}
                  track={props.track}
                  hasAnyIssue={props.issues.length > 0}
                  selectedPieceIds={props.selectedPieceIds}
                  areAllSelected={props.areAllPiecesSelected}
                  onToggleSelect={props.onTogglePieceSelect}
                  onToggleSelectAll={props.onToggleAllPieceSelect}
                  onOpen={props.onOpenPiece}
                  onEdit={props.onEditPiece}
                  onChase={props.onChasePiece}
                  onHandoff={props.onHandoffPiece}
                  onAssignIssue={props.onAssignPieceIssue}
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
      {/* Only one bulk bar can be on screen at a time: both are fixed to the
          same bottom slot, and the pitch selection is cleared when a piece
          selection starts (and vice versa) in `EditorDashboardPage`. */}
      <BulkTriageBar
        count={props.selectedPitchIds.length}
        onMaybe={props.onBulkMaybe}
        onPass={props.onBulkPass}
        onClear={props.onClearBulkSelection}
      />
      <BulkAssignBar
        count={props.selectedPieceIds.length}
        onAssign={props.onBulkAssignIssue}
        onClear={props.onClearPieceSelection}
      />
    </div>
  );
}
