import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { Button, EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader, AdminModal } from "./ui";
import { AdminChangemakerRows } from "./AdminChangemakerRows";
import { AdminChangemakerStatsCard } from "./AdminChangemakerStatsCard";
import { AdminChangemakerEditor } from "./AdminChangemakerEditor";
import {
  useAdminChangemakers,
  useDeleteChangemaker,
  usePublishChangemaker,
} from "../community/api/useAdminChangemakers";
import type { ChangemakerDTO } from "../community/api/changemakers.api";
import styles from "./AdminChangemakersPage.module.css";

export function AdminChangemakersPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: profiles = [], isLoading } = useAdminChangemakers();
  const publishChangemaker = usePublishChangemaker();
  const deleteChangemaker = useDeleteChangemaker();

  const [editorTarget, setEditorTarget] = useState<
    ChangemakerDTO | "new" | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<ChangemakerDTO | null>(
    null,
  );

  function handleTogglePublish(profile: ChangemakerDTO) {
    const nextPublished = profile.status !== "published";
    publishChangemaker.mutate(
      { id: profile.id, published: nextPublished },
      {
        onSuccess: () =>
          showToast(
            t(
              nextPublished
                ? "community:changemakers.admin.publishedToast"
                : "community:changemakers.admin.unpublishedToast",
            ),
            "success",
          ),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteChangemaker.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast(t("community:changemakers.admin.deletedToast"), "success");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <AdminShell title={t("community:changemakers.admin.title")}>
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("community:changemakers.admin.navLabel")}
          title={t("community:changemakers.admin.title")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setEditorTarget("new")}
            >
              {t("community:changemakers.admin.newProfileCta")}
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminChangemakerStatsCard />
      </FadeIn>

      <FadeIn delay={120}>
        {isLoading ? (
          <RowsSkeleton />
        ) : profiles.length === 0 ? (
          <EmptyState
            icon={<FiHeart aria-hidden />}
            title={t("community:changemakers.admin.empty.title")}
            description={t("community:changemakers.admin.empty.description")}
          />
        ) : (
          <AdminChangemakerRows
            profiles={profiles}
            onEdit={setEditorTarget}
            onTogglePublish={handleTogglePublish}
            onDelete={setDeleteTarget}
          />
        )}
      </FadeIn>

      {editorTarget && (
        <AdminChangemakerEditor
          profile={editorTarget === "new" ? null : editorTarget}
          onClose={() => setEditorTarget(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          onClose={() => setDeleteTarget(null)}
          title={t("community:changemakers.admin.deleteConfirmTitle")}
          footer={
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setDeleteTarget(null)}
              >
                {t("community:changemakers.admin.cancelCta")}
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                {t("community:changemakers.admin.deleteConfirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("community:changemakers.admin.deleteConfirmBody", {
              name: deleteTarget.name,
            })}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={72}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
