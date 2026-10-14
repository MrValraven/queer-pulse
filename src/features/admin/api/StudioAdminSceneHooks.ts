import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioPageDTO,
} from "../../studio/api/studio.types";
import {
  isSameIdSet,
  orderedByIds,
  renumbered,
  sceneSlugCandidates,
  sceneSlugFromName,
} from "../studioAdmin.model";
import {
  STUDIO_ADMIN_SILENT_META,
  studioAdminDemoRefusal,
} from "../studioAdminDemoErrors";
import { ADMIN_STUDIO_KEY } from "./StudioAdminCurationHooks";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  archiveAdminStudioScene,
  createAdminStudioScene,
  getAdminStudioSceneEvents,
  getAdminStudioSceneReleases,
  getAdminStudioScenes,
  pinAdminStudioSceneEvent,
  removeAdminStudioSceneRelease,
  reorderAdminStudioScenes,
  restoreAdminStudioScene,
  searchAdminStudioEvents,
  unpinAdminStudioSceneEvent,
  updateAdminStudioScene,
  type AdminStudioEventOptionDTO,
  type AdminStudioReleaseCardDTO,
  type AdminStudioSceneDTO,
  type AdminStudioSceneEventDTO,
  type CreateAdminStudioSceneBody,
  type UpdateAdminStudioSceneBody,
} from "./studioDiscoveryAdmin.api";

export const adminStudioScenesKey = (demoMode: boolean) =>
  [ADMIN_STUDIO_KEY, "scenes", demoMode] as const;
const sceneEventsKey = (demoMode: boolean, sceneId: string) =>
  [ADMIN_STUDIO_KEY, "sceneEvents", demoMode, sceneId] as const;
const sceneReleasesKey = (demoMode: boolean, sceneId: string) =>
  [ADMIN_STUDIO_KEY, "sceneReleases", demoMode, sceneId] as const;

const loadDemo = () => import("../StudioAdmin.data");

export function useAdminStudioScenes() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStudioSceneDTO[]>({
    queryKey: adminStudioScenesKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async () =>
      demoMode
        ? (await loadDemo()).demoAdminStudioScenes()
        : getAdminStudioScenes(),
  });
}

function useScenesCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<AdminStudioSceneDTO[]>(
      adminStudioScenesKey(demoMode),
    ) ?? [];
  const write = (scenes: AdminStudioSceneDTO[]) =>
    queryClient.setQueryData(adminStudioScenesKey(demoMode), scenes);
  const cancelRead = () =>
    queryClient.cancelQueries({ queryKey: adminStudioScenesKey(demoMode) });
  // After a refused live reorder the rollback shows the old order; the
  // server's own order is fetched again in case another console moved it.
  const refetchRead = () => {
    void queryClient.invalidateQueries({
      queryKey: adminStudioScenesKey(demoMode),
    });
  };
  // A demo scene's pins: the cached list once read or written, else the
  // seed, so a pin or unpin never drops the seeded pins.
  const demoPinnedEventsOf = async (sceneId: string) =>
    queryClient.getQueryData<AdminStudioSceneEventDTO[]>(
      sceneEventsKey(true, sceneId),
    ) ?? (await loadDemo()).demoAdminSceneEvents(sceneId);
  const upsert = (scene: AdminStudioSceneDTO) =>
    write([...read().filter((existing) => existing.id !== scene.id), scene]);
  const patch = (sceneId: string, change: Partial<AdminStudioSceneDTO>) =>
    write(
      read().map((scene) =>
        scene.id === sceneId ? { ...scene, ...change } : scene,
      ),
    );
  // The member scene reads see the same scenes, so a live write refreshes
  // them too.
  const refreshMemberScenes = () => {
    for (const queryKey of [
      [ADMIN_STUDIO_KEY, "scenes"],
      ["studio", "scenes"],
      ["studio", "scene"],
      ["studio", "sceneReleases"],
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };
  return {
    demoMode,
    queryClient,
    read,
    write,
    cancelRead,
    refetchRead,
    demoPinnedEventsOf,
    upsert,
    patch,
    refreshMemberScenes,
  };
}

/** The position a created or restored scene takes: after the last active
 *  one, as the server sets MAX(position) + 1. */
const nextActivePositionOf = (scenes: AdminStudioSceneDTO[]) =>
  Math.max(
    0,
    ...scenes
      .filter((scene) => scene.status === "active")
      .map((scene) => scene.position),
  ) + 1;

export type SaveAdminStudioSceneVariables =
  | { sceneId: null; body: CreateAdminStudioSceneBody }
  | { sceneId: string; body: UpdateAdminStudioSceneBody };

/** Create (sceneId null) or edit. A taken explicit slug answers 409
 *  `studio_scene_slug_taken`; a create with no slug takes the first free
 *  candidate built from the name, as the server does. */
export function useSaveAdminStudioScene() {
  const { demoMode, read, upsert, refreshMemberScenes } = useScenesCache();
  return useDemoAwareMutation<
    AdminStudioSceneDTO,
    Error,
    SaveAdminStudioSceneVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: (variables) => {
      const scenes = read();
      const existing = scenes.find((scene) => scene.id === variables.sceneId);
      const now = new Date().toISOString();
      const name = variables.body.name ?? existing?.name ?? "";
      const takenSlugs = new Set(
        scenes
          .filter((scene) => scene.id !== existing?.id)
          .map((scene) => scene.slug),
      );
      const requestedSlug = variables.body.slug;
      let slug: string | undefined;
      if (requestedSlug)
        slug = takenSlugs.has(requestedSlug) ? undefined : requestedSlug;
      else
        slug =
          existing?.slug ??
          sceneSlugCandidates(sceneSlugFromName(name)).find(
            (candidate) => !takenSlugs.has(candidate),
          );
      if (slug === undefined)
        throw studioAdminDemoRefusal("studio_scene_slug_taken");
      return {
        id: existing?.id ?? `demo-scene-${slug}-${Date.now()}`,
        slug,
        name,
        city: variables.body.city ?? existing?.city ?? "",
        blurb:
          variables.body.blurb === undefined
            ? (existing?.blurb ?? null)
            : variables.body.blurb,
        coverUrl:
          variables.body.coverKey === undefined
            ? (existing?.coverUrl ?? null)
            : variables.body.coverKey,
        status: existing?.status ?? "active",
        position: existing?.position ?? nextActivePositionOf(scenes),
        releaseCount: existing?.releaseCount ?? 0,
        pinnedEventCount: existing?.pinnedEventCount ?? 0,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
    },
    live: (variables) =>
      variables.sceneId === null
        ? createAdminStudioScene(variables.body)
        : updateAdminStudioScene(variables.sceneId, variables.body),
    onSuccess: upsert,
    onLiveSuccess: refreshMemberScenes,
  });
}

