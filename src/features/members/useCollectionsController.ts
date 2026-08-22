import { useMemo, useState } from "react";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { dtoToSavedItem } from "./api/saved.api";
import {
  useMyCollections,
  useCollectionDetail,
  useCollectionMutations,
  useFiledRefs,
} from "./api/useCollections";
import type { CollectionDTO } from "./api/collections.api";
import {
  COLLECTIONS,
  RECENT_SAVES,
  type Collection,
  type Privacy,
  type RecentSave,
} from "./collections.data";

export type ModalState =
  | { type: "new" }
  | { type: "view"; id: string }
  | { type: "add"; save: RecentSave }
  | null;

/** Map a server collection into the display shape the grid card expects. Live
 *  collections are owner-private (backend has no privacy/thumb concept), so
 *  privacy is always "private" and thumbs are empty. */
function toDisplay(
  dto: CollectionDTO,
  t: ReturnType<typeof useTranslation>["t"],
  fmt: ReturnType<typeof useFormat>,
): Collection {
  return {
    id: dto.id,
    count: String(dto.itemCount),
    name: dto.emoji ? `${dto.emoji} ${dto.name}` : dto.name,
    plainName: dto.name,
    meta: t("members:collections.live.itemCount", { count: dto.itemCount }),
    thumbs: [],
    more: "",
    privacy: "private",
    updated: t("members:collections.live.updated", {
      time: formatRelative(dto.updatedAt, fmt),
    }),
  };
}

/**
 * All state + handlers for the Collections page, dual-mode. Demo mode runs the
 * seeded grid and simulates create/add locally; live mode reads/writes
 * `/me/collections` through react-query (`useCollections`). Keeping this out of
 * the component keeps the render function under the repo's 200-line rule.
 */
export function useCollectionsController() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { items: savedItems } = useSaved();
  const simulatedLoad = useSimulatedLoad();

  const [modal, setModal] = useState<ModalState>(null);

  // Live data — both hooks are demo-gated internally, so demo mode never fires
  // them and the local state below runs the show instead.
  const liveCollectionsQuery = useMyCollections();
  const { create, rename, remove, addItem, removeItem } =
    useCollectionMutations();
  const liveDetailQuery = useCollectionDetail(
    !demoMode && modal?.type === "view" ? modal.id : null,
  );
  const filedRefsQuery = useFiledRefs();

  // Demo state: seeded grid + local "add" simulation (no persistence).
  const [localCollections, setLocalCollections] = useState<Collection[]>(
    demoMode ? COLLECTIONS : [],
  );
  const [contents, setContents] = useState<Record<string, SavedItem[]>>({});
  const [demoFiledRefs, setDemoFiledRefs] = useState<Set<string>>(new Set());

  const liveCollections = useMemo<Collection[]>(
    () => (liveCollectionsQuery.data ?? []).map((dto) => toDisplay(dto, t, fmt)),
    [liveCollectionsQuery.data, t, fmt],
  );

  const collections = demoMode ? localCollections : liveCollections;
  const loading = demoMode ? simulatedLoad : liveCollectionsQuery.isLoading;

  // Recent unfiled saves: demo fiction, or the member's real saved store live,
  // minus anything already filed into a collection — each row's `id` carries
  // the true `<kind>:<subjectId>` ref so it can be filed.
  const filedRefs = useMemo(
    () => new Set(filedRefsQuery.data ?? []),
    [filedRefsQuery.data],
  );
  const liveRecent = useMemo<RecentSave[]>(
    () =>
      savedItems
        .filter((item) => !filedRefs.has(item.id))
        .map((item) => ({
          id: item.id,
          kind: item.kind.slice(0, 3).toUpperCase(),
          kindVariant: "article",
          title: item.title,
          saved: item.meta ?? "",
        })),
    [savedItems, filedRefs],
  );
  const demoRecent = useMemo(
    () => RECENT_SAVES.filter((r) => !demoFiledRefs.has(r.id)),
    [demoFiledRefs],
  );
  const recentSaves = demoMode ? demoRecent : liveRecent;

  const contentsFor = (id: string): SavedItem[] =>
    contents[id] ?? savedItems.slice(0, 3);

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

  const viewing =
    modal?.type === "view"
      ? (collections.find((collection) => collection.id === modal.id) ?? null)
      : null;
  const viewingItems = demoMode
    ? viewing
      ? contentsFor(viewing.id)
      : []
    : (liveDetailQuery.data?.items ?? []).map(dtoToSavedItem);

  return {
    demoMode,
    collections,
    loading,
    recentSaves,
    modal,
    setModal,
    createCollection,
    addSaveToCollection,
    removeSaveFromCollection,
    renameCollection,
    deleteCollection,
    isRenaming: rename.isPending,
    isDeleting: remove.isPending,
    viewing,
    viewingItems,
  };
}
