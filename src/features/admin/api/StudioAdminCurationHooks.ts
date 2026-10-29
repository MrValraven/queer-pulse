import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioCurationShelf,
} from "../../studio/api/studio.types";
import {
  isSameIdSet,
  orderedByIds,
  picksOnShelf,
  renumbered,
  shelfMaxOf,
  withShelfPicks,
} from "../studioAdmin.model";
import {
  STUDIO_ADMIN_SILENT_META,
  studioAdminDemoRefusal,
} from "../studioAdminDemoErrors";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  createAdminStudioPick,
  deleteAdminStudioPick,
  getAdminStudioCuration,
  reorderAdminStudioPicks,
  searchAdminStudioReleases,
  updateAdminStudioPick,
  type AdminStudioCurationDTO,
  type AdminStudioPickDTO,
  type AdminStudioReleaseCardDTO,
} from "./studioDiscoveryAdmin.api";

export const ADMIN_STUDIO_KEY = "admin-studio";
export const adminStudioCurationKey = (demoMode: boolean) =>
  [ADMIN_STUDIO_KEY, "curation", demoMode] as const;

const EMPTY_CURATION: AdminStudioCurationDTO = {
  featured: [],
  staffPicks: [],
  newThisWeek: [],
};

export function useAdminStudioCuration() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStudioCurationDTO>({
    queryKey: adminStudioCurationKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async () =>
      demoMode
        ? (await import("../StudioAdmin.data")).demoAdminStudioCuration()
        : getAdminStudioCuration(),
  });
}

/** Published releases by title or artist; a blank query reads the newest
 *  published releases. The caller debounces. */
export function useAdminStudioReleaseSearch(query: string) {
  const { demoMode } = useDemoMode();
  const trimmed = query
    .trim()
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength);
  return useQuery<AdminStudioReleaseCardDTO[]>({
    queryKey: [ADMIN_STUDIO_KEY, "releaseSearch", demoMode, trimmed],
    staleTime: 30_000,
    meta: STUDIO_ADMIN_SILENT_META,
    queryFn: async () =>
      demoMode
        ? (await import("../StudioAdmin.data")).demoAdminReleaseSearch(trimmed)
        : (await searchAdminStudioReleases(trimmed)).items,
  });
}

function useCurationCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<AdminStudioCurationDTO>(
      adminStudioCurationKey(demoMode),
    ) ?? EMPTY_CURATION;
  const write = (curation: AdminStudioCurationDTO) =>
    queryClient.setQueryData(adminStudioCurationKey(demoMode), curation);
  // An optimistic patch first stops a read in flight, so its late answer
  // never overwrites the new order.
  const cancelRead = () =>
    queryClient.cancelQueries({ queryKey: adminStudioCurationKey(demoMode) });
  // After a refused live reorder the rollback shows the old order; the
  // server's own order is fetched again in case another console moved it.
  const refetchRead = () => {
    void queryClient.invalidateQueries({
      queryKey: adminStudioCurationKey(demoMode),
    });
  };
  // Studio home reads the same picks, so a live write refreshes it too.
  const refreshMemberCuration = () => {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_STUDIO_KEY, "curation"],
    });
    void queryClient.invalidateQueries({ queryKey: ["studio", "curation"] });
  };
  return {
    demoMode,
    read,
    write,
    cancelRead,
    refetchRead,
    refreshMemberCuration,
  };
}

export interface AddAdminStudioPickVariables {
  shelf: StudioCurationShelf;
  release: AdminStudioReleaseCardDTO;
  note: string | null;
}

/** POST /admin/studio/curation/picks. Featured replaces the current pick;
 *  the shelves append. */
