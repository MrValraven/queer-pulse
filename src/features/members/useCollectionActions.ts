import type { Dispatch, SetStateAction } from "react";
import type { useToast } from "../../shared/components/feedback/useToast";
import type { useTranslation } from "../../shared/i18n/useTranslation";
import type { SavedItem } from "../../app/providers/useSaved";
import type { useCollectionMutations } from "./api/useCollections";
import type { Collection, Privacy, RecentSave } from "./collections.data";

interface UseCollectionActionsParams {
  demoMode: boolean;
  t: ReturnType<typeof useTranslation>["t"];
  showToast: ReturnType<typeof useToast>["showToast"];
  savedItems: SavedItem[];
  mutations: Pick<
    ReturnType<typeof useCollectionMutations>,
    "create" | "rename" | "remove" | "addItem" | "removeItem"
  >;
  setLocalCollections: Dispatch<SetStateAction<Collection[]>>;
  setContents: Dispatch<SetStateAction<Record<string, SavedItem[]>>>;
  setDemoFiledRefs: Dispatch<SetStateAction<Set<string>>>;
  setModal: (modal: null) => void;
}

/**
 * The Collections page's write handlers (create/file/unfile/rename/delete),
 * dual-mode. Split out of `useCollectionsController` to keep that hook under
 * the repo's 200-line rule — this owns the mutation call + demo-simulation
 * branch for each action, the controller owns state shape and derived reads.
 */
export function useCollectionActions({
  demoMode,
  t,
  showToast,
  savedItems,
  mutations,
  setLocalCollections,
  setContents,
  setDemoFiledRefs,
  setModal,
}: UseCollectionActionsParams) {
  const { create, rename, remove, addItem, removeItem } = mutations;

  const createCollection = (name: string, privacy: Privacy) => {
    if (!demoMode) {
      // The backend has no privacy concept: collections are owner-private, and
      // `CreateCollectionBody` carries no visibility field. `NewCollectionModal`
      // therefore hides its Private/Shared/Public select outside demo mode
      // rather than offering a choice this would then throw away, so `privacy`
      // is always the "private" default on this branch.
      create.mutate(
        { name },
        {
          onSuccess: () => {
            setModal(null);
            showToast(t("members:collections.toast.created"), "success");
          },
          onError: () =>
            showToast(t("members:collections.toast.createError"), "error"),
        },
      );
      return;
    }
    setLocalCollections((prev) => [
      {
        id: `c-${Date.now()}`,
        count: "0",
        name,
        plainName: name,
        meta: t("members:collections.newCollection.defaultMeta"),
        thumbs: ["a", "b", "c"],
        more: "",
        privacy,
        updated: t("members:collections.updatedJustNow"),
      },
      ...prev,
    ]);
    setModal(null);
    showToast(t("members:collections.toast.created"), "success");
  };

  /**
   * File a recent save into a collection. Returns a promise the picker awaits:
   * it only swaps to its "Added to X" panel once the write has actually landed,
   * so a failed POST (network, 409, 404) keeps the picker open with a toast
   * instead of showing a success screen for something that never happened.
   * Rejects on failure after toasting, so the caller can stay put.
   */
  const addSaveToCollection = async (
    collectionId: string,
    save: RecentSave,
  ): Promise<void> => {
    if (!demoMode) {
      // `save.id` is the real saved-item ref (`<kind>:<subjectId>`).
      try {
        await addItem.mutateAsync({ id: collectionId, ref: save.id });
      } catch (error) {
        showToast(t("members:collections.toast.addError"), "error");
        throw error;
      }
      return;
    }
    const item: SavedItem = {
      id: `recent:${save.id}`,
      kind: "article",
      title: save.title,
      meta: save.saved,
    };
    setContents((prev) => {
      const existing = prev[collectionId] ?? savedItems.slice(0, 3);
      if (existing.some((entry) => entry.id === item.id)) return prev;
      return { ...prev, [collectionId]: [item, ...existing] };
    });
    setDemoFiledRefs((prev) => new Set(prev).add(save.id));
    setLocalCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              count: String((Number(collection.count) || 0) + 1),
              updated: t("members:collections.updatedJustNow"),
            }
          : collection,
      ),
    );
  };

  const removeSaveFromCollection = (collectionId: string, ref: string) => {
    removeItem.mutate(
      { id: collectionId, ref },
      {
        onSuccess: () =>
          showToast(t("members:collections.toast.removed"), "success"),
        onError: () =>
          showToast(t("members:collections.toast.removeError"), "error"),
      },
    );
  };

  /** Rename a collection. Live writes `PATCH /me/collections/:id`; demo edits
   *  the local grid so the prototype behaves the same way. Resolves once the
   *  new name is in place, so the caller can leave its rename field. */
  const renameCollection = async (
    collectionId: string,
    nextName: string,
  ): Promise<void> => {
    const trimmedName = nextName.trim();
    if (trimmedName.length === 0) return;
    if (!demoMode) {
      try {
        await rename.mutateAsync({
          id: collectionId,
          body: { name: trimmedName },
        });
      } catch (error) {
        showToast(t("members:collections.toast.renameError"), "error");
        throw error;
      }
      showToast(t("members:collections.toast.renamed"), "success");
      return;
    }
    setLocalCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              name: trimmedName,
              plainName: trimmedName,
              updated: t("members:collections.updatedJustNow"),
            }
          : collection,
      ),
    );
    showToast(t("members:collections.toast.renamed"), "success");
  };

  /** Delete a collection (its filed items cascade server-side; the saved items
   *  themselves are untouched). Closes the open modal on success. */
  const deleteCollection = async (collectionId: string): Promise<void> => {
    if (!demoMode) {
      try {
        await remove.mutateAsync(collectionId);
      } catch (error) {
        showToast(t("members:collections.toast.deleteError"), "error");
        throw error;
      }
      setModal(null);
      showToast(t("members:collections.toast.deleted"), "success");
      return;
    }
    setLocalCollections((prev) =>
      prev.filter((collection) => collection.id !== collectionId),
    );
    setContents((prev) => {
      const next = { ...prev };
      delete next[collectionId];
      return next;
    });
    setModal(null);
    showToast(t("members:collections.toast.deleted"), "success");
  };

  return {
    createCollection,
    addSaveToCollection,
    removeSaveFromCollection,
    renameCollection,
    deleteCollection,
  };
}
