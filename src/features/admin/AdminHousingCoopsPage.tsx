import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
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
        onError: () =>
          showToast("Couldn't update that co-op — please try again", "error"),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteCoop.mutate(deleteTarget.id, {
      onSuccess: () => showToast(`${name} was removed`, "info"),
      onError: () =>
        showToast("Couldn't remove that co-op — please try again", "error"),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <>
          Housing <em>co-ops</em>
        </>
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow="Local economy"
          title={
            <>
              Housing <em>co-ops</em>
            </>
          }
          sub="Every co-op on the platform, published or still forming — create one, keep the details current, and clear the join-request queue below."
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              New co-op
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
              ? "This panel is for admins only."
              : "The co-op list couldn't load right now — please try again."}
          </p>
        </div>
      ) : coops.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            No co-ops yet — create the first one below.
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
          title={`Remove ${deleteTarget.name}?`}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Remove co-op
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            This removes it from the public directory and the admin list.
            Join requests already submitted for it stay on record.
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
