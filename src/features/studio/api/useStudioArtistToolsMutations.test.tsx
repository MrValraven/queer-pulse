import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioArtistView, StudioReleaseView } from "./studio.adapters";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { demoCreateRelease, demoPublish } from "./studioDemoMutations";
import { studioKeys } from "./studioQueryKeys";
import {
  useAddStudioReleaseVersion,
  useMintStudioPreviewLink,
  useScheduleStudioRelease,
  useStudioReleaseReminder,
  useUnscheduleStudioRelease,
} from "./useStudioArtistToolsMutations";
import {
  useConfirmStudioTrackAudio,
  useUpdateStudioTrack,
} from "./useStudioTrackMutations";

const demoState = { demoMode: true };
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => demoState,
}));
const scheduleStudioRelease = vi.fn();
vi.mock("./studioArtistTools.api", () => ({
  scheduleStudioRelease: (...args: unknown[]) =>
    scheduleStudioRelease(...args) as unknown,
  unscheduleStudioRelease: vi.fn(),
  setStudioReleaseReminder: vi.fn(() => Promise.resolve()),
  clearStudioReleaseReminder: vi.fn(() => Promise.resolve()),
  createStudioReleaseVersion: vi.fn(),
  mintStudioPreviewLink: vi.fn(),
  revokeStudioPreviewLink: vi.fn(),
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function seed(queryClient: QueryClient, release: StudioReleaseView) {
  queryClient.setQueryData(studioKeys.release(true, release.id), release);
}

const draft = () =>
  demoCreateRelease({
    subprofileId: DEMO_ARTIST_MARIANA.id,
    type: "single",
    title: "Maré",
  });
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

beforeEach(() => {
  demoState.demoMode = true;
  scheduleStudioRelease.mockReset();
});

describe("scheduling", () => {
  it("schedules a demo draft and moves it into the artist's Upcoming list", async () => {
    const { queryClient, wrapper } = setup();
    const release = draft();
    seed(queryClient, release);
    const artistKey = studioKeys.artist(true, DEMO_ARTIST_MARIANA.id);
    queryClient.setQueryData<StudioArtistView>(artistKey, {
      artist: { id: DEMO_ARTIST_MARIANA.id } as StudioArtistView["artist"],
      coverUrl: null,
      heroLayout: "classic",
      allReleases: [],
      releases: [],
      singles: [],
      ownerReleases: [],
      isOwner: true,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
      supportLinks: [],
      upcoming: [],
    });
    const { result } = renderHook(() => useScheduleStudioRelease(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        releaseId: release.id,
        publishAt: inDays(2),
      }),
    );
    const cached = queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, release.id),
    );
    expect(cached?.status).toBe("scheduled");
    const view = queryClient.getQueryData<StudioArtistView>(artistKey);
    expect(view?.upcoming.map((card) => card.id)).toEqual([release.id]);
    expect(view?.ownerReleases?.[0]?.status).toBe("scheduled");
  });

  it("passes the server's refusal through in live mode", async () => {
    demoState.demoMode = false;
    scheduleStudioRelease.mockRejectedValue(
      new ApiError(422, "out", { code: "studio_schedule_out_of_range" }),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useScheduleStudioRelease(), {
      wrapper,
    });
    await expect(
      result.current.mutateAsync({ releaseId: "r1", publishAt: inDays(500) }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("unschedules a demo release back into a draft owner row", async () => {
    const { queryClient, wrapper } = setup();
    const release = draft();
    seed(queryClient, release);
    const artistKey = studioKeys.artist(true, DEMO_ARTIST_MARIANA.id);
    queryClient.setQueryData<StudioArtistView>(artistKey, {
      artist: { id: DEMO_ARTIST_MARIANA.id } as StudioArtistView["artist"],
      coverUrl: null,
      heroLayout: "classic",
      allReleases: [],
      releases: [],
      singles: [],
      ownerReleases: [],
      isOwner: true,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
      supportLinks: [],
      upcoming: [],
    });
    const schedule = renderHook(() => useScheduleStudioRelease(), {
      wrapper,
    });
    await act(() =>
      schedule.result.current.mutateAsync({
        releaseId: release.id,
        publishAt: inDays(2),
      }),
    );
    expect(
      queryClient
        .getQueryData<StudioArtistView>(artistKey)
        ?.upcoming.map((card) => card.id),
    ).toEqual([release.id]);
    const unschedule = renderHook(() => useUnscheduleStudioRelease(), {
      wrapper,
    });
    await act(() =>
      unschedule.result.current.mutateAsync({ releaseId: release.id }),
    );
    const view = queryClient.getQueryData<StudioArtistView>(artistKey);
    expect(view?.upcoming).toEqual([]);
    expect(view?.ownerReleases?.map((row) => row.id)).toEqual([release.id]);
    expect(view?.ownerReleases?.[0]?.status).toBe("draft");
    expect(view?.ownerReleases?.[0]?.publishAt).toBeNull();
  });
});

describe("Notify me", () => {
  it("writes the state into the release and the Upcoming card", async () => {
    const { queryClient, wrapper } = setup();
    const release = {
      ...draft(),
      status: "scheduled" as const,
      isUpcoming: true,
    };
    seed(queryClient, release);
    const artistKey = studioKeys.artist(true, "sp-other");
    queryClient.setQueryData<StudioArtistView>(artistKey, {
      artist: { id: "sp-other" } as StudioArtistView["artist"],
      coverUrl: null,
      heroLayout: "classic",
      allReleases: [],
      releases: [],
      singles: [],
      ownerReleases: null,
      isOwner: false,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
      supportLinks: [],
      upcoming: [{ ...release, publishAt: inDays(3), isReminderSet: false }],
    });
    const { result } = renderHook(() => useStudioReleaseReminder(), {
      wrapper,
    });
    act(() => result.current.mutate({ releaseId: release.id, isSet: true }));
    await waitFor(() =>
      expect(
        queryClient.getQueryData<StudioReleaseView>(
          studioKeys.release(true, release.id),
        )?.isReminderSet,
      ).toBe(true),
    );
    expect(
      queryClient.getQueryData<StudioArtistView>(artistKey)?.upcoming[0]
        ?.isReminderSet,
    ).toBe(true);
  });
});

describe("track changes and version notes", () => {
  it("raises the version note panel after a confirm on a published release, and a note clears it", async () => {
    const { queryClient, wrapper } = setup();
    const published = demoPublish(draft());
    seed(queryClient, published);
    const confirm = renderHook(() => useConfirmStudioTrackAudio(), {
      wrapper,
    });
    queryClient.setQueryData(studioKeys.track(true, "t-new"), {
      id: "t-new",
      position: 1,
      title: "New",
      durationSeconds: null,
      durationLabel: null,
      isExplicit: false,
      hasAudio: false,
      href: "/studio/track?id=t-new",
      savedId: "studio_track:t-new",
      releaseId: published.id,
      credits: [],
      lyricStanzas: [],
      release: published,
    });
    await act(() =>
      confirm.result.current.mutateAsync({
        trackId: "t-new",
        releaseId: published.id,
        key: "demo-audio:3200000:new.mp3",
      }),
    );
    const changed = queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, published.id),
    );
    expect(changed?.hasUnnotedChanges).toBe(true);
    const note = renderHook(() => useAddStudioReleaseVersion(), { wrapper });
    await act(() =>
      note.result.current.mutateAsync({
        releaseId: published.id,
        note: "Added a bonus track",
      }),
    );
    const noted = queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, published.id),
    );
    expect(noted?.hasUnnotedChanges).toBe(false);
    expect(noted?.version).toBe(2);
  });

  it("leaves the panel down after a title edit", async () => {
    const { queryClient, wrapper } = setup();
    const published = demoPublish(draft());
    seed(queryClient, published);
    queryClient.setQueryData(studioKeys.track(true, "t1"), {
      id: "t1",
      position: 1,
      title: "Old",
      durationSeconds: 200,
      durationLabel: "3:20",
      isExplicit: false,
      hasAudio: true,
      href: "/studio/track?id=t1",
      savedId: "studio_track:t1",
      releaseId: published.id,
      credits: [],
      lyricStanzas: [],
      release: published,
    });
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: published.id,
        body: { title: "New" },
      }),
    );
    expect(
      queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(true, published.id),
      )?.hasUnnotedChanges,
    ).toBe(false);
  });
});

describe("preview links", () => {
  it("mints a demo link on a draft and refuses a published release", async () => {
    const { queryClient, wrapper } = setup();
    const release = draft();
    seed(queryClient, release);
    const { result } = renderHook(() => useMintStudioPreviewLink(), {
      wrapper,
    });
    const link = await act(() =>
      result.current.mutateAsync({ releaseId: release.id }),
    );
    expect(link.token).toMatch(/^[0-9a-f]{64}$/);
    expect(
      queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(true, release.id),
      )?.previewToken,
    ).toBe(link.token);
    const published = demoPublish(draft());
    seed(queryClient, published);
    await expect(
      result.current.mutateAsync({ releaseId: published.id }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
