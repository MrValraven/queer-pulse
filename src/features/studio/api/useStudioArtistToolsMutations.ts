import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toReleaseView,
  type StudioArtistView,
  type StudioReleaseView,
} from "./studio.adapters";
import type { StudioPreviewLinkDTO } from "./studio.types";
import {
  clearStudioReleaseReminder,
  createStudioReleaseVersion,
  mintStudioPreviewLink,
  revokeStudioPreviewLink,
  scheduleStudioRelease,
  setStudioReleaseReminder,
  unscheduleStudioRelease,
} from "./studioArtistTools.api";
import {
  demoAddVersion,
  demoPreviewToken,
  demoSchedule,
  demoUnschedule,
  studioRefusal,
} from "./studioDemoMutations";
import { studioKeys } from "./studioQueryKeys";
import { studioReleaseQueryOptions } from "./useStudioRelease";
import { cachedRelease, storeRelease } from "./useStudioReleaseMutations";

// Studio v3 writes on one release. Each answer goes straight into the
// release cache (storeRelease), which also refreshes the lists that show it:
// demo patches them in place, live invalidates them.

const SILENT = { silentError: true } as const;

/** The demo transforms read the cached release; the owner panel can act on
 *  a release no page has opened yet, so it is read first. */
async function demoRelease(
  queryClient: QueryClient,
  releaseId: string,
): Promise<StudioReleaseView> {
  await queryClient.ensureQueryData(studioReleaseQueryOptions(true, releaseId));
  return cachedRelease(queryClient, true, releaseId);
}

export function useScheduleStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioReleaseView,
    Error,
    { releaseId: string; publishAt: string }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, publishAt }) =>
      demoMode
        ? demoSchedule(await demoRelease(queryClient, releaseId), publishAt)
        : toReleaseView(await scheduleStudioRelease(releaseId, publishAt)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

export function useUnscheduleStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<StudioReleaseView, Error, { releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ releaseId }) =>
      demoMode
        ? demoUnschedule(await demoRelease(queryClient, releaseId))
        : toReleaseView(await unscheduleStudioRelease(releaseId)),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

export function useAddStudioReleaseVersion() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioReleaseView,
    Error,
    { releaseId: string; note: string }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, note }) =>
      demoMode
        ? demoAddVersion(await demoRelease(queryClient, releaseId), note)
        : toReleaseView(
            await createStudioReleaseVersion(releaseId, note.trim()),
          ),
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
  });
}

/** The viewer's Notify me state, into the release and every cached artist
 *  page's Upcoming card. */
export function patchStudioReminder(
  queryClient: QueryClient,
  demoMode: boolean,
  releaseId: string,
  isSet: boolean,
): void {
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
    (release) =>
      release
        ? { ...release, isReminderSet: release.isUpcoming && isSet }
        : release,
  );
  queryClient.setQueriesData<StudioArtistView>(
    { queryKey: ["studio", "artist", demoMode] },
    (view) =>
      view
        ? {
            ...view,
            upcoming: view.upcoming.map((card) =>
              card.id === releaseId ? { ...card, isReminderSet: isSet } : card,
            ),
          }
        : view,
  );
}

export function useStudioReleaseReminder() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { releaseId: string; isSet: boolean }>({
    meta: SILENT,
    mutationFn: async ({ releaseId, isSet }) => {
      if (demoMode) {
        (await import("./studioDemoArtistTools")).demoSetReminder(
          releaseId,
          isSet,
        );
        return isSet;
      }
      if (isSet) await setStudioReleaseReminder(releaseId);
      else await clearStudioReleaseReminder(releaseId);
      return isSet;
    },
    onSuccess: (isSet, { releaseId }) =>
      patchStudioReminder(queryClient, demoMode, releaseId, isSet),
  });
}

function patchPreviewLink(
  queryClient: QueryClient,
  demoMode: boolean,
  releaseId: string,
  link: StudioPreviewLinkDTO | null,
): void {
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(demoMode, releaseId),
    (release) =>
      release
        ? {
            ...release,
            previewToken: link?.token ?? null,
            previewLinkCreatedAt: link?.createdAt ?? null,
          }
        : release,
  );
}

/** Mints a link, or replaces the existing one (the old one stops working). */
export function useMintStudioPreviewLink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<StudioPreviewLinkDTO, Error, { releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ releaseId }) => {
      if (!demoMode) return mintStudioPreviewLink(releaseId);
      const release = await demoRelease(queryClient, releaseId);
      if (release.status !== "draft" && release.status !== "scheduled")
        throw studioRefusal(409, "studio_preview_not_available");
      const link = {
        token: demoPreviewToken(),
        createdAt: new Date().toISOString(),
      };
      (await import("./studioDemoArtistTools")).demoStorePreviewLink(
        releaseId,
        link,
      );
      return link;
    },
    onSuccess: (link, { releaseId }) =>
      patchPreviewLink(queryClient, demoMode, releaseId, link),
  });
}

export function useRevokeStudioPreviewLink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { releaseId: string }>({
    meta: SILENT,
    mutationFn: async ({ releaseId }) => {
      if (!demoMode) {
        await revokeStudioPreviewLink(releaseId);
        return;
      }
      (await import("./studioDemoArtistTools")).demoRevokePreviewLink(
        releaseId,
      );
    },
    onSuccess: (_result, { releaseId }) =>
      patchPreviewLink(queryClient, demoMode, releaseId, null),
  });
}
