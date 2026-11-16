import { useState } from "react";
import { FiHash, FiPlus } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeErrorToast } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import {
  AdminEmptyState,
  AdminModal,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
} from "./ui";
import {
  useAdminTopics,
  useDeleteTopic,
  useSetTopicArchived,
} from "./api/TopicsAdminHooks";
import { TopicsAdminRows } from "./TopicsAdminRows";
import { TopicsAdminForm } from "./TopicsAdminForm";
import type { AdminTopicDTO } from "./api/topicsAdmin.api";
import styles from "./TopicsAdminPage.module.css";

type FormMode = { kind: "create" } | { kind: "edit"; topic: AdminTopicDTO };

/**
 * The topic directory console (`/admin/topics`): the curated interest graph
 * behind `/topics`, `/topic/:tag` and the topic results in global search.
 *
 * The starter set ships in a data migration; everything after that is decided
 * here. Archiving is the everyday move: the topic leaves the directory, search
 * and the related-topics panel while its posts and followers stay put, so
 * restoring it is one click. Deleting is for a topic created in error, and it
 * takes the posts and the follows with it.
 */
export function TopicsAdminPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminTopics();
  const setTopicArchived = useSetTopicArchived();
  const deleteTopic = useDeleteTopic();
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTopicDTO | null>(null);

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;

  // Live topics first, alphabetically, with the archived ones settled at the
  // bottom: the list is a working directory, and a retired topic is reference
  // rather than something staff act on daily.
  const topics = [...(data ?? [])].sort((first, second) => {
    if (first.isArchived !== second.isArchived) {
      return first.isArchived ? 1 : -1;
    }
    return first.tag.localeCompare(second.tag);
  });

  function toastError(messageKey: string, cause: unknown) {
    showToast(describeErrorToast(t(messageKey), cause), "error");
  }

  function setArchived(topic: AdminTopicDTO, isArchived: boolean) {
    setTopicArchived.mutate(
      { id: topic.id, isArchived },
      {
        onSuccess: () =>
          showToast(
            t(
              isArchived
                ? "admin:topics.toast.archived"
                : "admin:topics.toast.restored",
              { tag: topic.tag },
            ),
            "info",
          ),
        onError: (cause) => toastError("admin:topics.archiveError", cause),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const tag = deleteTarget.tag;
    deleteTopic.mutate(deleteTarget.id, {
      onSuccess: () =>
        showToast(t("admin:topics.toast.deleted", { tag }), "info"),
      onError: (cause) => toastError("admin:topics.deleteError", cause),
    });
    setDeleteTarget(null);
  }

  return (
    <AdminShell
      title={
        <Translation i18nKey="admin:topics.title" components={{ em: <em /> }} />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.directory")}
          title={
            <Translation
              i18nKey="admin:topics.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:topics.sub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setFormMode({ kind: "create" })}
            >
              <FiPlus aria-hidden /> {t("admin:topics.newCta")}
            </Button>
          }
        />
      </FadeIn>

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={92}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <AdminNotice tone="error">
          {isForbidden
            ? t("admin:common.panelForbidden")
            : t("admin:topics.loadError")}
        </AdminNotice>
      ) : topics.length === 0 ? (
        <AdminEmptyState icon={FiHash} title={t("admin:topics.empty")} />
      ) : (
        <AdminPanel padding="flush" isOverflowVisible>
          <TopicsAdminRows
            topics={topics}
            onEdit={(topic) => setFormMode({ kind: "edit", topic })}
            onSetArchived={setArchived}
            onDelete={setDeleteTarget}
          />
        </AdminPanel>
      )}

      {formMode && (
        <TopicsAdminForm
          topic={formMode.kind === "edit" ? formMode.topic : null}
          onClose={() => setFormMode(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:topics.delete.title", { tag: deleteTarget.tag })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:topics.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:topics.delete.body", {
              posts: deleteTarget.totalPosts,
              followers: deleteTarget.followerCount,
            })}
          </p>
        </AdminModal>
      )}
    </AdminShell>
  );
}
