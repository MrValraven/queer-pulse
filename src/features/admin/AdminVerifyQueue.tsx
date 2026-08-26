import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests } from "./api/useJoinRequests";
import { useJoinRequestAssignment } from "./useJoinRequestAssignment";
import { useJoinRequestQueueDecisions } from "./useJoinRequestQueueDecisions";
import { QueueAssignmentFilter } from "./QueueAssignmentFilter";
import {
  assignedToParam,
  type QueueAssignmentScope,
} from "./queueAssignmentScope";
import { AdminVerifyDecided } from "./AdminVerifyDecided";
import { AdminVerifyQueueWaiting } from "./AdminVerifyQueueWaiting";
import { JoinRequestDeclineModal } from "./JoinRequestDeclineModal";
import { AdminTabs } from "./ui";

/**
 * Moderator review of incoming platform join requests, in two halves.
 *
 * WAITING reads `GET /join-requests?status=pending` and `…=waitlisted`, with
 * approve/decline wired to `useReviewJoinRequest` (PATCH /join-requests/:id).
 * DECIDED reads `…=approved` and `…=declined`, so a decision survives a
 * refresh: the invite link an approval mints used to live only in a card held
 * in local React state, and QueerPulse sends no email, so closing the tab
 * stranded everyone whose link had not been copied and sent yet.
 *
 * Approving does NOT put anything in the applicant's inbox. The reviewer copies
 * the link and sends it themselves; the approved card keeps its place in the
 * waiting half so it can be copied straight away, and the same row is in
 * Decided (once, see `displayedDecided`) for every time after that.
 *
 * Every decision, its toast and its local bookkeeping live in
 * `useJoinRequestQueueDecisions` — held HERE rather than inside either half, so
 * switching tabs cannot throw away a decision this session took.
 */
export function AdminVerifyQueue() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"waiting" | "decided">("waiting");
  // OPS-04. Held here, beside the queries it narrows, and applied to BOTH the
  // pending and waitlisted reads so one control governs everything the waiting
  // tab shows. The Decided tab is deliberately unfiltered: a settled request
  // has no holder and no clock left to run.
  const [assignmentFilter, setAssignmentFilter] =
    useState<QueueAssignmentScope>("all");
  const assignedTo = assignedToParam(assignmentFilter);
  const { data, isLoading } = useJoinRequests("pending", { assignedTo });
  const { data: waitlisted } = useJoinRequests("waitlisted", { assignedTo });
  const assignment = useJoinRequestAssignment();
  // A claim taken this session is overlaid before the rows reach any decision
  // bookkeeping, so the card, the filter and the queue all read one row.
  const pendingRows = (data ?? []).map(assignment.withAssignment);
  const waitlistedRows = (waitlisted ?? []).map(assignment.withAssignment);
  const decisions = useJoinRequestQueueDecisions(pendingRows);

  const waitingCount =
    decisions.queue.length +
    decisions.displayedWaitlisted(waitlistedRows).length;

  return (
    <div>
      <AdminTabs
        tabs={[
          {
            id: "waiting",
            label: t("admin:members.verify.tabs.waiting"),
            count: waitingCount,
          },
          { id: "decided", label: t("admin:members.verify.tabs.decided") },
        ]}
        active={activeTab}
        onChange={(id) =>
          setActiveTab(id === "decided" ? "decided" : "waiting")
        }
      />

      {activeTab === "waiting" ? (
        <>
          {/* Above the queue rather than inside it: "Assigned to me" can
              legitimately match nothing, and a control that vanished with the
              rows would leave a reviewer no way back to "everything". */}
          <QueueAssignmentFilter
            value={assignmentFilter}
            onChange={setAssignmentFilter}
          />
          <AdminVerifyQueueWaiting
            pending={pendingRows}
            waitlisted={waitlistedRows}
            isLoading={isLoading}
            decisions={decisions}
            assignment={assignment}
          />
        </>
      ) : (
        <AdminVerifyDecided displayedDecided={decisions.displayedDecided} />
      )}

      {decisions.decliningItem && (
        <JoinRequestDeclineModal
          applicantName={decisions.decliningItem.name}
          pending={decisions.isPending}
          onConfirm={decisions.confirmDecline}
          onClose={decisions.closeDecline}
        />
      )}
    </div>
  );
}
