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
import { useAdminHousingCoops } from "./api/useAdminHousingCoops";
import { useDeleteCoop, useUpdateCoop } from "./api/useAdminHousingMutations";
import { AdminHousingCoopRows } from "./AdminHousingCoopRows";
import { AdminHousingCoopForm } from "./AdminHousingCoopForm";
import { AdminHousingJoinRequests } from "./AdminHousingJoinRequests";
import type { HousingCoopDTO } from "../economy/api/housingCoop.api";
import styles from "./AdminHousingCoopsPage.module.css";

type FormMode = { kind: "create" } | { kind: "edit"; coop: HousingCoopDTO };

/**
 * Admin housing panel (`/admin/housing`) — every co-op on the platform,
 * published or still forming, with create/edit/delete and the cross-coop
 * join-request triage queue below. Sourced from useAdminHousingCoops (admin-
 * only, 403s for a non-admin); the demo-mode list and queue are both
 * deliberately empty (see adminHousing.data.ts), so this page's honest empty
 * state is what most reviewers will actually see.
 */
export function AdminHousingCoopsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminHousingCoops();
  const updateCoop = useUpdateCoop();
  const deleteCoop = useDeleteCoop();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HousingCoopDTO | null>(
    null,
  );

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;
  const coops = data ?? [];

  function togglePublished(coop: HousingCoopDTO) {
    updateCoop.mutate(
      { id: coop.id, body: { published: !coop.published } },
      {
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.updateCoop"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteCoop.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(t("admin:housingCoop.toast.removed", { name }), "info"),
      onError: (error) =>
        showToast(
          describeError(
            t("admin:errors.removeCoop"),
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
          i18nKey="admin:housingCoop.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:housingCoop.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:housingCoop.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:housingCoop.header.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              {t("admin:housingCoop.newCta")}
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
              : t("admin:housingCoop.loadError")}
          </p>
        </div>
      ) : coops.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:housingCoop.empty")}
          </p>
        </div>
      ) : (
        <AdminHousingCoopRows
          coops={coops}
          onTogglePublished={togglePublished}
          onEdit={(coop) => setFormMode({ kind: "edit", coop })}
          onDelete={setDeleteTarget}
        />
      )}

      {!forbidden && <AdminHousingJoinRequests />}

      {formMode && (
        <AdminHousingCoopForm
          coop={formMode.kind === "edit" ? formMode.coop : null}
          onClose={() => setFormMode(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:housingCoop.delete.title", {
            name: deleteTarget.name,
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:housingCoop.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:housingCoop.delete.body")}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
