import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toReleaseView,
  type StudioReleaseView,
} from "../../studio/api/studio.adapters";
import type {
  StudioAccessGrantDTO,
  StudioReleaseDTO,
} from "../../studio/api/studio.types";
import { demoWithdrawalStatus } from "../../studio/api/studioDemoMutations";
import { studioKeys } from "../../studio/api/studioQueryKeys";
import { DEMO_STUDIO_GRANTS } from "../adminStudio.data";
import {
  getMemberStudioAccess,
  getStaffStudioRelease,
  grantMemberStudioAccess,
  restoreStudioRelease,
  revokeMemberStudioAccess,
  takeDownStudioRelease,
} from "./adminStudio.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

const accessKey = (demoMode: boolean, memberId: string) =>
  ["admin-members", "studio-access", demoMode, memberId] as const;

export function useMemberStudioAccess(memberId: string) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: accessKey(demoMode, memberId),
    // No grant is an empty 200; the client reads it as undefined, so both
    // undefined and null mean "no grant".
    queryFn: async (): Promise<StudioAccessGrantDTO | null> =>
      demoMode
        ? (DEMO_STUDIO_GRANTS[memberId] ?? null)
        : ((await getMemberStudioAccess(memberId)) ?? null),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
  });
}

export function useGrantStudioAccess() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    StudioAccessGrantDTO,
    unknown,
    { memberId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "studio-access", "grant"],
    demoResult: ({ memberId }) => ({
      userId: memberId,
      grantedAt: new Date().toISOString(),
      grantedBy: null,
    }),
    live: ({ memberId }) => grantMemberStudioAccess(memberId),
    onSuccess: (grant, { memberId }) =>
      queryClient.setQueryData(accessKey(demoMode, memberId), grant),
  });
}

export function useRevokeStudioAccess() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, { memberId: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "studio-access", "revoke"],
    demoResult: () => undefined,
    live: ({ memberId }) => revokeMemberStudioAccess(memberId),
    onSuccess: (_result, { memberId }) =>
      queryClient.setQueryData(accessKey(demoMode, memberId), null),
  });
}

/** The demo has no release store behind the queue: a takedown answers a
 *  minimal release in the new state, enough for the panel's status line. */
function demoReleaseIn(
  releaseId: string,
  status: StudioReleaseDTO["status"],
  reason: string | null,
): StudioReleaseView {
  return toReleaseView({
    id: releaseId,
    title: "",
    type: "single",
    coverUrl: null,
    releasedOn: null,
    trackCount: 0,
    totalDurationSeconds: 0,
    artist: {
      id: "demo-artist",
      handle: "",
      name: "",
      kind: "musician",
      avatarUrl: null,
    },
    description: null,
    genre: null,
    mood: null,
    scene: null,
    status,
    publishedAt: status === "published" ? new Date().toISOString() : null,
    tracks: [],
    isOwner: false,
    rightsConfirmedAt: null,
    takedownReason: reason,
    sceneId: null,
    personaCredits: [],
  });
}

const staffReleaseKey = (demoMode: boolean, releaseId: string) =>
  ["admin-studio", "release", demoMode, releaseId] as const;

/** Every takedown resolves every open report about the release on the
 *  server, and a takedown or restore moves it in or out of Withdrawn, so the
 *  moderation queue and the three Studio review queues (both modes) read
 *  again. Live, every reader of the release reads again too: its page, its
 *  tracks, the lists that show it and the open report's detail. The demo
 *  keeps those caches, since a re-read would answer the fixtures and drop
 *  the session's edits. */
