import { useState } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { AdminRoadmapItemDTO, RoadmapColumn } from "../../api/roadmapAdmin.types";

/**
 * Every mutation a Board card's kebab menu can fire, plus the local
 * delete-confirm state (destructive alone gets a confirm step, mirroring
 * `BulkBar`'s own delete gate — reuses its `bulkBar.confirmDelete.*` copy
 * with `count: 1`, since no dedicated singular-delete key exists in the new
 * UI's catalog and those keys already carry an `_one` plural form built for
 * exactly this). One hook so `RoadmapCard` stays about layout/composition,
 * not ~6 mutate calls and their toasts.
 */
export function useRoadmapCardActions(
  item: AdminRoadmapItemDTO,
  maxSortOrderByColumn: Record<RoadmapColumn, number>,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateItem, duplicateItem, archiveItem, deleteItem } =
    useAdminRoadmapMutations();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function moveTo(column: RoadmapColumn) {
    updateItem(
      { id: item.id, body: { column, sortOrder: maxSortOrderByColumn[column] + 10 } },
      {
        onSuccess: () =>
          showToast(
            t("admin:roadmap.toasts.moved", {
              name: item.name,
              column: t(`admin:roadmap.board.column.${column}`),
            }),
            "info",
          ),
        onError: (error) =>
          showToast(
            describeError(
              t("admin:roadmap.board.menu.moveTo", {
                column: t(`admin:roadmap.board.column.${column}`),
              }),
              error,
            ),
            "error",
          ),
      },
    );
  }

  function togglePublic() {
    const nextPublic = !item.isPublic;
    updateItem(
      { id: item.id, body: { isPublic: nextPublic } },
      {
        onSuccess: () =>
          showToast(
            t(nextPublic ? "admin:roadmap.toasts.published" : "admin:roadmap.toasts.hidden"),
            "info",
          ),
        onError: (error) =>
          showToast(
            describeError(
              t(
                nextPublic
                  ? "admin:roadmap.board.menu.showPublic"
                  : "admin:roadmap.board.menu.hidePublic",
              ),
              error,
            ),
            "error",
          ),
      },
    );
  }

  function duplicate() {
    duplicateItem(item.id, {
      onSuccess: () => showToast(t("admin:roadmap.toasts.duplicated"), "info"),
      onError: (error) =>
        showToast(describeError(t("admin:roadmap.board.menu.duplicate"), error), "error"),
    });
  }

  function archive() {
    archiveItem(
      { id: item.id, archived: true },
      {
        onSuccess: () =>
          showToast(t("admin:roadmap.toasts.archived", { name: item.name }), "info"),
        onError: (error) =>
          showToast(describeError(t("admin:roadmap.board.menu.archive"), error), "error"),
      },
    );
  }

  function confirmDelete() {
    setConfirmingDelete(false);
    deleteItem(item.id, {
      onSuccess: () =>
        showToast(t("admin:roadmap.toasts.deleted", { name: item.name }), "info"),
      onError: (error) =>
        showToast(describeError(t("admin:common.delete"), error), "error"),
    });
  }

  return {
    moveTo,
    togglePublic,
    duplicate,
    archive,
    confirmingDelete,
    requestDelete: () => setConfirmingDelete(true),
    cancelDelete: () => setConfirmingDelete(false),
    confirmDelete,
  };
}
