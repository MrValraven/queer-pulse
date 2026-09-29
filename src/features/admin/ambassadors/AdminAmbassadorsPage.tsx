import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiAward } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { AdminPageHeader, AdminTabs } from "../ui";
import {
  ADMIN_AMBASSADOR_STATUSES,
  ambassadorErrorKey,
  isAdminAmbassadorStatus,
  type AdminAmbassadorDTO,
} from "./adminAmbassadors.api";
import {
  useAdminAmbassadors,
  useChangeAmbassadorFocus,
  useRevokeAmbassador,
} from "./useAdminAmbassadors";
import { AdminAmbassadorRow } from "./AdminAmbassadorRow";
import { AdminAmbassadorGrantPanel } from "./AdminAmbassadorGrantPanel";
import { AdminAmbassadorCirclePanel } from "./AdminAmbassadorCirclePanel";
import { AdminAmbassadorRevokeModal } from "./AdminAmbassadorRevokeModal";
import { AdminAmbassadorHistoryDrawer } from "./AdminAmbassadorHistoryDrawer";
import styles from "./AdminAmbassadorsPage.module.css";

const HEADING_ID = "admin-ambassadors-heading";

/**
 * After a revoke the row leaves the list, taking the Revoke button the dialog
 * would hand focus back to. Two frames let React commit both the dialog's
 * unmount (and its focus restore) and the row's removal, then focus lands on
 * the page heading. Unlike the listings queue's guard, this does not first
 * check for focus on the body: the cache patch and the dialog close commit in
 * either order, and when the dialog closes first its restore briefly parks
 * focus on a Revoke button that is about to disappear.
 */
function focusHeadingAfterRevoke() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(HEADING_ID)?.focus();
    });
  });
}

/**
 * `/admin/ambassadors`: Admins and `partnerships` staff grant the QueerPulse
 * Ambassador status, change an ambassador's focus area, revoke it with a
 * logged reason, and look after the private ambassadors circle. The tab lives
 * in `?status=` so a link can open the Past record directly.
 */
export function AdminAmbassadorsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const status = isAdminAmbassadorStatus(requestedStatus)
    ? requestedStatus
    : "active";
  const {
    rows,
    isLoading,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminAmbassadors(status);
  // A failed next page also sets `isError`; the loaded rows stay on screen
  // and the error shows beside Load more, so only a first-page failure
  // replaces the list.
  const isFirstPageError = isError && !isFetchNextPageError;
  const changeFocus = useChangeAmbassadorFocus();
  const revoke = useRevokeAmbassador();
  const [revokeTarget, setRevokeTarget] = useState<AdminAmbassadorDTO | null>(
    null,
  );
  const [historyMember, setHistoryMember] = useState<
    AdminAmbassadorDTO["member"] | null
  >(null);

  function openRevoke(row: AdminAmbassadorDTO) {
    revoke.reset();
    setRevokeTarget(row);
  }

  function handleConfirmRevoke(reason: string) {
    if (!revokeTarget) return;
    const revokedName = `${revokeTarget.member.firstName} ${revokeTarget.member.lastName}`;
    revoke.mutate(
      { row: revokeTarget, reason },
      {
        onSuccess: () => {
          setRevokeTarget(null);
          showToast(
            t("admin:ambassadors.revoke.success", { name: revokedName }),
            "success",
          );
          focusHeadingAfterRevoke();
        },
      },
    );
  }

  return (
    <AdminShell
      title={t("admin:ambassadors.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={HEADING_ID}
          eyebrow={t("admin:ambassadors.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:ambassadors.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:ambassadors.header.sub")}
        />
      </FadeIn>

      <div className={styles.layout}>
        <div className={styles.main}>
          <AdminTabs
            className={styles.tabs}
            tabs={ADMIN_AMBASSADOR_STATUSES.map((value) => ({
              id: value,
              label: t(`admin:ambassadors.tabs.${value}`),
            }))}
            active={status}
            onChange={(value) =>
              setSearchParams({ status: value }, { replace: true })
            }
          />
          {isLoading ? (
            <div className={styles.rows}>
              {[0, 1, 2].map((skeletonIndex) => (
                <SkeletonLine key={skeletonIndex} height={132} />
              ))}
            </div>
          ) : isFirstPageError ? (
            <p className={styles.emptyLine} role="alert">
              {t("admin:ambassadors.loadError")}
            </p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<FiAward aria-hidden />}
              title={t(`admin:ambassadors.empty.${status}.title`)}
              description={t(`admin:ambassadors.empty.${status}.description`)}
            />
          ) : (
            <div className={styles.rows}>
              {rows.map((row) => (
                <AdminAmbassadorRow
                  key={row.id}
                  row={row}
                  isFocusSaving={
                    changeFocus.isPending &&
                    changeFocus.variables?.row.id === row.id
                  }
                  onChangeFocus={(focusArea) =>
                    changeFocus.mutate(
                      { row, focusArea },
                      {
                        onSuccess: () =>
                          showToast(
                            t("admin:ambassadors.row.focusSaved"),
                            "success",
                          ),
                        onError: (error) =>
                          showToast(t(ambassadorErrorKey(error)), "error"),
                      },
                    )
                  }
                  onRevoke={() => openRevoke(row)}
                  onShowHistory={() => setHistoryMember(row.member)}
                />
              ))}
            </div>
          )}
          {hasNextPage && !isFirstPageError && (
            <div className={styles.loadMore}>
              {isFetchNextPageError && (
                <p className={styles.emptyLine} role="alert">
                  {t("admin:ambassadors.loadMoreError")}
                </p>
              )}
              <Button
                variant="ghost"
                size="md"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage
                  ? t("admin:ambassadors.loadingMore")
                  : t("admin:ambassadors.loadMore")}
              </Button>
            </div>
          )}
        </div>

        <aside className={styles.aside}>
          <AdminAmbassadorGrantPanel />
          <AdminAmbassadorCirclePanel />
        </aside>
      </div>

      {revokeTarget && (
        <AdminAmbassadorRevokeModal
          memberName={`${revokeTarget.member.firstName} ${revokeTarget.member.lastName}`}
          isPending={revoke.isPending}
          errorMessage={
            revoke.isError ? t(ambassadorErrorKey(revoke.error)) : null
          }
          onSubmit={handleConfirmRevoke}
          onClose={() => setRevokeTarget(null)}
        />
      )}

      {historyMember && (
        <AdminAmbassadorHistoryDrawer
          member={historyMember}
          onClose={() => setHistoryMember(null)}
        />
      )}
    </AdminShell>
  );
}