function refreshStaffReviewQueues(
  queryClient: QueryClient,
  demoMode: boolean,
): void {
  void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
  for (const queueDemoMode of [false, true])
    for (const queryKey of [
      studioKeys.reviewReports(queueDemoMode),
      studioKeys.reviewDisputes(queueDemoMode),
      studioKeys.reviewWithdrawn(queueDemoMode),
    ])
      void queryClient.invalidateQueries({ queryKey });
  if (demoMode) return;
  void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "release"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "track"] });
  // A dynamic import, so the admin chunk does not carry the Studio release
  // mutations (and the demo store they import).
  void import("../../studio/api/useStudioReleaseMutations")
    .then(({ refreshReleaseLists }) =>
      refreshReleaseLists(queryClient, false, undefined),
    )
    // A chunk load failure only delays the list refresh to the next read.
    .catch(() => undefined);
}

/** The demo keeps owner and upcoming lists in step with the written release
 *  (a dynamic import, as above, so the admin chunk stays free of it). */
function syncDemoLists(queryClient: QueryClient, release: StudioReleaseView) {
  void import("../../studio/api/useStudioReleaseMutations")
    .then(({ syncDemoReleaseLists }) =>
      syncDemoReleaseLists(queryClient, release, false),
    )
    // A chunk load failure only delays the list refresh to the next read.
    .catch(() => undefined);
}

/** GET /admin/studio/releases/:id. Demo reads the Studio fixture (dynamic
 *  import, so the admin chunk does not carry it) and falls back to a blank
 *  published release for a report whose subject is not in the fixture.
 *  `isSilent` keeps a failure out of the global error toast, for a reader
 *  with its own quiet fallback (the queue thumbnail). */
export function useStaffStudioRelease(
  releaseId: string,
  options: { isSilent?: boolean } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: staffReleaseKey(demoMode, releaseId),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    meta: options.isSilent ? { silentError: true } : undefined,
    queryFn: async (): Promise<StudioReleaseView> => {
      if (!demoMode)
        return toReleaseView(await getStaffStudioRelease(releaseId));
      const { demoStudioRelease } =
        await import("../../studio/api/studioDemoApi");
      try {
        return toReleaseView(demoStudioRelease(releaseId));
      } catch {
        return demoReleaseIn(releaseId, "published", null);
      }
    },
  });
}

export function useTakeDownStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    StudioReleaseView,
    unknown,
    { releaseId: string; reason: string }
  >({
    demoMode,
    mutationKey: ["admin-studio", "takedown"],
    demoResult: ({ releaseId, reason }) => {
      const current = queryClient.getQueryData<StudioReleaseView>(
        staffReleaseKey(demoMode, releaseId),
      );
      return current
        ? {
            ...demoWithdrawalStatus(current, "taken_down"),
            takedownReason: reason,
          }
        : demoReleaseIn(releaseId, "taken_down", reason);
    },
    live: async ({ releaseId, reason }) =>
      toReleaseView(await takeDownStudioRelease(releaseId, reason)),
    onSuccess: (release) => {
      queryClient.setQueryData(staffReleaseKey(demoMode, release.id), release);
      if (demoMode) syncDemoLists(queryClient, release);
      refreshStaffReviewQueues(queryClient, demoMode);
    },
  });
}

export function useRestoreStudioRelease() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    StudioReleaseView,
    unknown,
    { releaseId: string }
  >({
    demoMode,
    mutationKey: ["admin-studio", "restore"],
    // The moderation console shows the refusal itself, in the Studio error
    // map's words (a release with an open dispute restores from Disputes).
    meta: { silentError: true },
    // As the server: back to published only if it was live when taken down.
    demoResult: ({ releaseId }) => {
      const current = queryClient.getQueryData<StudioReleaseView>(
        staffReleaseKey(demoMode, releaseId),
      );
      if (!current) return demoReleaseIn(releaseId, "published", null);
      const status = current.publishedAt ? "published" : "draft";
      return {
        ...demoWithdrawalStatus(current, status),
        takedownReason: null,
      };
    },
    live: async ({ releaseId }) =>
      toReleaseView(await restoreStudioRelease(releaseId)),
    onSuccess: (release) => {
      queryClient.setQueryData(staffReleaseKey(demoMode, release.id), release);
      if (demoMode) syncDemoLists(queryClient, release);
      refreshStaffReviewQueues(queryClient, demoMode);
    },
  });
}
