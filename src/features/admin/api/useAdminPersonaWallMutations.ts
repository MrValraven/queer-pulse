import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  personaWallReasonOf,
  type PersonaWallAdminDTO,
  type PersonaWallFillOrder,
  type PersonaWallReasonCode,
} from "../../subprofiles/api/personaWall.api";
import { SUBPROFILE_WALL_QUERY_ROOT } from "../../subprofiles/api/useSubprofileWall";
import { orderedByIds, renumbered } from "../studioAdmin.model";
import {
  addAdminPersonaWallPick,
  removeAdminPersonaWallPick,
  reorderAdminPersonaWallPicks,
  setAdminPersonaWallFillOrder,
} from "./adminPersonaWall.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  ADMIN_PERSONA_WALL_SEARCH_ROOT,
  adminPersonaWallKey,
} from "./useAdminPersonaWall";

/** Every wall write shares this key, so the page can tell a write is in
 *  flight and ignore a second press. */
export const PERSONA_WALL_WRITE_KEY = [
  "admin",
  "personaWall",
  "write",
] as const;

/** Each control on the page shows its own refusal line, so the global toast
 *  stays quiet. */
const SILENT_META = { silentError: true } as const;

/** Refusals that mean the cached wall is out of date: another tab removed
 *  the pick, added the persona, filled the last slot, or the persona left
 *  the directory or QueerPulse. */
const STALE_WALL_REASONS: ReadonlySet<PersonaWallReasonCode> = new Set([
  "PERSONA_WALL_PICK_NOT_FOUND",
  "PERSONA_WALL_ALREADY_PICKED",
  "PERSONA_WALL_FULL",
  "PERSONA_WALL_NOT_LISTED",
  "PERSONA_WALL_PERSONA_NOT_FOUND",
]);

function loadDemoStore() {
  return import("../../subprofiles/personaWallDemoStore");
}

/**
 * The admin wall cache. Every write answers with the whole admin wall,
 * which replaces the cached one, and the public wall query is invalidated in
 * both modes, so `/subprofiles` in this browser reads the new wall.
 */
function usePersonaWallCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const wallKey = adminPersonaWallKey(demoMode);
  const read = () => queryClient.getQueryData<PersonaWallAdminDTO>(wallKey);
  const write = (wall: PersonaWallAdminDTO) =>
    queryClient.setQueryData(wallKey, wall);
  const saveWall = (wall: PersonaWallAdminDTO) => {
    write(wall);
    void queryClient.invalidateQueries({
      queryKey: SUBPROFILE_WALL_QUERY_ROOT,
    });
  };
  // Search results carry `isPicked`, so adding or removing a pick makes them
  // stale.
  const refreshSearch = () => {
    void queryClient.invalidateQueries({
      queryKey: ADMIN_PERSONA_WALL_SEARCH_ROOT,
    });
  };
  // An optimistic write first stops a read in flight, so its late answer
  // never overwrites the new wall.
  const cancelRead = () => queryClient.cancelQueries({ queryKey: wallKey });
  const refetchRead = () => {
    void queryClient.invalidateQueries({ queryKey: wallKey });
  };
  // A refusal that says the wall is out of date reads it again, with the
  // search and the public wall, so the page and `/subprofiles` show what the
  // server holds. Other failures leave the wall alone.
  const refetchIfStale = (cause: unknown) => {
    const reason = personaWallReasonOf(cause);
    if (reason === null || !STALE_WALL_REASONS.has(reason)) return;
    refetchRead();
    refreshSearch();
    void queryClient.invalidateQueries({
      queryKey: SUBPROFILE_WALL_QUERY_ROOT,
    });
  };
  return {
    demoMode,
    read,
    write,
    saveWall,
    refreshSearch,
    cancelRead,
    refetchRead,
    refetchIfStale,
  };
}

/** True while any wall write is in flight. */
export function usePersonaWallIsWriting(): boolean {
  return useIsMutating({ mutationKey: PERSONA_WALL_WRITE_KEY }) > 0;
}

export interface AddPersonaWallPickVariables {
  subprofileId: string;
}

