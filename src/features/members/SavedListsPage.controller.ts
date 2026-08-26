import { useMemo, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { dtoToSavedItem } from "./api/saved.api";
import type { SavedListDTO } from "./api/SavedLists.api";
import {
  useMySavedLists,
  useSavedListItems,
  useSavedListMutations,
} from "./api/SavedLists.queries";
import { useSavedListActions } from "./SavedListActions";

export type SavedListsModalState =
  | { type: "new" }
  | { type: "detail"; listId: string }
  | { type: "file"; item: SavedItem }
  | null;

/** A card's supporting line: how many things are in it, and when it last moved. */
export function savedListMeta(
  list: SavedListDTO,
  t: ReturnType<typeof useTranslation>["t"],
  formatters: ReturnType<typeof useFormat>,
): string {
  return t("members:savedLists.card.meta", {
    count: list.itemCount,
    time: formatRelative(list.updatedAt, formatters),
  });
}

/**
 * All state and handlers for the saved-lists page, dual-mode.
 *
 * This is the collections page repointed. Collections and saved lists were two
 * answers to the same question and only one of them can be shared, so the UI
 * reads and writes `/me/saved/lists` now. Three things change for the member:
 * their default list holds everything they ever saved, one thing can sit in
 * several lists at once, and a list can carry a link they can revoke.
 *
 * Demo mode is served by the same hooks: `SavedLists.queries.ts` branches
 * internally and writes demo mutations into the query cache, so nothing above
 * this line has to know which mode it is in.
 */
export function useSavedListsController() {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { items: savedItems } = useSaved();

  const [modal, setModal] = useState<SavedListsModalState>(null);

  const listsQuery = useMySavedLists();
  const mutations = useSavedListMutations();

  const openListId = modal?.type === "detail" ? modal.listId : null;
  const openListItemsQuery = useSavedListItems(openListId);

  const lists = useMemo(() => listsQuery.data ?? [], [listsQuery.data]);
  const openList = useMemo(
    () => lists.find((list) => list.id === openListId) ?? null,
    [lists, openListId],
  );

  /** The lists a member can file something INTO. The default list is excluded:
   *  everything saved is already in it, so offering it as a destination would
   *  be offering a no-op. */
  const fileableLists = useMemo(
    () => lists.filter((list) => !list.isDefault),
    [lists],
  );

  const openListItems = useMemo<SavedItem[]>(
    () => (openListItemsQuery.data ?? []).map(dtoToSavedItem),
    [openListItemsQuery.data],
  );

  const actions = useSavedListActions({
    t,
    showToast,
    mutations,
    closeModal: () => setModal(null),
  });

  /** The member's most recent saves, offered for filing. Deliberately NOT
   *  filtered to "not in any list": answering that live would mean reading
   *  every list's contents, and a thing worth filing twice is common enough
   *  that hiding it would be wrong anyway. */
  const recentSaves = useMemo(() => savedItems.slice(0, 6), [savedItems]);

  return {
    demoMode,
    lists,
    fileableLists,
    isLoading: listsQuery.isLoading,
    recentSaves,
    modal,
    setModal,
    openList,
    openListItems,
    areOpenListItemsLoading: openListItemsQuery.isLoading,
    metaFor: (list: SavedListDTO) => savedListMeta(list, t, formatters),
    isSharing: mutations.share.isPending,
    isRevoking: mutations.unshare.isPending,
    isRenaming: mutations.rename.isPending,
    isDeleting: mutations.remove.isPending,
    ...actions,
  };
}
