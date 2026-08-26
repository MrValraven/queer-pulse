import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { AdminDsarDrawer } from "./AdminDsarDrawer";
import { AdminDsarRow } from "./AdminDsarRow";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useAdminDsarRequests, type AdminDsarFilter } from "./api/useAdminDsar";
import type { AdminDsarRequestDTO } from "./api/adminDsar.api";
import styles from "./AdminDsarPage.module.css";

const FILTERS: AdminDsarFilter[] = [
  "received",
  "in_review",
  "resolved",
  "rejected",
  "all",
];

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={112}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * The review queue for data-subject requests (`POST /account/dsar`).
 *
 * Every request starts a 30-day statutory clock the moment it is filed, and
 * before this page nothing on the platform listed one: rows sat at `received`
 * while their deadlines passed unseen, and the member was told an answer would
 * arrive by an email QueerPulse has never sent. So the queue is ordered by
 * deadline (server-side) rather than by arrival, and each row carries its own
 * countdown with an unmissable overdue treatment.
 *
 * Resolving or rejecting a request writes an operator-authored outcome note
 * and fires an in-app notification to the member. That notification is the
 * whole delivery channel; nothing here promises anything else.
 */
export function AdminDsarPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminDsarFilter>("received");
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const {
    requests,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminDsarRequests(filter);

  const openRequest: AdminDsarRequestDTO | null =
    requests.find((request) => request.id === openRequestId) ?? null;
  const overdueCount = requests.filter((request) => request.isOverdue).length;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminDsar.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminDsar.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminDsar.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={
            overdueCount > 0
              ? t("admin:adminDsar.header.subOverdue", { count: overdueCount })
              : t("admin:adminDsar.header.sub")
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminDsar.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as AdminDsarFilter)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>{t("admin:adminDsar.error")}</p>
        ) : requests.length === 0 ? (
          <p className={styles.emptyLine}>{t("admin:adminDsar.empty")}</p>
        ) : (
          <>
            <div className={styles.rows}>
              {requests.map((request, index) => (
                <FadeIn key={request.id} delay={Math.min(index, 8) * 50}>
                  <AdminDsarRow
                    request={request}
                    onOpen={() => setOpenRequestId(request.id)}
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
                    ? t("admin:adminDsar.loadingMore")
                    : t("admin:adminDsar.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>

      {openRequest && (
        <AdminDsarDrawer
          request={openRequest}
          onClose={() => setOpenRequestId(null)}
          onUpdated={(updated) => {
            // The cache patch drops a row out of a tab it no longer matches,
            // so keep the pane open only while the row is still on screen.
            if (filter !== "all" && updated.status !== filter) {
              setOpenRequestId(null);
            }
          }}
        />
      )}
    </AdminShell>
  );
}
