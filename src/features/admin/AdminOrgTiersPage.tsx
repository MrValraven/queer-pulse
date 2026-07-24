import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
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
        onError: () =>
          showToast("Couldn't update that tier — please try again", "error"),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteOrgTier.mutate(deleteTarget.id, {
      onSuccess: () => showToast(`${name} was removed`, "info"),
      onError: () =>
        showToast("Couldn't remove that tier — please try again", "error"),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <>
          Partnership <em>tiers</em>
        </>
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow="Partnerships"
          title={
            <>
              Partnership <em>tiers</em>
            </>
          }
          sub="Every tier on the For Organisations page, published or still in draft — create one, keep the pricing and copy current, and control what's live."
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              New tier
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
              : "The tier list couldn't load right now — please try again."}
          </p>
        </div>
      ) : tiers.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            No tiers yet — create the first one below.
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
          title={`Remove ${deleteTarget.name}?`}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Remove tier
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            This removes it from the public partnership tiers list and the
            admin panel. This cannot be undone.
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