/** Archive keeps every release link and pin; restore puts the scene last
 *  among the active ones. */
export function useSetAdminStudioSceneArchived() {
  const { demoMode, read, upsert, refreshMemberScenes } = useScenesCache();
  return useDemoAwareMutation<
    AdminStudioSceneDTO,
    Error,
    { scene: AdminStudioSceneDTO; isArchived: boolean }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ scene, isArchived }) => ({
      ...scene,
      status: isArchived ? "archived" : "active",
      position: isArchived ? scene.position : nextActivePositionOf(read()),
      updatedAt: new Date().toISOString(),
    }),
    live: ({ scene, isArchived }) =>
      isArchived
        ? archiveAdminStudioScene(scene.id)
        : restoreAdminStudioScene(scene.id),
    onSuccess: upsert,
    onLiveSuccess: refreshMemberScenes,
  });
}

/** Moves at once and rolls back on `studio_scene_order_mismatch`. */
export function useReorderAdminStudioScenes() {
  const {
    demoMode,
    read,
    write,
    cancelRead,
    refetchRead,
    refreshMemberScenes,
  } = useScenesCache();
  const reorderedActive = (sceneIds: string[]) => {
    const scenes = read();
    const active = renumbered(
      orderedByIds(
        scenes.filter((scene) => scene.status === "active"),
        sceneIds,
      ),
    );
    return [...active, ...scenes.filter((scene) => scene.status !== "active")];
  };
  return useDemoAwareMutation<
    AdminStudioSceneDTO[],
    Error,
    { sceneIds: string[] },
    { previous: AdminStudioSceneDTO[] }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ sceneIds }) =>
      reorderedActive(sceneIds).filter((scene) => scene.status === "active"),
    live: ({ sceneIds }) => reorderAdminStudioScenes({ sceneIds }),
    onMutate: async ({ sceneIds }) => {
      await cancelRead();
      const previous = read();
      // The server refuses a list that misses or repeats an active scene;
      // the demo answers the same 409 before the list moves.
      const activeScenes = previous.filter(
        (scene) => scene.status === "active",
      );
      if (demoMode && !isSameIdSet(sceneIds, activeScenes))
        throw studioAdminDemoRefusal("studio_scene_order_mismatch");
      write(reorderedActive(sceneIds));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) write(context.previous);
    },
    onLiveError: refetchRead,
    onSuccess: (active) =>
      write([
        ...active,
        ...read().filter((scene) => scene.status !== "active"),
      ]),
    onLiveSuccess: refreshMemberScenes,
  });
}

/** Upcoming public or members events by title; nothing is read for a blank
 *  query. The caller debounces. */
export function useAdminStudioEventSearch(query: string) {
  const { demoMode } = useDemoMode();
  const trimmed = query
    .trim()
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength);
  return useQuery<AdminStudioEventOptionDTO[]>({
    queryKey: [ADMIN_STUDIO_KEY, "eventSearch", demoMode, trimmed],
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    meta: STUDIO_ADMIN_SILENT_META,
    queryFn: async () =>
      demoMode
        ? (await loadDemo()).demoAdminEventSearch(trimmed)
        : (await searchAdminStudioEvents(trimmed)).items,
  });
}

