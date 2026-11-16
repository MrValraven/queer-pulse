import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminEmptyState, AdminModal, AdminPageHeader } from "./ui";
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
  const [deleteTarget, setDeleteTarget] = useState<ChangemakerDTO | null>(null);

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
          eyebrow={t("shared:adminNav.sections.partners")}
          title={
            <Translation
              i18nKey="community:changemakers.admin.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("community:changemakers.admin.header.sub")}
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
          <AdminEmptyState
            icon={FiHeart}
            title={t("community:changemakers.admin.empty.title")}
            body={t("community:changemakers.admin.empty.description")}
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
    <div className={styles.skeletons}>
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
