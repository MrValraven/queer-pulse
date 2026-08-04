import { useState } from "react";
import { FiArchive } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { describeError } from "../../../../shared/api/errorMessage";
import { Button, EmptyState } from "../../../../shared/components/ui";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import { AdminCat, AdminModal } from "../../ui";
import { categoryTranslationKey } from "./timeline.data";
import styles from "./ArchiveView.module.css";

/**
 * Archived items (Task C5) — a plain list, deliberately ignoring the
 * Board/Timeline toolbar's filters (`useRoadmapFilters()`): the Archive is
 * its own surface, not a filtered slice of the live board, per the brief.
 * Restore is one click (reversible, matches `BulkBar`'s non-gated actions);
 * delete is the one truly destructive action here, so it goes through a
 * small confirm dialog first — mirrors `BulkBar`'s own delete-confirm
 * pattern (same `AdminModal`, same "cancel or confirm" shape).
 */
export function ArchiveView({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { t } = useTranslation();
  const archivedItems = items.filter((item) => item.archived);

  if (archivedItems.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <EmptyState
          icon={<FiArchive />}
          title={t("admin:roadmap.archiveView.emptyTitle")}
          description={t("admin:roadmap.archiveView.emptyBody")}
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {archivedItems.map((item) => (
        <ArchiveRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ArchiveRow({ item }: { item: AdminRoadmapItemDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { archiveItem, deleteItem, pending } = useAdminRoadmapMutations();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const categoryKey = categoryTranslationKey(item.category);

  function handleRestore() {
    archiveItem(
      { id: item.id, archived: false },
      {
        onSuccess: () =>
          showToast(
            t("admin:roadmap.toasts.restored", { name: item.name }),
            "info",
          ),
        onError: (error) =>
          showToast(describeError("Couldn't restore that item", error), "error"),
      },
    );
  }

  function handleDelete() {
    deleteItem(item.id, {
      onSuccess: () => {
        setConfirmingDelete(false);
        showToast(t("admin:roadmap.toasts.deleted", { name: item.name }), "info");
      },
      onError: (error) => {
        setConfirmingDelete(false);
        showToast(describeError("Couldn't delete that item", error), "error");
      },
    });
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTopLine}>
          <p className={styles.rowTitle}>{item.name}</p>
          <AdminCat tone="coral">
            {categoryKey ? t(categoryKey) : item.category}
          </AdminCat>
        </div>
        {item.description && <p className={styles.rowDesc}>{item.description}</p>}
        <div className={styles.rowMeta}>
          <span>
            {item.votes} {t("admin:roadmap.archiveView.votesLabel")}
          </span>
          <span>
            {t("admin:roadmap.archiveView.wasColumnLabel", {
              column: t(`admin:roadmap.board.column.${item.column}`),
            })}
          </span>
        </div>
      </div>

      <div className={styles.rowActions}>
        <Button variant="ghost-dark" onClick={handleRestore} disabled={pending}>
          {t("admin:roadmap.archiveView.restoreCta")}
        </Button>
        <Button
          variant="danger"
          onClick={() => setConfirmingDelete(true)}
          disabled={pending}
        >
          {t("admin:roadmap.archiveView.deleteForGoodCta")}
        </Button>
      </div>

      {confirmingDelete && (
        <AdminModal
          title={t("admin:roadmap.archiveView.deleteConfirmTitle", {
            name: item.name,
          })}
          onClose={() => setConfirmingDelete(false)}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
              >
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" disabled={pending} onClick={handleDelete}>
                {t("admin:roadmap.archiveView.deleteForGoodCta")}
              </Button>
            </>
          }
        >
          <p>{t("admin:roadmap.archiveView.deleteConfirmBody")}</p>
        </AdminModal>
      )}
    </div>
  );
}