export function useAdminStudioSceneEvents(sceneId: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStudioSceneEventDTO[]>({
    queryKey: sceneEventsKey(demoMode, sceneId ?? ""),
    enabled: sceneId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async () =>
      demoMode
        ? (await loadDemo()).demoAdminSceneEvents(sceneId ?? "")
        : getAdminStudioSceneEvents(sceneId ?? ""),
  });
}

/** Idempotent: pinning an event twice answers the same list. */
export function usePinAdminStudioSceneEvent() {
  const {
    demoMode,
    queryClient,
    demoPinnedEventsOf,
    patch,
    refreshMemberScenes,
  } = useScenesCache();
  return useDemoAwareMutation<
    AdminStudioSceneEventDTO[],
    Error,
    { sceneId: string; event: AdminStudioEventOptionDTO }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: async ({ sceneId, event }) => {
      const pinned = await demoPinnedEventsOf(sceneId);
      if (pinned.some((existing) => existing.eventId === event.id))
        return pinned;
      return [
        ...pinned,
        {
          eventId: event.id,
          slug: event.slug,
          title: event.title,
          startAt: event.startAt,
          venue: event.venue,
          neighbourhood: event.neighbourhood,
          isUpcoming: true,
          pinnedAt: new Date().toISOString(),
        },
      ].sort((left, right) => left.startAt.localeCompare(right.startAt));
    },
    live: ({ sceneId, event }) =>
      pinAdminStudioSceneEvent(sceneId, { eventId: event.id }),
    onSuccess: (events, { sceneId }) => {
      queryClient.setQueryData(sceneEventsKey(demoMode, sceneId), events);
      patch(sceneId, { pinnedEventCount: events.length });
    },
    onLiveSuccess: refreshMemberScenes,
  });
}

export function useUnpinAdminStudioSceneEvent() {
  const {
    demoMode,
    queryClient,
    demoPinnedEventsOf,
    patch,
    refreshMemberScenes,
  } = useScenesCache();
  return useDemoAwareMutation<
    void,
    Error,
    { sceneId: string; eventId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    // The seeded pins land in the cache first, so the unpin below keeps the
    // others and counts them right.
    demoResult: async ({ sceneId }) => {
      queryClient.setQueryData(
        sceneEventsKey(true, sceneId),
        await demoPinnedEventsOf(sceneId),
      );
    },
    live: ({ sceneId, eventId }) =>
      unpinAdminStudioSceneEvent(sceneId, eventId),
    onSuccess: (_result, { sceneId, eventId }) => {
      const cached = queryClient.getQueryData<AdminStudioSceneEventDTO[]>(
        sceneEventsKey(demoMode, sceneId),
      );
      // Live with the list never read: the scenes refresh brings the count.
      if (!cached) return;
      const events = cached.filter((event) => event.eventId !== eventId);
      queryClient.setQueryData(sceneEventsKey(demoMode, sceneId), events);
      patch(sceneId, { pinnedEventCount: events.length });
    },
    onLiveSuccess: refreshMemberScenes,
  });
}

type SceneReleasesData = InfiniteData<
  StudioPageDTO<AdminStudioReleaseCardDTO>,
  string | null
>;

/** A scene's releases in any status, newest created first, 24 a page. The
 *  demo answers one page. */
export function useAdminStudioSceneReleases(sceneId: string | null) {
  const { demoMode } = useDemoMode();
  return useInfiniteQuery({
    queryKey: sceneReleasesKey(demoMode, sceneId ?? ""),
    enabled: sceneId !== null,
    initialPageParam: null as string | null,
    queryFn: async ({
      pageParam,
    }): Promise<StudioPageDTO<AdminStudioReleaseCardDTO>> => {
      if (!demoMode)
        return getAdminStudioSceneReleases(sceneId ?? "", pageParam);
      const items = (await loadDemo()).demoAdminSceneReleases(sceneId ?? "");
      return { items, pageInfo: { nextCursor: null, hasMore: false } };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : null,
  });
}

/** Sets the release's scene to none; the release leaves the list. */
export function useRemoveAdminStudioSceneRelease() {
  const { demoMode, queryClient, read, patch, refreshMemberScenes } =
    useScenesCache();
  return useDemoAwareMutation<
    void,
    Error,
    { sceneId: string; releaseId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: () => undefined,
    live: ({ sceneId, releaseId }) =>
      removeAdminStudioSceneRelease(sceneId, releaseId),
    onSuccess: (_result, { sceneId, releaseId }) => {
      queryClient.setQueryData<SceneReleasesData>(
        sceneReleasesKey(demoMode, sceneId),
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((item) => item.id !== releaseId),
                })),
              }
            : data,
      );
      const scene = read().find((candidate) => candidate.id === sceneId);
      if (scene)
        patch(sceneId, { releaseCount: Math.max(0, scene.releaseCount - 1) });
    },
    onLiveSuccess: refreshMemberScenes,
  });
}
