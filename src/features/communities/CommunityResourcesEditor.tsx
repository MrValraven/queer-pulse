import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { ShelfResource } from "./api/useCommunityResources";
import {
  useCreateCommunityResource,
  useDeleteCommunityResource,
  useReorderCommunityResources,
  useUpdateCommunityResource,
} from "./api/useCommunityResources";
import {
  CommunityResourceFormModal,
  type CommunityResourceDraft,
} from "./CommunityResourceFormModal";
import { CommunityResourceRow } from "./CommunityResourceRow";
import { useResourceShelfOrder } from "./useResourceShelfOrder";
import styles from "./CommunityResources.module.css";

/** Which form is open: nothing, a new entry, or one existing row. */
type EditorForm = { mode: "add" } | { mode: "edit"; resource: ShelfResource };

/**
 * The staff editor for a community's resource shelf: add, edit, remove and
 * reorder.
 *
 * Reordering is the house pointer-capture slot-swap plus motion `layout`
 * (`useResourceShelfOrder` → `useRowDragReorder`), with move up / move down
 * buttons on every row as the keyboard and assistive-tech path. A drag was
 * chosen over arrows alone because the shelf can hold up to fifty rows, where
 * moving one entry to the top would otherwise be dozens of clicks.
 *
 * The add control disables itself at `maxResources` and says why, so nobody
 * discovers the ceiling through a refused request.
 */
export function CommunityResourcesEditor({
  slug,
  resources,
  maxResources,
}: {
  slug: string;
  resources: ShelfResource[];
  /** The server's per-community cap, or null when it did not report one. */
  maxResources: number | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const createResource = useCreateCommunityResource(slug);
  const updateResource = useUpdateCommunityResource(slug);
  const deleteResource = useDeleteCommunityResource(slug);
  const reorderResources = useReorderCommunityResources(slug);
  const [openForm, setOpenForm] = useState<EditorForm | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<ShelfResource | null>(
    null,
  );

  const onWriteError = () =>
    showToast(t("communities:detail.resources.editor.errorToast"), "error");

  // Destructured rather than kept as one object: the ref must not be reached
  // through a property access during render (`react-hooks/refs`).
  const { orderedResources, containerRef, draggingIndex, gripHandlers, moveBy } =
    useResourceShelfOrder(resources, (resourceIds) =>
      reorderResources.mutate(resourceIds, { onError: onWriteError }),
    );

  const isBusy =
    createResource.isPending ||
    updateResource.isPending ||
    deleteResource.isPending ||
    reorderResources.isPending;
  const isAtCap = maxResources != null && resources.length >= maxResources;

  const saveForm = (draft: CommunityResourceDraft) => {
    const payload = {
      title: draft.title,
      url: draft.url,
      note: draft.note,
      kind: draft.kind,
    };
    const onSuccess = () => {
      setOpenForm(null);
      showToast(
        t(
          openForm?.mode === "edit"
            ? "communities:detail.resources.editor.savedToast"
            : "communities:detail.resources.editor.addedToast",
        ),
        "success",
      );
    };
    if (openForm?.mode === "edit" && openForm.resource.id) {
      updateResource.mutate(
        { id: openForm.resource.id, dto: payload },
        { onSuccess, onError: onWriteError },
      );
      return;
    }
    createResource.mutate(payload, { onSuccess, onError: onWriteError });
  };

  const confirmRemoval = () => {
    if (!pendingRemoval?.id) return;
    deleteResource.mutate(pendingRemoval.id, {
      onSuccess: () => {
        setPendingRemoval(null);
        showToast(
          t("communities:detail.resources.editor.removedToast"),
          "success",
        );
      },
      onError: onWriteError,
    });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.list} ref={containerRef}>
        {orderedResources.map((resource, index) => (
          <CommunityResourceRow
            key={resource.id ?? resource.title}
            resource={resource}
            isFirst={index === 0}
            isLast={index === orderedResources.length - 1}
            isDragging={draggingIndex === index}
            isBusy={isBusy}
            gripHandlers={gripHandlers(index)}
            onMoveUp={() => moveBy(index, -1)}
            onMoveDown={() => moveBy(index, 1)}
            onEdit={() => setOpenForm({ mode: "edit", resource })}
            onRemove={() => setPendingRemoval(resource)}
          />
        ))}
      </div>

      <div className={styles.addRow}>
        <Button
          variant="ghost"
          size="sm"
          disabled={isAtCap || isBusy}
          onClick={() => setOpenForm({ mode: "add" })}
        >
          <FiPlus aria-hidden />
          {t("communities:detail.resources.editor.addCta")}
        </Button>
        {isAtCap && maxResources != null && (
          <p className={styles.capNote}>
            {t("communities:detail.resources.editor.capReached", {
              max: format.number(maxResources),
            })}
          </p>
        )}
      </div>

      {openForm && (
        <CommunityResourceFormModal
          isSaving={createResource.isPending || updateResource.isPending}
          onSave={saveForm}
          onClose={() => setOpenForm(null)}
          {...(openForm.mode === "edit"
            ? {
                initial: {
                  title: openForm.resource.title,
                  url: openForm.resource.href,
                  note: openForm.resource.note ?? "",
                  kind: openForm.resource.kind,
                },
              }
            : {})}
        />
      )}

      <ConfirmDialog
        open={pendingRemoval != null}
        onClose={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
        tone="destructive"
        loading={deleteResource.isPending}
        title={t("communities:detail.resources.editor.removeConfirmTitle", {
          title: pendingRemoval?.title ?? "",
        })}
        description={t(
          "communities:detail.resources.editor.removeConfirmBody",
        )}
        confirmLabel={t("communities:detail.resources.editor.removeConfirmCta")}
      />
    </div>
  );
}
