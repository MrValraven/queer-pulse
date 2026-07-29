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
import { useAdminOrgTiers } from "./api/useAdminOrgTiers";
import {
  useDeleteOrgTier,
  useUpdateOrgTier,
} from "./api/useAdminOrgTierMutations";
import { AdminOrgTierRows } from "./AdminOrgTierRows";
import { AdminOrgTierForm } from "./AdminOrgTierForm";
import type { OrgTierAdminDTO } from "../marketing/api/adminOrgTiers.api";
import styles from "./AdminOrgTiersPage.module.css";

type FormMode = { kind: "create" } | { kind: "edit"; tier: OrgTierAdminDTO };

/**
 * Admin partnership-tiers panel (`/admin/org-tiers`) — every tier on the
 * platform, published or not, with create/edit/delete. Sourced from
 * useAdminOrgTiers (admin-only, 403s for a non-admin); the demo-mode list is
 * deliberately empty (see adminOrgTiers.data.ts), so this page's honest
 * empty state is what most reviewers will actually see.
 */
export function AdminOrgTiersPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminOrgTiers();
  const updateOrgTier = useUpdateOrgTier();
  const deleteOrgTier = useDeleteOrgTier();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrgTierAdminDTO | null>(
    null,
  );

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;
  const tiers = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  function togglePublished(tier: OrgTierAdminDTO) {
    updateOrgTier.mutate(
      { id: tier.id, body: { published: !tier.published } },
      {
        onError: (error) =>
          showToast(describeError("Couldn't update that tier", error), "error"),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteOrgTier.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(t("admin:orgTier.toast.removed", { name }), "info"),
      onError: (error) =>
        showToast(describeError("Couldn't remove that tier", error), "error"),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:orgTier.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:partners.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:orgTier.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:orgTier.header.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              {t("admin:orgTier.newCta")}
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
              : t("admin:orgTier.loadError")}
          </p>
        </div>
      ) : tiers.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:orgTier.empty")}
          </p>
        </div>
      ) : (
        <AdminOrgTierRows
          tiers={tiers}
          onTogglePublished={togglePublished}
          onEdit={(tier) => setFormMode({ kind: "edit", tier })}
          onDelete={setDeleteTarget}
        />
      )}

      {formMode && (
        <AdminOrgTierForm
          tier={formMode.kind === "edit" ? formMode.tier : null}
          onClose={() => setFormMode(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:orgTier.delete.title", {
            name: deleteTarget.name,
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:orgTier.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:orgTier.delete.body")}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
