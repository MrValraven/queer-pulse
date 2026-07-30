import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useAdminRoadmap, useAdminRoadmapMutations } from "./api/useAdminRoadmap";
import { AdminRoadmapItemRow } from "./AdminRoadmapItemRow";
import { AdminRoadmapItemModal } from "./AdminRoadmapItemModal";
import type { AdminRoadmapItem } from "./adminRoadmap.data";
import type { RoadmapColumn } from "./api/roadmapAdmin.api";
import styles from "./AdminRoadmapPage.module.css";

const COLUMNS: RoadmapColumn[] = ["shipped", "building", "planned"];

type ModalState = { item: AdminRoadmapItem | null; column: RoadmapColumn };

/**
 * The real Shipped/Building/Planned kanban editor (`/admin/roadmap`, Board
 * tab) — replaces Task 6's read-only placeholder. Each column lists its
 * items sorted by `sortOrder` as an `AdminRoadmapItemRow`, with an "Add
 * item" button that opens `AdminRoadmapItemModal` pre-set to that column.
 * Reordering swaps `sortOrder` between adjacent items in the same column;
 * deleting goes through a shared confirm dialog (one instance for the whole
 * board, matching `AdminOrgTiersPage`'s convention) so every row doesn't
 * mount its own.
 */
export function AdminRoadmapBoard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { items } = useAdminRoadmap();
  const { updateItem, deleteItem } = useAdminRoadmapMutations();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoadmapItem | null>(
    null,
  );

  function columnItemsOf(column: RoadmapColumn): AdminRoadmapItem[] {
    return items
      .filter((item) => item.column === column)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function moveItem(column: RoadmapColumn, item: AdminRoadmapItem, delta: 1 | -1) {
    const columnItems = columnItemsOf(column);
    const index = columnItems.findIndex((candidate) => candidate.id === item.id);
    const neighbor = columnItems[index + delta];
    if (!neighbor) return;
    const onError = (error: Error) =>
      showToast(describeError("Couldn't reorder that item", error), "error");
    updateItem({ id: item.id, body: { sortOrder: neighbor.sortOrder } }, { onError });
    updateItem({ id: neighbor.id, body: { sortOrder: item.sortOrder } }, { onError });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteItem(deleteTarget.id, {
      onSuccess: () =>
        showToast(t("admin:roadmap.board.toast.removed", { name }), "info"),
      onError: (error) =>
        showToast(describeError("Couldn't remove that item", error), "error"),
    });
    setDeleteTarget(null);
  }

  return (
    <div className={styles.board}>
      {COLUMNS.map((column) => {
        const columnItems = columnItemsOf(column);
        return (
          <div key={column} className={styles.boardColumn}>
            <h2 className={styles.boardColumnTitle}>
              {t(`admin:roadmap.board.column.${column}`)}
              <span className={styles.boardColumnCount}>{columnItems.length}</span>
            </h2>

            {columnItems.length === 0 ? (
              <p className={styles.empty}>{t("admin:roadmap.board.empty")}</p>
            ) : (
              <ul className={styles.boardList}>
                {columnItems.map((item, index) => (
                  <AdminRoadmapItemRow
                    key={item.id}
                    item={item}
                    canMoveUp={index > 0}
                    canMoveDown={index < columnItems.length - 1}
                    onEdit={() => setModalState({ item, column })}
                    onDelete={() => setDeleteTarget(item)}
                    onMoveUp={() => moveItem(column, item, -1)}
                    onMoveDown={() => moveItem(column, item, 1)}
                  />
                ))}
              </ul>
            )}

            <Button
              variant="ghost"
              size="md"
              className={styles.addItemBtn}
              onClick={() => setModalState({ item: null, column })}
            >
              {t("admin:roadmap.board.addItemCta")}
            </Button>
          </div>
        );
      })}

      {modalState && (
        <AdminRoadmapItemModal
          item={modalState.item}
          initialColumn={modalState.column}
          onClose={() => setModalState(null)}
        />
      )}

      {deleteTarget && (
        <AdminModal
          title={t("admin:roadmap.board.delete.title", { name: deleteTarget.name })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("admin:roadmap.board.delete.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.deleteConfirmBody}>
            {t("admin:roadmap.board.delete.body")}
          </p>
        </AdminModal>
      )}
    </div>
  );
}
