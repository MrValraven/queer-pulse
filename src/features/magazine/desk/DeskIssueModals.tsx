import { AssignIssueModal } from "./AssignIssueModal";
import { NewIssueModal } from "./issue/NewIssueModal";
import { suggestNextIssueNumber } from "../api/useDeskIssues";
import type { CreateIssueDto, IssueSummaryDto } from "../api/issueProduction.api";
import type { IssueSummary, Piece } from "../data/desk.data";
import type { IssueAssignmentTarget } from "./useDeskAssignment";

export interface DeskIssueModalsProps {
  /** Pieces the issue picker is open for; `null` keeps it closed. */
  assignTargets: Piece[] | null;
  onCloseAssign: () => void;
  onAssign: (target: IssueAssignmentTarget | null) => void;
  isNewIssueOpen: boolean;
  onCloseNewIssue: () => void;
  onCreateIssue: (body: CreateIssueDto) => Promise<IssueSummaryDto>;
  isCreatingIssue: boolean;
  issues: IssueSummary[];
}

/**
 * The two issue-centric overlays the desk can raise: the assign-to-issue
 * picker and the new-issue form. Held apart from `DeskModals` (the
 * commission/pass/chase/handoff dispatcher) because both of these need the
 * issue list, which `DeskModals`' single-slot `DeskModal` union does not
 * carry — and because they can be open independently of it.
 */
export function DeskIssueModals({
  assignTargets,
  onCloseAssign,
  onAssign,
  isNewIssueOpen,
  onCloseNewIssue,
  onCreateIssue,
  isCreatingIssue,
  issues,
}: DeskIssueModalsProps) {
  return (
    <>
      {assignTargets && (
        <AssignIssueModal
          pieceCount={assignTargets.length}
          pieceTitle={assignTargets[0]?.title}
          issues={issues}
          // A mixed selection has no single "current" issue to pre-select, so
          // only a single-piece assignment claims one.
          currentIssueId={
            assignTargets.length === 1 ? (assignTargets[0]?.issueId ?? null) : null
          }
          onClose={onCloseAssign}
          onAssign={onAssign}
        />
      )}

      {isNewIssueOpen && (
        <NewIssueModal
          suggestedNumber={suggestNextIssueNumber(issues)}
          isSaving={isCreatingIssue}
          onClose={onCloseNewIssue}
          onCreate={onCreateIssue}
        />
      )}
    </>
  );
}
