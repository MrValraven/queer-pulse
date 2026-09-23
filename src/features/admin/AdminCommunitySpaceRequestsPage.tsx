import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { useAdminCommunitySpaceRequests } from "./api/useAdminCommunitySpaceRequests";
import {
  useDecideCommunitySpaceRequest,
  type SpaceRequestDecision,
} from "./api/useDecideCommunitySpaceRequest";
import type { AdminCommunitySpaceRequestFilter } from "./api/useAdminCommunitySpaceRequests";
import type { AdminCommunitySpaceRequestDTO } from "./api/adminCommunitySpaceRequests.api";
import { AdminCommunitySpaceRequestRow } from "./AdminCommunitySpaceRequestRow";
import { AdminCommunitySpaceRequestDeclineModal } from "./AdminCommunitySpaceRequestDeclineModal";
import styles from "./AdminSubmissionList.module.css";

const FILTERS = ["open", "approved", "declined", "all"] as const;

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={92}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin review queue for owner/co-owner "Request spaces" submissions (filed
 * from `SpaceRequestPanel` in mod tools), filterable by status, paginated.
 * Mirrors `AdminCommunityTagRequestsPage`'s structure: demo mode reads the
 * colocated fixture; live mode calls `GET /admin/community-space-requests`
 * with pagination. Approving flips the community's "Allow spaces" setting
 * server-side; a stale queue's Approve on an already-decided request 409s
 * `SPACE_REQUEST_NOT_OPEN`, which the queue surfaces as its own toast rather
 * than the generic error and refreshes the row.
 */
export function AdminCommunitySpaceRequestsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] =
    useState<AdminCommunitySpaceRequestFilter>("open");
  const [declining, setDeclining] =
    useState<AdminCommunitySpaceRequestDTO | null>(null);
  const {
    requests,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminCommunitySpaceRequests(filter);
  const { decide, pending } = useDecideCommunitySpaceRequest();

  const runDecision = (
    request: AdminCommunitySpaceRequestDTO,
    decision: SpaceRequestDecision,
    reason?: string,
  ) =>
    decide(
      { id: request.id, decision, reason: reason || undefined },
      {
        onSuccess: () => {
          setDeclining(null);
          showToast(
            decision === "approve"
              ? t("admin:adminCommunitySpaceRequests.toast.approved", {
                  name: request.community?.name ?? "",
                })
              : t("admin:adminCommunitySpaceRequests.toast.declined"),
            "success",
          );
        },
        onError: (error) => {
          const code =
            error instanceof ApiError && error.status === 409
              ? (error.data as { code?: string } | undefined)?.code
              : undefined;
          showToast(
            code === "SPACE_REQUEST_NOT_OPEN"
              ? t("admin:adminCommunitySpaceRequests.toast.notOpen")
              : t("admin:adminCommunitySpaceRequests.toast.error"),
            "error",
          );
        },
      },
    );

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminCommunitySpaceRequests.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminCommunitySpaceRequests.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminCommunitySpaceRequests.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminCommunitySpaceRequests.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminCommunitySpaceRequests.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminCommunitySpaceRequestFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommunitySpaceRequests.error")}
          </p>
        ) : requests.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommunitySpaceRequests.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {requests.map((request, index) => (
                <FadeIn key={request.id} delay={Math.min(index, 8) * 50}>
                  <AdminCommunitySpaceRequestRow
                    request={request}
                    isPending={pending}
                    onApprove={() => runDecision(request, "approve")}
                    onDecline={() => setDeclining(request)}
                  />
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
                    ? t("admin:adminCommunitySpaceRequests.loadingMore")
                    : t("admin:adminCommunitySpaceRequests.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>

      {declining && (
        <AdminCommunitySpaceRequestDeclineModal
          communityName={declining.community?.name ?? ""}
          isPending={pending}
          onSubmit={(reason) => runDecision(declining, "decline", reason)}
          onClose={() => setDeclining(null)}
        />
      )}
    </AdminShell>
  );
}