export function useAddAdminStudioPick() {
  const { demoMode, read, write, refreshMemberCuration } = useCurationCache();
  return useDemoAwareMutation<
    AdminStudioPickDTO,
    Error,
    AddAdminStudioPickVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ shelf, release, note }) => {
      if (release.status !== "published")
        throw studioAdminDemoRefusal(
          "studio_curation_release_not_published",
          422,
        );
      const picks = picksOnShelf(read(), shelf);
      if (picks.some((pick) => pick.release.id === release.id))
        throw studioAdminDemoRefusal("studio_curation_already_on_shelf");
      if (shelf !== "featured" && picks.length >= shelfMaxOf(shelf))
        throw studioAdminDemoRefusal("studio_curation_shelf_full");
      return {
        id: `demo-pick-${shelf}-${release.id}-${Date.now()}`,
        shelf,
        position: shelf === "featured" ? 1 : picks.length + 1,
        note,
        createdAt: new Date().toISOString(),
        isListenable: release.status === "published",
        release,
      };
    },
    live: ({ shelf, release, note }) =>
      createAdminStudioPick({ shelf, releaseId: release.id, note }),
    onSuccess: (pick) => {
      const curation = read();
      const picks =
        pick.shelf === "featured"
          ? [pick]
          : [
              ...picksOnShelf(curation, pick.shelf).filter(
                (existing) => existing.id !== pick.id,
              ),
              pick,
            ];
      write(withShelfPicks(curation, pick.shelf, picks));
    },
    onLiveSuccess: refreshMemberCuration,
  });
}

export interface UpdateAdminStudioPickNoteVariables {
  pick: AdminStudioPickDTO;
  note: string | null;
}

export function useUpdateAdminStudioPickNote() {
  const { demoMode, read, write, refreshMemberCuration } = useCurationCache();
  return useDemoAwareMutation<
    AdminStudioPickDTO,
    Error,
    UpdateAdminStudioPickNoteVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ pick, note }) => ({ ...pick, note }),
    live: ({ pick, note }) => updateAdminStudioPick(pick.id, { note }),
    onSuccess: (saved) => {
      const curation = read();
      write(
        withShelfPicks(
          curation,
          saved.shelf,
          picksOnShelf(curation, saved.shelf).map((pick) =>
            pick.id === saved.id ? saved : pick,
          ),
        ),
      );
    },
    onLiveSuccess: refreshMemberCuration,
  });
}

/** DELETE /admin/studio/curation/picks/:id; the shelf renumbers. */
export function useRemoveAdminStudioPick() {
  const { demoMode, read, write, refreshMemberCuration } = useCurationCache();
  return useDemoAwareMutation<void, Error, { pick: AdminStudioPickDTO }>({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: () => undefined,
    live: ({ pick }) => deleteAdminStudioPick(pick.id),
    onSuccess: (_result, { pick }) => {
      const curation = read();
      write(
        withShelfPicks(
          curation,
          pick.shelf,
          picksOnShelf(curation, pick.shelf).filter(
            (existing) => existing.id !== pick.id,
          ),
        ),
      );
    },
    onLiveSuccess: refreshMemberCuration,
  });
}

export interface ReorderAdminStudioPicksVariables {
  shelf: StudioCurationShelf;
  pickIds: string[];
}

/** The shelf moves at once and rolls back when the server refuses the
 *  order (`studio_curation_order_mismatch`). */
export function useReorderAdminStudioPicks() {
  const {
    demoMode,
    read,
    write,
    cancelRead,
    refetchRead,
    refreshMemberCuration,
  } = useCurationCache();
  return useDemoAwareMutation<
    AdminStudioPickDTO[],
    Error,
    ReorderAdminStudioPicksVariables,
    { previous: AdminStudioCurationDTO }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ shelf, pickIds }) =>
      renumbered(orderedByIds(picksOnShelf(read(), shelf), pickIds)),
    live: ({ shelf, pickIds }) => reorderAdminStudioPicks(shelf, { pickIds }),
    onMutate: async ({ shelf, pickIds }) => {
      await cancelRead();
      const previous = read();
      // The server refuses a list that misses or repeats a pick; the demo
      // answers the same 409 before the shelf moves.
      if (demoMode && !isSameIdSet(pickIds, picksOnShelf(previous, shelf)))
        throw studioAdminDemoRefusal("studio_curation_order_mismatch");
      write(
        withShelfPicks(
          previous,
          shelf,
          orderedByIds(picksOnShelf(previous, shelf), pickIds),
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) write(context.previous);
    },
    onLiveError: refetchRead,
    onSuccess: (picks, { shelf }) =>
      write(withShelfPicks(read(), shelf, picks)),
    onLiveSuccess: refreshMemberCuration,
  });
}
