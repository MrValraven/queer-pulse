import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useAdminCommunityTagRequests } from "./api/useAdminCommunityTagRequests";
import { useResolveCommunityTagRequest } from "./api/useResolveCommunityTagRequest";
import type {
  AdminCommunityTagRequestDTO,
  CommunityTagRequestStatus,
} from "./api/communityTagRequests.api";
import type { AdminCommunityTagRequestFilter } from "./api/useAdminCommunityTagRequests";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminCommunityTagRequestFilter[] = [
  "pending",
  "resolved",
  "all",
];

const STATUS_TONE: Record<CommunityTagRequestStatus, AdminTone> = {
  pending: "amber",
  resolved: "jade",
};

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TagRequestRow({
  request,
  onResolve,
  pending,
}: {
  request: AdminCommunityTagRequestDTO;
  onResolve: () => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Withheld from a `communities` grant holder reads differently from an
  // erased account; see the DTO.
  const isRequesterWithheld = !("requestedBy" in request);
  const requesterName = isRequesterWithheld
    ? t("admin:adminCommunityTagRequests.withheldRequester")
    : request.requestedBy
      ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`.trim()
      : t("admin:adminCommunityTagRequests.unknownRequester");

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{request.communityName}</span>
          <AdminChip tone="plum" dot>
            {request.label}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminCommunityTagRequests.row.by", { name: requesterName })}
        </div>
        {request.note && <p className={styles.rowNote}>{request.note}</p>}
        <div className={styles.rowDates}>
          {t("admin:adminCommunityTagRequests.row.sent", {
            date: shortDate(fmt, request.createdAt),
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[request.status]} dot>
          {t(`admin:adminCommunityTagRequests.status.${request.status}`)}
        </AdminChip>
        {request.status === "pending" && (
          <div className={styles.rowActionButtons}>
            <Button
              variant="jade"
              size="sm"
              disabled={pending}
              onClick={onResolve}
            >
              {t("admin:adminCommunityTagRequests.action.resolve")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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
 * Admin review queue for owner/mod "Suggest a tag" requests
 * (`SuggestCommunityTagModal`), filterable by status, paginated. Mirrors
 * `AdminResourceSuggestionsPage`'s structure: demo mode reads the colocated
 * fixture; live mode calls `GET /admin/community-tag-requests` with
 * pagination. Resolving a pending request only records the decision, it
 * never auto-adds the tag to `COMMUNITY_TAGS`; that stays a deliberate,
 * separate code change.
 */
export function AdminCommunityTagRequestsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] =
    useState<AdminCommunityTagRequestFilter>("pending");
  const {
    requests,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminCommunityTagRequests(filter);
  const { resolve, pending } = useResolveCommunityTagRequest();

  const handleResolve = (id: string) => {
    resolve(
      { id },
      {
        onSuccess: () =>
          showToast(
            t("admin:adminCommunityTagRequests.toast.resolved"),
            "success",
          ),
        onError: () =>
          showToast(t("admin:adminCommunityTagRequests.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminCommunityTagRequests.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminCommunityTagRequests.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminCommunityTagRequests.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminCommunityTagRequests.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminCommunityTagRequests.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminCommunityTagRequestFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommunityTagRequests.error")}
          </p>
        ) : requests.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommunityTagRequests.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {requests.map((request, index) => (
                <FadeIn key={request.id} delay={Math.min(index, 8) * 50}>
                  <TagRequestRow
                    request={request}
                    pending={pending}
                    onResolve={() => handleResolve(request.id)}
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
                    ? t("admin:adminCommunityTagRequests.loadingMore")
                    : t("admin:adminCommunityTagRequests.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
