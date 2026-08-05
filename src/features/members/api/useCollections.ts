import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  addCollectionItem,
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  removeCollectionItem,
  updateCollection,
  type CollectionDTO,
  type CollectionDetailDTO,
  type CreateCollectionBody,
  type UpdateCollectionBody,
} from "./collections.api";

/**
 * Query-key factory for the collections resource. One place owns the key shape
 * so the list query and every mutation's invalidation stay in lockstep. `demoMode`
 * is baked into the root key so a demo↔live toggle never serves cross-mode cache.
 */
export const collectionsKeys = {
  all: (demoMode: boolean) => ["collections", demoMode] as const,
  list: (demoMode: boolean) => [...collectionsKeys.all(demoMode), "list"] as const,
  detail: (demoMode: boolean, id: string) =>
    [...collectionsKeys.all(demoMode), "detail", id] as const,
};

/**
 * The member's collections (`GET /me/collections`). Live-only: demo mode keeps
 * its own local-state grid in `CollectionsPage`, so this stays disabled there and
 * never touches the network. Fires on first subscribe once `/auth/me` resolves.
 */
export function useMyCollections() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<CollectionDTO[]>({
    queryKey: collectionsKeys.list(demoMode),
    enabled: !demoMode && loggedIn,
    queryFn: () => (demoMode ? Promise.resolve([]) : getCollections()),
  });
}

/**
 * One collection with its filed items (`GET /me/collections/:id`), fetched lazily
 * when a collection is opened in the view modal. Live-only and gated on `id`.
 */
export function useCollectionDetail(id: string | null) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<CollectionDetailDTO>({
    queryKey: collectionsKeys.detail(demoMode, id ?? ""),
    enabled: !demoMode && loggedIn && !!id,
    queryFn: () =>
      demoMode || !id
        ? Promise.reject(new Error("no id"))
        : getCollection(id),
  });
}

/**
 * Create / rename / delete a collection and add / remove items. Each mutation
 * invalidates the list (and the affected detail) through the shared key factory,
 * so the grid re-reads server truth rather than trusting an optimistic guess.
 */
export function useCollectionMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: collectionsKeys.list(demoMode),
    });

  const create = useMutation({
    mutationFn: (body: CreateCollectionBody) => createCollection(body),
    onSuccess: invalidateList,
  });

  const rename = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCollectionBody }) =>
      updateCollection(id, body),
    onSuccess: invalidateList,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: invalidateList,
  });

  const addItem = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) =>
      addCollectionItem(id, ref),
    onSuccess: (_data, { id }) => {
      void invalidateList();
      void queryClient.invalidateQueries({
        queryKey: collectionsKeys.detail(demoMode, id),
      });
    },
  });

  const removeItem = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) =>
      removeCollectionItem(id, ref),
    onSuccess: (_data, { id }) => {
      void invalidateList();
      void queryClient.invalidateQueries({
        queryKey: collectionsKeys.detail(demoMode, id),
      });
    },
  });

  return { create, rename, remove, addItem, removeItem };
}