/** POST /admin/personas/wall/picks: appends the persona to the picks. */
export function useAddPersonaWallPick() {
  const { demoMode, saveWall, refreshSearch, refetchIfStale } =
    usePersonaWallCache();
  return useDemoAwareMutation<
    PersonaWallAdminDTO,
    Error,
    AddPersonaWallPickVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: PERSONA_WALL_WRITE_KEY,
    demoResult: async ({ subprofileId }) =>
      (await loadDemoStore()).demoAddPersonaWallPick(subprofileId),
    live: ({ subprofileId }) => addAdminPersonaWallPick({ subprofileId }),
    onError: (cause) => refetchIfStale(cause),
    onSuccess: (wall) => {
      saveWall(wall);
      refreshSearch();
    },
  });
}

export interface ReorderPersonaWallPicksVariables {
  ids: string[];
}

export interface PersonaWallRollbackContext {
  previous: PersonaWallAdminDTO | undefined;
}

/** PATCH /admin/personas/wall/picks/reorder. The rows move at once and
 *  roll back when the order is refused (`PERSONA_WALL_REORDER_MISMATCH`). */
export function useReorderPersonaWallPicks() {
  const { demoMode, read, write, saveWall, cancelRead, refetchRead } =
    usePersonaWallCache();
  return useDemoAwareMutation<
    PersonaWallAdminDTO,
    Error,
    ReorderPersonaWallPicksVariables,
    PersonaWallRollbackContext
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: PERSONA_WALL_WRITE_KEY,
    demoResult: async ({ ids }) =>
      (await loadDemoStore()).demoReorderPersonaWallPicks(ids),
    live: ({ ids }) => reorderAdminPersonaWallPicks({ ids }),
    onMutate: async ({ ids }) => {
      await cancelRead();
      const previous = read();
      if (previous) {
        write({
          ...previous,
          picks: renumbered(orderedByIds(previous.picks, ids)),
        });
      }
      return { previous };
    },
    // After a refused reorder the rollback shows the old order, then the
    // wall is read again in both modes, so a pick another tab added or
    // removed meanwhile shows up.
    onError: (_error, _variables, context) => {
      if (context?.previous) write(context.previous);
      refetchRead();
    },
    onSuccess: (wall) => saveWall(wall),
  });
}

export interface RemovePersonaWallPickVariables {
  pickId: string;
}

/** DELETE /admin/personas/wall/picks/:id: the positions after it close up. */
export function useRemovePersonaWallPick() {
  const { demoMode, saveWall, refreshSearch, refetchIfStale } =
    usePersonaWallCache();
  return useDemoAwareMutation<
    PersonaWallAdminDTO,
    Error,
    RemovePersonaWallPickVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: PERSONA_WALL_WRITE_KEY,
    demoResult: async ({ pickId }) =>
      (await loadDemoStore()).demoRemovePersonaWallPick(pickId),
    live: ({ pickId }) => removeAdminPersonaWallPick(pickId),
    onError: (cause) => refetchIfStale(cause),
    onSuccess: (wall) => {
      saveWall(wall);
      refreshSearch();
    },
  });
}

export interface SetPersonaWallFillOrderVariables {
  fillOrder: PersonaWallFillOrder;
}

/** PATCH /admin/personas/wall/settings. The choice shows at once and rolls
 *  back when the server refuses it. */
export function useSetPersonaWallFillOrder() {
  const { demoMode, read, write, saveWall, cancelRead, refetchIfStale } =
    usePersonaWallCache();
  return useDemoAwareMutation<
    PersonaWallAdminDTO,
    Error,
    SetPersonaWallFillOrderVariables,
    PersonaWallRollbackContext
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: PERSONA_WALL_WRITE_KEY,
    demoResult: async ({ fillOrder }) =>
      (await loadDemoStore()).demoSetPersonaWallFillOrder(fillOrder),
    live: ({ fillOrder }) => setAdminPersonaWallFillOrder({ fillOrder }),
    onMutate: async ({ fillOrder }) => {
      await cancelRead();
      const previous = read();
      if (previous) write({ ...previous, fillOrder });
      return { previous };
    },
    onError: (cause, _variables, context) => {
      if (context?.previous) write(context.previous);
      refetchIfStale(cause);
    },
    onSuccess: (wall) => saveWall(wall),
  });
}
