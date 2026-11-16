import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeErrorToast } from "../../shared/api/errorMessage";
import {
  AdminChip,
  AdminEmptyState,
  AdminNotice,
  AdminPanel,
  AdminRowActions,
  adminRowActionClasses,
  adminTableClasses,
} from "./ui";
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
 * actually waiting, and "Load more" is how an admin reaches past the first
 * page. Mirrors AdminHousingGroupsPage's
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
            describeErrorToast(t("admin:errors.saveDecision"), error),
            "error",
          ),
      },
    );
  }

  if (isLoading) return null;

  return (
    <div className={styles.section}>
      <AdminPanel
        title={t("admin:housingRequests.title")}
        description={
          !isError &&
          total > 0 && (
            <span role="status">
              {t("admin:housingRequests.pendingCount", { count: total })}
            </span>
          )
        }
        padding="flush"
      >
        {isError ? (
          <div className={styles.panelInset}>
            <AdminNotice tone="error">
              {t("admin:housingRequests.loadError")}
            </AdminNotice>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.panelInset}>
            <AdminEmptyState
              size="inline"
              title={t("admin:housingRequests.empty")}
            />
          </div>
        ) : (
          requests.map((request, index) => (
            <FadeIn
              key={request.id}
              delay={Math.min(index, 8) * 50}
              className={`${adminTableClasses.row} ${styles.row}`}
            >
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
              <AdminRowActions className={styles.rowActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={adminRowActionClasses.danger}
                  onClick={() => decide(request, "declined")}
                >
                  {t("admin:housingRequests.declineCta")}
                </Button>
                <Button
                  variant="jade"
                  size="sm"
                  onClick={() => decide(request, "accepted")}
                >
                  {t("admin:housingRequests.acceptCta")}
                </Button>
              </AdminRowActions>
            </FadeIn>
          ))
        )}
      </AdminPanel>
      {!isError && requests.length > 0 && hasNextPage && (
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
    </div>
  );
}
