import type { Dispatch, SetStateAction } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { describeError } from "../../../../shared/api/errorMessage";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapItemDTO,
  RoadmapItemUpdateBody,
  RoadmapItemWriteBody,
} from "../../api/roadmapAdmin.types";
import type { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import { useRoadmapModals } from "../state/useRoadmapModals";

type Mutations = ReturnType<typeof useAdminRoadmapMutations>;

/**
 * Every write path the drawer's body/footer trigger, factored out of
 * `ItemDrawerBody.tsx` purely so that component stays readable — this is
 * the "what happens on save/publish/archive/delete/field-edit" half, split
 * from the "what renders" half. Create mode accumulates a local `draft` and
 * only calls `createItem` once, on Save; edit mode writes every change
 * straight through `updateItem`. `targetQuarter` and turning `isPublic` on
 * while safety-gated are special-cased to open a modal instead of writing —
 * see the field grid's/`VisibilitySafetySection`'s own doc comments for why.
 */
export function useItemDrawerHandlers({
  isCreate,
  draft,
  setDraft,
  editItem,
  close,
  createItem,
  updateItem,
  deleteItem,
  archiveItem,
}: {
  isCreate: boolean;
  draft: RoadmapItemWriteBody;
  setDraft: Dispatch<SetStateAction<RoadmapItemWriteBody>>;
  editItem: AdminRoadmapItemDTO | null;
  close: () => void;
  createItem: Mutations["createItem"];
  updateItem: Mutations["updateItem"];
  deleteItem: Mutations["deleteItem"];
  archiveItem: Mutations["archiveItem"];
}) {
  const modals = useRoadmapModals();
  const { showToast } = useToast();
  const { t } = useTranslation();

  function handleFieldChange(patch: RoadmapItemUpdateBody) {
    const { slipReason: _slipReason, ...fields } = patch;
    if (isCreate) {
      setDraft((previous) => ({ ...previous, ...fields }));
      return;
    }
    if (!editItem) return;
    updateItem(
      { id: editItem.id, body: fields },
      {
        onError: (error) =>
          showToast(describeError("Couldn't save that change", error), "error"),
      },
    );
  }

  function handleTargetQuarterChange(nextQuarter: string | null) {
    if (isCreate) {
      setDraft((previous) => ({ ...previous, targetQuarter: nextQuarter }));
      return;
    }
    if (!editItem) return;
    // Mirrors the server's slip guard exactly (`roadmap-admin.service.ts`):
    // a `targetQuarter` change only needs a reason while the item hasn't
    // shipped. A shipped item's target date is historical record, not a
    // live promise, so it writes straight through — routing it into the
    // slip modal would demand a reason the backend doesn't require and
    // reject the write with nothing to show for it.
    if (editItem.column === "shipped") {
      updateItem(
        { id: editItem.id, body: { targetQuarter: nextQuarter } },
        {
          onError: (error) =>
            showToast(
              describeError("Couldn't update the target date", error),
              "error",
            ),
        },
      );
      return;
    }
    modals.open("slip", {
      itemId: editItem.id,
      from: editItem.targetQuarter ?? undefined,
      to: nextQuarter ?? undefined,
    });
  }

  function handlePublicToggle(nextPublic: boolean) {
    if (isCreate) {
      setDraft((previous) => ({ ...previous, isPublic: nextPublic }));
      return;
    }
    if (!editItem) return;
    if (nextPublic && editItem.safetyStatus === 1) {
      modals.open("safety", { itemId: editItem.id });
      return;
    }
    updateItem(
      { id: editItem.id, body: { isPublic: nextPublic } },
      {
        onSuccess: () =>
          showToast(
            t(
              nextPublic
                ? "admin:roadmap.toasts.published"
                : "admin:roadmap.toasts.hidden",
            ),
            "success",
          ),
        onError: (error) =>
          showToast(describeError("Couldn't update visibility", error), "error"),
      },
    );
  }

  function handleSave() {
    if (isCreate) {
      createItem(draft, {
        onSuccess: () => {
          showToast(t("admin:roadmap.toasts.saved"), "success");
          close();
        },
        onError: (error) =>
          showToast(describeError("Couldn't create that item", error), "error"),
      });
      return;
    }
    // Edit mode: every field already autosaves via `handleFieldChange` on
    // change, so there's nothing left to persist here — the footer button
    // is just "I'm done editing." It must NOT force `isPublic: true`: that
    // used to silently publish an item the admin left intentionally
    // unpublished on their way out. Publishing stays the explicit
    // Visibility toggle (`handlePublicToggle`), which already routes
    // through the safety gate — so a plain close, no forced write and no
    // "published" toast that would misrepresent what happened.
    close();
  }

  function handleArchive() {
    if (!editItem) return;
    archiveItem(
      { id: editItem.id, archived: true },
      {
        onSuccess: () => {
          showToast(
            t("admin:roadmap.toasts.archived", { name: editItem.name }),
            "success",
          );
          close();
        },
        onError: (error) =>
          showToast(describeError("Couldn't archive that item", error), "error"),
      },
    );
  }

  function handleDelete() {
    if (!editItem) return;
    const name = editItem.name;
    deleteItem(editItem.id, {
      onSuccess: () => {
        showToast(t("admin:roadmap.toasts.deleted", { name }), "success");
        close();
      },
      onError: (error) =>
        showToast(describeError("Couldn't delete that item", error), "error"),
    });
  }

  return {
    handleFieldChange,
    handleTargetQuarterChange,
    handlePublicToggle,
    handleSave,
    handleArchive,
    handleDelete,
    modals,
  };
}
