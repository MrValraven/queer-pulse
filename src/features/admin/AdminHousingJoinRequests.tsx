import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
 *
 * The queue is paginated and asks the server for PENDING requests (ENG-41). It
 * used to pull the newest 200 requests in every status and filter to the pending
 * ones here, which meant a platform carrying 200 decided requests newer than one
 * pending request showed an empty queue while somebody waited. The count line
 * quotes the server's `total`, so the number on screen is how many people are
 * actually waiting rather than how many rows happened to arrive, and "Load more"
 * is how an admin reaches past the first page. Mirrors AdminHousingGroupsPage's
 * queue for the sibling housing-groups surface.
 */
export function AdminHousingJoinRequests() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    requests: pendingRequests,
    total,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminJoinRequests();
  const triage = useTriageJoinRequest();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  // The status filter now lives in the query (ENG-41), so the only thing left to
  // drop client-side is what this admin has already decided this session.
  const requests = pendingRequests.filter(
    (request) => !resolved.has(request.id),
  );

  function decide(
    request: AdminJoinRequestDTO,
    action: "accepted" | "declined",
  ) {
    triage.mutate(
      { id: request.id, action },
      {
        onSuccess: () =>
          setResolved((current) => new Set(current).add(request.id)),
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.saveDecision"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  if (isLoading) return null;

  return (
    <div className={styles.joinRequests}>
      <h2 className={styles.sectionTitle}>
        {t("admin:housingRequests.title")}
      </h2>
      {!isError && total > 0 && (
        <p className={styles.queueCount} role="status">
          {t("admin:housingRequests.pendingCount", { count: total })}
        </p>
      )}
      {isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {t("admin:housingRequests.loadError")}
          </p>
        </div>
      ) : requests.length === 0 ? (
        <p className={styles.emptyText}>{t("admin:housingRequests.empty")}</p>
      ) : (
        <>
          <div className={styles.rows}>
            {requests.map((request, index) => (
              <FadeIn key={request.id} delay={Math.min(index, 8) * 50}>
                <div className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTop}>
                      <span className={styles.rowName}>{request.name}</span>
                      <AdminChip tone="plum" dot>
                        {request.coop?.name ??
                          t("admin:housingRequests.unknownCoop")}
                      </AdminChip>
                    </div>
                    <div className={styles.rowMeta}>
                      {t("admin:housingRequests.householdSize", {
                        size: request.householdSize,
                      })}
                      {request.note ? ` · "${request.note}"` : ""}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => decide(request, "declined")}
                    >
                      {t("admin:housingRequests.declineCta")}
                    </Button>
                    <Button
                      variant="jade"
                      size="md"
                      onClick={() => decide(request, "accepted")}
                    >
                      {t("admin:housingRequests.acceptCta")}
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          {hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                variant="ghost"
                size="md"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage
                  ? t("admin:housingRequests.loadingMore")
                  : t("admin:housingRequests.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
