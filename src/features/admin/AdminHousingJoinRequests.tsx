import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminChip } from "./ui";
import { useAdminJoinRequests } from "./api/useAdminHousingCoops";
import { useTriageJoinRequest } from "./api/useAdminHousingMutations";
import type { AdminJoinRequestDTO } from "./api/adminHousing.api";
import styles from "./AdminHousingCoopsPage.module.css";

/**
 * Cross-coop join-request triage queue, rendered below the coop list on the
 * admin housing page. Pending rows get Accept/Decline, wired to
 * useTriageJoinRequest; a decision drops the row locally on success (mirrors
 * AdminPartnerApplicationsPage) so it reads instantly whether or not the
 * mutation actually persisted anywhere (it's a no-op in demo mode).
 */
export function AdminHousingJoinRequests() {
  const { showToast } = useToast();
  const { data, isLoading, isError } = useAdminJoinRequests();
  const triage = useTriageJoinRequest();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const requests = (data ?? []).filter(
    (request) => request.status === "pending" && !resolved.has(request.id),
  );

  function decide(request: AdminJoinRequestDTO, action: "accepted" | "declined") {
    triage.mutate(
      { id: request.id, action },
      {
        onSuccess: () =>
          setResolved((current) => new Set(current).add(request.id)),
        onError: (error) =>
          showToast(describeError("Couldn't save that decision", error), "error"),
      },
    );
  }

  if (isLoading) return null;

  return (
    <div className={styles.joinRequests}>
      <h2 className={styles.sectionTitle}>Join requests</h2>
      {isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            The join-request queue couldn't load right now — please try
            again.
          </p>
        </div>
      ) : requests.length === 0 ? (
        <p className={styles.emptyText}>
          Nothing waiting on you — every request has been triaged.
        </p>
      ) : (
        <div className={styles.rows}>
          {requests.map((request, i) => (
            <FadeIn key={request.id} delay={Math.min(i, 8) * 50}>
              <div className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowName}>{request.name}</span>
                    <AdminChip tone="plum" dot>
                      {request.coop?.name ?? "Unknown co-op"}
                    </AdminChip>
                  </div>
                  <div className={styles.rowMeta}>
                    {request.householdSize} in the household
                    {request.note ? ` · "${request.note}"` : ""}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => decide(request, "declined")}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="jade"
                    size="md"
                    onClick={() => decide(request, "accepted")}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
