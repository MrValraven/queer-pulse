import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  DEMO_SAVED_LISTS,
  DEMO_SAVED_LIST_ITEMS,
  demoSharedSavedList,
} from "../SavedLists.data";
import type { SavedItemBody, SavedItemDTO } from "./saved.api";
import {
  addItemToSavedList,
  createSavedList,
  deleteSavedList,
  getSavedListItems,
  getSavedLists,
  getSharedSavedList,
  removeItemFromSavedList,
  renameSavedList,
  shareSavedList,
  unshareSavedList,
  type SavedListDTO,
  type SharedSavedListDTO,
} from "./SavedLists.api";

/**
 * Query-key factory for saved lists. One place owns the shape so the list
 * query and every mutation's invalidation stay in lockstep, and `demoMode` is
 * baked into the root key so a demo/live toggle never serves cross-mode cache.
 */
export const savedListsKeys = {
  all: (demoMode: boolean) => ["saved-lists", demoMode] as const,
  list: (demoMode: boolean) =>
    [...savedListsKeys.all(demoMode), "list"] as const,
  items: (demoMode: boolean, listId: string) =>
    [...savedListsKeys.all(demoMode), "items", listId] as const,
  shared: (demoMode: boolean, token: string) =>
    [...savedListsKeys.all(demoMode), "shared", token] as const,
};

/** A demo token that reads like the real 64-hex one the backend mints, so the
 *  demo share panel shows a link of the right shape. */
function demoShareToken(): string {
  let token = "";
  for (let index = 0; index < 64; index += 1) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
}

/** The member's saved lists (`GET /me/saved/lists`), default list first. */
export function useMySavedLists() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<SavedListDTO[]>({
    queryKey: savedListsKeys.list(demoMode),
    enabled: demoMode || loggedIn,
    // In demo mode the cache IS the store: the mutations below write straight
    // into it, so a refetch would undo whatever the visitor just did.
    staleTime: demoMode ? Infinity : undefined,
    queryFn: () =>
      demoMode ? Promise.resolve(DEMO_SAVED_LISTS) : getSavedLists(),
  });
}

/** The items filed in one list (`GET /me/saved?listId=`), fetched when a list
 *  is opened. Gated on `listId` so nothing fires until one is. */
export function useSavedListItems(listId: string | null) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<SavedItemDTO[]>({
    queryKey: savedListsKeys.items(demoMode, listId ?? ""),
    enabled: (demoMode || loggedIn) && Boolean(listId),
    staleTime: demoMode ? Infinity : undefined,
    queryFn: () => {
      if (!listId) return Promise.reject(new Error("no list id"));
      if (demoMode) {
        return Promise.resolve(DEMO_SAVED_LIST_ITEMS[listId] ?? []);
      }
      return getSavedListItems(listId).then((page) => page.items);
    },
  });
}

/**
 * The read behind a share link (`GET /saved-lists/:token`).
 *
 * `retry: false` because every failure this endpoint produces is definitive:
 * revoked, malformed and never-real all answer the same 404 on purpose, and
 * re-asking a definitive answer only makes the reader wait.
 */
export function useSharedSavedList(token: string | undefined) {
  const { demoMode } = useDemoMode();

  return useQuery<SharedSavedListDTO>({
    queryKey: savedListsKeys.shared(demoMode, token ?? ""),
    enabled: Boolean(token),
    retry: false,
    queryFn: () => {
      if (!token) return Promise.reject(new Error("no token"));
      if (demoMode) {
        const shared = demoSharedSavedList(token);
        return shared
          ? Promise.resolve(shared)
          : Promise.reject(new Error("This list is not available"));
      }
      return getSharedSavedList(token);
    },
  });
}

/**
 * Create, rename, delete, share, revoke, and file/unfile items. Live mutations
 * invalidate through the shared key factory so the grid re-reads server truth.
 * Demo mutations write the same shapes straight into the cache, so the
 * prototype behaves identically without a backend.
 */
