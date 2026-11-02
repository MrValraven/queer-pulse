import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  directoryPartnerRefusalOf,
  type AdminDirectoryPartnerDTO,
  type DirectoryPartnerRefusalReason,
} from "../../marketing/api/directoryPartners.api";
import { DIRECTORY_PARTNERS_QUERY_ROOT } from "../../marketing/api/useDirectoryPartners";
import { orderedByIds, renumbered } from "../studioAdmin.model";
import {
  addAdminDirectoryPartner,
  removeAdminDirectoryPartner,
  reorderAdminDirectoryPartners,
  updateAdminDirectoryPartnerNote,
} from "./adminDirectoryPartners.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  ADMIN_DIRECTORY_PARTNERS_ROOT,
  adminDirectoryPartnersKey,
} from "./useAdminDirectoryPartners";

/** Each partner dialog shows its own refusal line, so the global toast
 *  stays quiet. */
const SILENT_META = { silentError: true } as const;

/** Refusals that mean the cached list is out of date: another tab removed
 *  the pick, added the listing, or filled the last slot. */
const STALE_LIST_REASONS: ReadonlySet<DirectoryPartnerRefusalReason> = new Set([
  "partner_not_found",
  "already_partner",
  "partner_limit_reached",
]);

function loadDemoStore() {
  return import("../../marketing/directoryPartnersDemoStore");
}

/**
 * The partner list cache. Every write answers with the full new list, which
 * replaces the cached one, and the public row query is invalidated in both
 * modes, so this browser reads the row again. In live the public read sits
 * behind a CDN cache of up to a minute (s-maxage=60), so visitors can see
 * the old row for up to that minute after a change.
 */
function usePartnerListCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const listKey = adminDirectoryPartnersKey(demoMode);
  const read = () =>
    queryClient.getQueryData<AdminDirectoryPartnerDTO[]>(listKey) ?? [];
  const write = (list: AdminDirectoryPartnerDTO[]) =>
    queryClient.setQueryData(listKey, list);
  const saveList = (list: AdminDirectoryPartnerDTO[]) => {
    write(list);
    void queryClient.invalidateQueries({
      queryKey: DIRECTORY_PARTNERS_QUERY_ROOT,
    });
  };
  // Search results carry `isPartner`, so adding or removing a pick makes
  // them stale.
  const refreshSearch = () => {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_DIRECTORY_PARTNERS_ROOT, "search"],
    });
  };
  // An optimistic reorder first stops a read in flight, so its late answer
  // never overwrites the new order.
  const cancelRead = () => queryClient.cancelQueries({ queryKey: listKey });
  // After a refused reorder the rollback shows the old order, then the list
  // is read again in both modes, so a row another tab added or removed while
  // the reorder was in flight shows up.
  const refetchRead = () => {
    void queryClient.invalidateQueries({ queryKey: listKey });
  };
  // A refusal that says the list is out of date reads it again, with the
  // search, so the tab shows what the server holds. Other failures leave the
  // list alone.
  const refetchIfStale = (cause: unknown) => {
    const reason = directoryPartnerRefusalOf(cause);
    if (reason === null || !STALE_LIST_REASONS.has(reason)) return;
    refetchRead();
    refreshSearch();
  };
  return {
    demoMode,
    read,
    write,
    saveList,
    refreshSearch,
    cancelRead,
    refetchRead,
    refetchIfStale,
  };
}

export interface AddDirectoryPartnerVariables {
  listingId: string;
  note: string | null;
}

/** POST /admin/listings/partners: appends a pick at the end of the row. */
export function useAddDirectoryPartner() {
  const { demoMode, saveList, refreshSearch, refetchIfStale } =
    usePartnerListCache();
  return useDemoAwareMutation<
    AdminDirectoryPartnerDTO[],
    Error,
    AddDirectoryPartnerVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    demoResult: async ({ listingId, note }) =>
      (await loadDemoStore()).demoAddDirectoryPartner({ listingId, note }),
    live: ({ listingId, note }) =>
      addAdminDirectoryPartner(
        note === null ? { listingId } : { listingId, note },
      ),
    onError: (cause) => refetchIfStale(cause),
    onSuccess: (list) => {
      saveList(list);
      refreshSearch();
    },
  });
}

export interface UpdateDirectoryPartnerNoteVariables {
  pickId: string;
  note: string | null;
}

/** PATCH /admin/listings/partners/:id: a null note clears it. */
export function useUpdateDirectoryPartnerNote() {
  const { demoMode, saveList, refetchIfStale } = usePartnerListCache();
  return useDemoAwareMutation<
    AdminDirectoryPartnerDTO[],
    Error,
    UpdateDirectoryPartnerNoteVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    demoResult: async ({ pickId, note }) =>
      (await loadDemoStore()).demoUpdateDirectoryPartnerNote(pickId, note),
    live: ({ pickId, note }) =>
      updateAdminDirectoryPartnerNote(pickId, { note }),
    onError: (cause) => refetchIfStale(cause),
    onSuccess: (list) => saveList(list),
  });
}

export interface ReorderDirectoryPartnersVariables {
  ids: string[];
}

export interface ReorderDirectoryPartnersContext {
  previous: AdminDirectoryPartnerDTO[];
}

/** PATCH /admin/listings/partners/order. The row moves at once and rolls
 *  back when the order is refused (`order_mismatch`). */
export function useReorderDirectoryPartners() {
  const { demoMode, read, write, saveList, cancelRead, refetchRead } =
    usePartnerListCache();
  return useDemoAwareMutation<
    AdminDirectoryPartnerDTO[],
    Error,
    ReorderDirectoryPartnersVariables,
    ReorderDirectoryPartnersContext
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    demoResult: async ({ ids }) =>
      (await loadDemoStore()).demoReorderDirectoryPartners(ids),
    live: ({ ids }) => reorderAdminDirectoryPartners({ ids }),
    onMutate: async ({ ids }) => {
      await cancelRead();
      const previous = read();
      write(renumbered(orderedByIds(previous, ids)));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) write(context.previous);
      refetchRead();
    },
    onSuccess: (list) => saveList(list),
  });
}

export interface RemoveDirectoryPartnerVariables {
  pickId: string;
}

/** DELETE /admin/listings/partners/:id: the positions after it close up. */
export function useRemoveDirectoryPartner() {
  const { demoMode, saveList, refreshSearch, refetchIfStale } =
    usePartnerListCache();
  return useDemoAwareMutation<
    AdminDirectoryPartnerDTO[],
    Error,
    RemoveDirectoryPartnerVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    demoResult: async ({ pickId }) =>
      (await loadDemoStore()).demoRemoveDirectoryPartner(pickId),
    live: ({ pickId }) => removeAdminDirectoryPartner(pickId),
    onError: (cause) => refetchIfStale(cause),
    onSuccess: (list) => {
      saveList(list);
      refreshSearch();
    },
  });
}
