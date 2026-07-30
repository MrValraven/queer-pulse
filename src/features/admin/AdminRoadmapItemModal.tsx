import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useAdminRoadmap, useAdminRoadmapMutations } from "./api/useAdminRoadmap";
import {
  AdminRoadmapItemCoreFields,
  AdminRoadmapItemColumnFields,
} from "./AdminRoadmapItemModalFields";
import {
  draftFromRoadmapItem,
  buildRoadmapItemWriteBody,
} from "./adminRoadmapItemForm.utils";
import type { AdminRoadmapItem } from "./adminRoadmap.data";
import type { RoadmapColumn } from "./api/roadmapAdmin.api";
import styles from "./AdminRoadmapPage.module.css";

const FORM_ID = "admin-roadmap-item-form";

/**
 * Create/edit modal for one roadmap item. `item` is null for "New item"
 * (pre-set to `initialColumn`, whichever column's "Add item" button opened
 * it) and the existing item for "Edit". Changing the `column` select lets an
 * edit move a card between Shipped/Building/Planned; on save the write body
 * is scoped to the selected column (`buildRoadmapItemWriteBody`) and
 * `sortOrder` is either kept as-is (same column) or appended to the end of
 * the destination column (create, or a column move).
 */
export function AdminRoadmapItemModal({
  item,
  initialColumn,
  onClose,
}: {
  item: AdminRoadmapItem | null;
  initialColumn: RoadmapColumn;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { items } = useAdminRoadmap();
  const { createItem, updateItem, pending } = useAdminRoadmapMutations();
  const [draft, setDraft] = useState(() =>
    draftFromRoadmapItem(item, initialColumn),
  );
  const isEditing = item !== null;

  function patch(changes: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function nextSortOrder(): number {
    const columnCount = items.filter(
      (candidate) =>
        candidate.column === draft.column &&
        (!item || candidate.id !== item.id),
    ).length;
    // Same column, editing in place: keep this item's own position.
    if (item && item.column === draft.column) return item.sortOrder;
    // New item, or moved into a different column: append to the end.
    return columnCount;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = buildRoadmapItemWriteBody(draft, nextSortOrder());
    const name = draft.name.trim();

    if (item) {
      updateItem(
        { id: item.id, body },
        {
          onSuccess: () => {
            showToast(t("admin:roadmap.board.toast.updated", { name }), "success");
            onClose();
          },
          onError: (error) =>
            showToast(describeError("Couldn't save those changes", error), "error"),
        },
      );
    } else {
      createItem(body, {
        onSuccess: () => {
          showToast(t("admin:roadmap.board.toast.created", { name }), "success");
          onClose();
        },
        onError: (error) =>
          showToast(describeError("Couldn't add that item", error), "error"),
      });
    }
  }

  return (
    <AdminModal
      eyebrow={
        isEditing
          ? t("admin:roadmap.board.modal.editEyebrow")
          : t("admin:roadmap.board.modal.createEyebrow")
      }
      title={
        isEditing
          ? draft.name || t("admin:roadmap.board.modal.editEyebrow")
          : t("admin:roadmap.board.modal.createTitle")
      }
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={pending}>
            {isEditing
              ? t("admin:common.saveChanges")
              : t("admin:roadmap.board.modal.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <AdminRoadmapItemCoreFields draft={draft} onChange={patch} />
        <AdminRoadmapItemColumnFields draft={draft} onChange={patch} />
      </form>
    </AdminModal>
  );
}
