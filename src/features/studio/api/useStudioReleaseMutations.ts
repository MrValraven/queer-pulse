import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createStudioRelease,
  deleteStudioRelease,
  publishStudioRelease,
  putStudioTrackOrder,
  unpublishStudioRelease,
  updateStudioRelease,
} from "./studio.api";
import {
  toReleaseView,
  type StudioArtistView,
  type StudioReleaseCardView,
  type StudioReleaseView,
} from "./studio.adapters";
import type {
  CreateStudioReleaseBody,
  UpdateStudioReleaseBody,
} from "./studio.types";
import {
  demoCreateRelease,
  demoPublish,
  demoReorder,
  demoUnpublish,
  demoUpdateRelease,
} from "./studioDemoMutations";
import type { InfiniteData } from "@tanstack/react-query";
import { studioKeys } from "./studioQueryKeys";

const SILENT = { silentError: true } as const;
/** The server lists at most 6 upcoming releases on an artist page. */
const UPCOMING_LIMIT = 6;

export function cachedRelease(
  queryClient: QueryClient,
  demoMode: boolean,
  releaseId: string,
): StudioReleaseView {
  const cached = queryClient.getQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
  );
  if (!cached) throw new Error(`Studio release ${releaseId} is not loaded`);
  return cached;
}

function cardOf(release: StudioReleaseView): StudioReleaseCardView {
  return {
    id: release.id,
    title: release.title,
    type: release.type,
    typeLabelKey: release.typeLabelKey,
    coverUrl: release.coverUrl,
    tint: release.tint,
    releasedOn: release.releasedOn,
    releaseYear: release.releaseYear,
    trackCount: release.trackCount,
    totalDurationSeconds: release.totalDurationSeconds,
    artist: release.artist,
    href: release.href,
    savedId: release.savedId,
    publishedAt: release.publishedAt,
    genre: release.genre,
    genreLabelKey: release.genreLabelKey,
    mood: release.mood,
    scene: release.scene,
    format: release.format,
    isShow: release.isShow,
  };
}

interface ReleasesPageData {
  items: StudioReleaseCardView[];
  nextCursor: string | null;
}

/** Demo has no server to refetch, and a refetch would read the fixed demo
 *  fixture and drop the change. So demo patches the cached artist page and
 *  the home grid in place: published cards live in `releases` or `singles`
 *  and the home grid, drafts and taken-down cards in `ownerReleases`. */
export function syncDemoReleaseLists(
  queryClient: QueryClient,
  release: StudioReleaseView,
  isRemoved = false,
) {
  const isPublished = !isRemoved && release.status === "published";
  const isScheduled = !isRemoved && release.status === "scheduled";
  const card = cardOf(release);
  queryClient.setQueriesData<StudioArtistView>(
    { queryKey: ["studio", "artist", true] },
    (artistView) => {
      if (!artistView || artistView.artist.id !== release.artist.id)
        return artistView;
      const isSingle = release.type === "single";
      const others = (cards: StudioReleaseCardView[]) =>
        cards.filter((candidate) => candidate.id !== release.id);
      const ownerOthers = artistView.ownerReleases?.filter(
        (candidate) => candidate.id !== release.id,
      );
      return {
        ...artistView,
        allReleases: isPublished
          ? [card, ...others(artistView.allReleases)]
          : others(artistView.allReleases),
        releases:
          isPublished && !isSingle
            ? [card, ...others(artistView.releases)]
            : others(artistView.releases),
        singles:
          isPublished && isSingle
            ? [card, ...others(artistView.singles)]
            : others(artistView.singles),
        ownerReleases:
          ownerOthers === undefined
            ? artistView.ownerReleases
            : isRemoved || isPublished
              ? ownerOthers
              : [
                  {
                    ...card,
                    status: release.status,
                    statusLabelKey: release.statusLabelKey,
                    takedownReason: release.takedownReason,
                    publishAt: release.publishAt,
                  },
                  ...ownerOthers,
                ],
        // Studio v3: a scheduled release is listed under Upcoming, soonest
        // first; any other status leaves the list.
        upcoming: isScheduled
          ? [
              {
                ...card,
                publishAt: release.publishAt ?? "",
                isReminderSet: release.isReminderSet,
              },
              ...artistView.upcoming.filter(
                (candidate) => candidate.id !== release.id,
              ),
            ]
              .sort(
                (left, right) =>
                  Date.parse(left.publishAt) - Date.parse(right.publishAt),
              )
              .slice(0, UPCOMING_LIMIT)
          : artistView.upcoming.filter(
              (candidate) => candidate.id !== release.id,
            ),
      };
    },
  );
  queryClient.setQueriesData<InfiniteData<ReleasesPageData, string | null>>(
    { queryKey: studioKeys.releases(true) },
    (data) => {
      if (!data) return data;
      const pages = data.pages.map((page, index) => {
        const items = page.items.filter((item) => item.id !== release.id);
        return {
          ...page,
          items: isPublished && index === 0 ? [card, ...items] : items,
        };
      });
      return { ...data, pages };
    },
  );
}

