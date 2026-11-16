import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeErrorToast } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import {
  AdminChip,
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminRowActions,
  adminRowActionClasses,
  adminTableClasses,
} from "./ui";
import {
  useAdminGroupJoinRequests,
  useTriageGroupJoinRequest,
} from "./api/useAdminHousingGroups";
import type {
  AdminGroupJoinRequestDTO,
  GroupTriageAction,
} from "./api/adminHousingGroups.api";
import { AdminGroupListingsSection } from "./AdminGroupListingsSection";
import styles from "./AdminHousingCoopsPage.module.css";

/**
 * Steward/moderator console for vetted housing groups (`/admin/housing-groups`).
 * Two jobs: triage access-gated join requests (approve/decline, with a mutual-
 * connections trust signal), and enforce the norms by hiding listings that break
 * them. Sourced from moderator/admin-only endpoints that 403 for anyone else;
 * demo mode is an honest empty queue and empty table (see adminHousingGroups.data.ts).
 *
 * The join-request queue is paginated and asks the server for PENDING requests
 * (ENG-41). It used to pull the newest 200 requests in every status and filter
 * to the pending ones here, which meant a group carrying 200 decided requests
 * newer than one pending request showed an empty queue while somebody waited.
 * The count line quotes the server's `total`, so the number on screen is how
 * many people are actually waiting.
 *
 * The co-op relocation queue this comment used to defer has been REMOVED for
 * good: `coop_relocation_requests` never had a submission affordance, so no
 * member could ever file one and the table was always empty. Building a console
 * for it would have been a second triage pipeline alongside the live one in
 * `src/intakes/`. If the need becomes real, it belongs there as an intake kind.
 */
export function AdminHousingGroupsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    requests: pendingRequests,
    total,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminGroupJoinRequests();
  const triage = useTriageGroupJoinRequest();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;

  // The status filter now lives in the query (ENG-41), so the only thing left to
  // drop client-side is what this moderator has already decided this session.
  const requests = pendingRequests.filter(
    (request) => !resolved.has(request.id),
  );

  function decide(
    request: AdminGroupJoinRequestDTO,
    action: GroupTriageAction,
  ) {
    triage.mutate(
      { id: request.id, action },
      {
        onSuccess: () =>
          setResolved((current) => new Set(current).add(request.id)),
        onError: (mutationError) =>
          showToast(
            describeErrorToast(
              t("admin:housingGroups.requests.error"),
              mutationError,
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:housingGroups.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.communities")}
          title={
            <Translation
              i18nKey="admin:housingGroups.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:housingGroups.header.sub")}
        />
      </FadeIn>

      <div className={styles.sections}>
        <div className={styles.section}>
          <AdminPanel
            title={t("admin:housingGroups.requests.title")}
            description={
              !isLoading &&
              !isError &&
              total > 0 && (
                <span role="status">
                  {t("admin:housingGroups.requests.pendingCount", {
                    count: total,
                  })}
                </span>
              )
            }
            padding="flush"
          >
            {isLoading ? (
              <div className={`${styles.panelInset} ${styles.skeletons}`}>
                {[0, 1, 2].map((skeletonIndex) => (
                  <SkeletonLine key={skeletonIndex} height={52} />
                ))}
              </div>
            ) : isError ? (
              <div className={styles.panelInset}>
                <AdminNotice tone="error">
                  {forbidden
                    ? t("admin:common.panelForbidden")
                    : t("admin:housingGroups.requests.loadError")}
                </AdminNotice>
              </div>
            ) : requests.length === 0 ? (
              <div className={styles.panelInset}>
                <AdminEmptyState
                  size="inline"
                  title={t("admin:housingGroups.requests.empty")}
                />
              </div>
            ) : (
              requests.map((request, index) => (
                <GroupJoinRequestRow
                  key={request.id}
                  request={request}
                  delay={Math.min(index, 8) * 50}
                  onDecide={(action) => decide(request, action)}
                />
              ))
            )}
          </AdminPanel>
          {!isLoading && !isError && requests.length > 0 && hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                variant="ghost"
                size="md"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage
                  ? t("admin:housingGroups.requests.loadingMore")
                  : t("admin:housingGroups.requests.loadMore")}
              </Button>
            </div>
          )}
        </div>

        {!forbidden && <AdminGroupListingsSection />}
      </div>
    </AdminShell>
  );
}

/** One pending join request: who is asking, for which group, any mutual
 *  connections as a trust signal, and the two decisions. */
function GroupJoinRequestRow({
  request,
  delay,
  onDecide,
}: {
  request: AdminGroupJoinRequestDTO;
  delay: number;
  onDecide: (action: GroupTriageAction) => void;
}) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={delay} className={`${adminTableClasses.row} ${styles.row}`}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{request.name}</span>
          <AdminChip tone="plum" dot>
            {request.group?.name ??
              t("admin:housingGroups.requests.unknownGroup")}
          </AdminChip>
          {request.mutualConnections != null &&
            request.mutualConnections > 0 && (
              <AdminChip tone="jade">
                {t("admin:housingGroups.requests.mutuals", {
                  count: request.mutualConnections,
                })}
              </AdminChip>
            )}
        </div>
        <div className={styles.rowMeta}>
          {request.relationship}
          {request.note ? ` · "${request.note}"` : ""}
        </div>
      </div>
      <AdminRowActions className={styles.rowActions}>
        <Button
          variant="ghost"
          size="sm"
          className={adminRowActionClasses.danger}
          onClick={() => onDecide("declined")}
        >
          {t("admin:housingGroups.requests.declineCta")}
        </Button>
        <Button variant="jade" size="sm" onClick={() => onDecide("approved")}>
          {t("admin:housingGroups.requests.approveCta")}
        </Button>
      </AdminRowActions>
    </FadeIn>
  );
}