export function useSavedListMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const listKey = savedListsKeys.list(demoMode);

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: listKey });

  /** Write a list the server just returned back over its cached copy. */
  const applyServerList = (list: SavedListDTO | null) => {
    if (!list) return;
    queryClient.setQueryData<SavedListDTO[]>(listKey, (previous) =>
      (previous ?? []).map((cached) => (cached.id === list.id ? list : cached)),
    );
  };

  const patchDemoList = (
    listId: string,
    patch: (list: SavedListDTO) => SavedListDTO,
  ) =>
    queryClient.setQueryData<SavedListDTO[]>(listKey, (previous) =>
      (previous ?? []).map((list) => (list.id === listId ? patch(list) : list)),
    );

  const create = useMutation({
    mutationFn: (name: string) => {
      if (!demoMode) return createSavedList(name);
      const now = new Date().toISOString();
      const created: SavedListDTO = {
        id: `demo-list-${now}`,
        name,
        isDefault: false,
        itemCount: 0,
        isShared: false,
        shareToken: null,
        sharedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<SavedListDTO[]>(listKey, (previous) => {
        const lists = previous ?? [];
        const defaultLists = lists.filter((list) => list.isDefault);
        const namedLists = lists.filter((list) => !list.isDefault);
        return [...defaultLists, created, ...namedLists];
      });
      return Promise.resolve(created);
    },
    onSuccess: () => {
      if (!demoMode) void invalidateList();
    },
  });

  const rename = useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) => {
      if (!demoMode) return renameSavedList(listId, name);
      patchDemoList(listId, (list) => ({
        ...list,
        name,
        updatedAt: new Date().toISOString(),
      }));
      return Promise.resolve(null);
    },
    onSuccess: () => {
      if (!demoMode) void invalidateList();
    },
  });

  const remove = useMutation({
    mutationFn: (listId: string) => {
      if (!demoMode) return deleteSavedList(listId);
      queryClient.setQueryData<SavedListDTO[]>(listKey, (previous) =>
        (previous ?? []).filter((list) => list.id !== listId),
      );
      return Promise.resolve();
    },
    onSuccess: () => {
      if (!demoMode) void invalidateList();
    },
  });

  const share = useMutation({
    mutationFn: (listId: string) => {
      if (!demoMode) return shareSavedList(listId);
      const now = new Date().toISOString();
      const token = demoShareToken();
      patchDemoList(listId, (list) => ({
        ...list,
        isShared: true,
        shareToken: list.shareToken ?? token,
        sharedAt: list.sharedAt ?? now,
      }));
      return Promise.resolve(null);
    },
    // The token comes back on the write itself, so the panel can show the link
    // the instant the member asks for it rather than after a round trip.
    onSuccess: (result) => {
      if (demoMode) return;
      applyServerList(result);
      void invalidateList();
    },
  });

  const unshare = useMutation({
    mutationFn: (listId: string) => {
      if (!demoMode) return unshareSavedList(listId);
      patchDemoList(listId, (list) => ({
        ...list,
        isShared: false,
        shareToken: null,
        sharedAt: null,
      }));
      return Promise.resolve(null);
    },
    // Revoking has to read as immediate: patch the cache with the now-private
    // list before the refetch, so the link disappears on the click.
    onSuccess: (result) => {
      if (demoMode) return;
      applyServerList(result);
      void invalidateList();
    },
  });

  const invalidateItems = (listId: string) =>
    queryClient.invalidateQueries({
      queryKey: savedListsKeys.items(demoMode, listId),
    });

  const addItem = useMutation({
    mutationFn: ({
      listId,
      ref,
      body,
    }: {
      listId: string;
      ref: string;
      body: SavedItemBody;
    }) => {
      if (!demoMode) return addItemToSavedList(listId, ref, body);
      patchDemoList(listId, (list) => ({
        ...list,
        itemCount: list.itemCount + 1,
        updatedAt: new Date().toISOString(),
      }));
      return Promise.resolve();
    },
    onSuccess: (_result, { listId }) => {
      if (demoMode) return;
      void invalidateList();
      void invalidateItems(listId);
    },
  });

  const removeItem = useMutation({
    mutationFn: ({ listId, ref }: { listId: string; ref: string }) => {
      if (!demoMode) return removeItemFromSavedList(listId, ref);
      patchDemoList(listId, (list) => ({
        ...list,
        itemCount: Math.max(0, list.itemCount - 1),
        updatedAt: new Date().toISOString(),
      }));
      return Promise.resolve();
    },
    onSuccess: (_result, { listId }) => {
      if (demoMode) return;
      void invalidateList();
      void invalidateItems(listId);
    },
  });

  return { create, rename, remove, share, unshare, addItem, removeItem };
}
