import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminPageHeader, AdminModal } from "./ui";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { useAdminResourceListings } from "./api/useAdminResourceListings";
import { useDeleteResourceListing } from "./api/useAdminResourceListingMutations";
import { AdminResourceListingRows } from "./AdminResourceListingRows";
import { AdminResourceListingForm } from "./AdminResourceListingForm";
import type { AdminResourceListingDTO } from "./api/adminResourceListings.api";
import styles from "./AdminResourceListingsPage.module.css";

type FormMode =
  | { kind: "create" }
  | { kind: "edit"; listing: AdminResourceListingDTO };

/**
 * Admin resource-listings panel (`/admin/resource-listings`) — every Legal
 * Aid / Sexual Health Testing listing, active or archived, with
 * create/edit/delete (CNT-14). Sourced from useAdminResourceListings
 * (admin-only, 403s for a non-admin); the demo-mode list is deliberately
 * empty (see adminResourceListings.data.ts), so this page's honest empty
 * state is what most reviewers will actually see.
 */
export function AdminResourceListingsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminResourceListings();
  const deleteListing = useDeleteResourceListing();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminResourceListingDTO | null>(null);

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;
  const listings = data ?? [];

  function confirmDelete() {
    if (!deleteTarget) return;
    const title = deleteTarget.title;
    deleteListing.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(
          t("admin:adminResourceListings.toast.removed", { title }),
          "info",
        ),
      onError: (error) =>
        showToast(
          describeError(
            t("admin:errors.removeListing"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        ),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminResourceListings.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminResourceListings.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminResourceListings.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminResourceListings.header.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              {t("admin:adminResourceListings.newCta")}
            </Button>
          }
        />
      </FadeIn>

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={64}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {forbidden
              ? t("admin:common.panelForbidden")
              : t("admin:adminResourceListings.loadError")}
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:adminResourceListings.empty")}
          </p>
        </div>
      ) : (
        <AdminResourceListingRows
          listings={listings}
          onEdit={(listing) => setFormMode({ kind: "edit", listing })}
          onDelete={setDeleteTarget}
        />
      )}

      {formMode && (
        <AdminResourceListingForm
          listing={formMode.kind === "edit" ? formMode.listing : null}
          onClose={() => setFormMode(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:adminResourceListings.delete.title", {
            title: deleteTarget.title,
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:adminResourceListings.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:adminResourceListings.delete.body")}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