/** After a write that can change a release card (status, counts): demo
 *  patches the lists, live invalidates them. */
export function refreshReleaseLists(
  queryClient: QueryClient,
  demoMode: boolean,
  release: StudioReleaseView | undefined,
  isRemoved = false,
) {
  if (demoMode) {
    if (release) syncDemoReleaseLists(queryClient, release, isRemoved);
    return;
  }
  void queryClient.invalidateQueries({ queryKey: ["studio", "artist"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "releases"] });
  // A publish or unpublish changes the genre lists too (Studio v2).
  void queryClient.invalidateQueries({ queryKey: ["studio", "browse"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "genres"] });
  // Artist kinds: format chips, format shelves and the New episodes shelf
  // list published releases and episodes the same way.
  void queryClient.invalidateQueries({ queryKey: ["studio", "formats"] });
  void queryClient.invalidateQueries({
    queryKey: ["studio", "formatReleases"],
  });
  void queryClient.invalidateQueries({
    queryKey: ["studio", "latestEpisodes"],
  });
  // Moods and scenes list published releases the same way.
  void queryClient.invalidateQueries({ queryKey: ["studio", "moods"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "scenes"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "scene"] });
  void queryClient.invalidateQueries({
    queryKey: ["studio", "sceneReleases"],
  });
  // Playlists hold the release's tracks, so a publish, unpublish or delete
  // changes which entries play; search results and Your numbers count them.
  void queryClient.invalidateQueries({ queryKey: ["studio", "playlist"] });
  void queryClient.invalidateQueries({
    queryKey: studioKeys.myPlaylists(demoMode),
  });
  void queryClient.invalidateQueries({
    queryKey: ["studio", "memberPlaylists"],
  });
  void queryClient.invalidateQueries({
    queryKey: ["studio", "trackPlaylists"],
  });
  void queryClient.invalidateQueries({ queryKey: ["studio", "search"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "stats"] });
  // The press kit lists the latest releases and their tracks (Studio v3).
  void queryClient.invalidateQueries({
    queryKey: ["studio", "studioPressKit"],
  });
}

/** Write the server's answer into the release cache and refresh the lists
 *  that show it (the owner panel and the home grid). */
export function storeRelease(
  queryClient: QueryClient,
  demoMode: boolean,
  release: StudioReleaseView,
) {
  queryClient.setQueryData(studioKeys.release(demoMode, release.id), release);
  refreshReleaseLists(queryClient, demoMode, release);
}

export function useCreateStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<StudioReleaseView, Error, CreateStudioReleaseBody>({
    meta: SILENT,
    mutationFn: async (body) =>
      demoMode
        ? demoCreateRelease(body)
        : toReleaseView(await createStudioRelease(body)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

export function useUpdateStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioReleaseView,
    Error,
    { releaseId: string; body: UpdateStudioReleaseBody }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, body }) =>
      demoMode
        ? demoUpdateRelease(
            cachedRelease(queryClient, demoMode, releaseId),
            body,
          )
        : toReleaseView(await updateStudioRelease(releaseId, body)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

export function useDeleteStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ releaseId }) => {
      if (!demoMode) await deleteStudioRelease(releaseId);
    },
    onSuccess: (_result, { releaseId }) => {
      refreshReleaseLists(
        queryClient,
        demoMode,
        queryClient.getQueryData<StudioReleaseView>(
          studioKeys.release(demoMode, releaseId),
        ),
        true,
      );
      queryClient.removeQueries({
        queryKey: studioKeys.release(demoMode, releaseId),
      });
    },
  });
}

function useReleaseTransition(
  live: (releaseId: string) => Promise<Parameters<typeof toReleaseView>[0]>,
  demo: (release: StudioReleaseView) => StudioReleaseView,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<StudioReleaseView, Error, { releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ releaseId }) =>
      demoMode
        ? demo(cachedRelease(queryClient, demoMode, releaseId))
        : toReleaseView(await live(releaseId)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

export const usePublishStudioRelease = () =>
  useReleaseTransition(publishStudioRelease, demoPublish);
export const useUnpublishStudioRelease = () =>
  useReleaseTransition(unpublishStudioRelease, demoUnpublish);

export function useReorderStudioTracks() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioReleaseView,
    Error,
    { releaseId: string; trackIds: string[] }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, trackIds }) =>
      demoMode
        ? demoReorder(cachedRelease(queryClient, demoMode, releaseId), trackIds)
        : toReleaseView(await putStudioTrackOrder(releaseId, trackIds)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}
