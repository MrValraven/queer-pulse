import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  toPlaylistEditorView,
  toPlaylistView,
  type StudioPlaylistEditorView,
  type StudioPlaylistView,
} from "./studio.adapters";
import type { StudioPlaylistDTO } from "./studio.types";
import { cardOfPlaylist } from "./studioPlaylistCache";
import { studioKeys } from "./studioQueryKeys";
import type { StudioPlaylistsPage } from "./useStudioMyPlaylists";
import {
  playlistRefreshIntervalOf,
  useStudioPlaylist,
} from "./useStudioPlaylist";
import {
  useInviteStudioPlaylistEditors,
  useLeaveStudioPlaylist,
  useRemoveStudioPlaylistEditor,
  useRespondStudioPlaylistInvite,
} from "./useStudioPlaylistEditorMutations";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));
const editorsApi = vi.hoisted(() => ({
  getStudioPlaylistEditors: vi.fn(),
  inviteStudioPlaylistEditors: vi.fn(),
  removeStudioPlaylistEditor: vi.fn(),
  leaveStudioPlaylist: vi.fn(),
  respondStudioPlaylistInvite: vi.fn(),
  getStudioPlaylistEditorCandidates: vi.fn(),
}));
vi.mock("./studioPlaylistEditors.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioPlaylistEditors.api")>()),
  ...editorsApi,
}));
const playlistsApi = vi.hoisted(() => ({ getStudioPlaylist: vi.fn() }));
vi.mock("./studioPlaylists.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioPlaylists.api")>()),
  ...playlistsApi,
}));

const sara = {
  slug: "sara-marques",
  displayName: "Sara Marques",
  avatarUrl: null,
};

function playlistDto(
  overrides: Partial<StudioPlaylistDTO> = {},
): StudioPlaylistDTO {
  return {
    id: "playlist-1",
    name: "Night bus",
    credit: {
      persona: null,
      member: {
        id: "member-1",
        slug: "tiago",
        displayName: "Tiago Costa",
        avatarUrl: null,
      },
    },
    coverUrls: [],
    trackCount: 0,
    totalDurationSeconds: 0,
    updatedAt: "2026-10-14T10:00:00.000Z",
    isOwner: false,
    role: "editor",
    editorCount: 1,
    visibility: null,
    description: null,
    creditSubprofileId: null,
    entries: [],
    invite: null,
    ...overrides,
  };
}

const newClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

type MinePages = InfiniteData<StudioPlaylistsPage, string | null>;
const minePages = (items: StudioPlaylistsPage["items"]): MinePages => ({
  pages: [{ items, nextCursor: null }],
  pageParams: [null],
});

beforeEach(() => {
  for (const mock of [
    ...Object.values(editorsApi),
    ...Object.values(playlistsApi),
  ])
    mock.mockReset();
});
afterEach(() => vi.useRealTimers());

describe("playlist freshness", () => {
  it("reads a collaborative playlist again every 30 seconds and a solo one never", () => {
    expect(playlistRefreshIntervalOf(toPlaylistView(playlistDto()))).toBe(
      30_000,
    );
    expect(
      playlistRefreshIntervalOf(
        toPlaylistView(
          playlistDto({ role: "owner", isOwner: true, editorCount: 0 }),
        ),
      ),
    ).toBe(false);
    expect(
      playlistRefreshIntervalOf(
        toPlaylistView(playlistDto({ role: null, editorCount: null })),
      ),
    ).toBe(false);
    expect(playlistRefreshIntervalOf(undefined)).toBe(false);
  });

  it("reads an open collaborative playlist again after 30 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    playlistsApi.getStudioPlaylist.mockResolvedValue(playlistDto());
    const { result } = renderHook(() => useStudioPlaylist("playlist-1"), {
      wrapper: wrapperFor(newClient()),
    });
    await waitFor(() =>
      expect(result.current.playlist?.isCollaborative).toBe(true),
    );
    expect(playlistsApi.getStudioPlaylist).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await waitFor(() =>
      expect(playlistsApi.getStudioPlaylist).toHaveBeenCalledTimes(2),
    );
  });

  it("shows not found when a refetch of a loaded playlist answers 404", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const queryClient = newClient();
    playlistsApi.getStudioPlaylist.mockResolvedValueOnce(playlistDto());
    playlistsApi.getStudioPlaylist.mockRejectedValue(
      new ApiError(404, "not found", {
        statusCode: 404,
        code: "studio_playlist_not_found",
      }),
    );
    const { result } = renderHook(() => useStudioPlaylist("playlist-1"), {
      wrapper: wrapperFor(queryClient),
    });
    await waitFor(() =>
      expect(result.current.playlist?.isCollaborative).toBe(true),
    );
    expect(result.current.loadState.isNotFound).toBe(false);
    await act(async () => {
      await queryClient.refetchQueries({
        queryKey: studioKeys.playlist(false, "playlist-1"),
      });
    });
    await waitFor(() => expect(result.current.loadState.isNotFound).toBe(true));
    expect(result.current.playlist).toBeNull();
    expect(result.current.loadState.isError).toBe(false);
    // The 404 also stops the 30 second reads.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(playlistsApi.getStudioPlaylist).toHaveBeenCalledTimes(2);
  });
});

describe("editor writes", () => {
  it("writes the answered list to the editors cache and reads the playlist again", async () => {
    const queryClient = newClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    editorsApi.inviteStudioPlaylistEditors.mockResolvedValue({
      items: [
        {
          editorId: "editor-1",
          member: sara,
          status: "invited",
          source: "member_invite",
          invitedAt: "2026-10-14T10:00:00.000Z",
        },
      ],
    });
    const { result } = renderHook(() => useInviteStudioPlaylistEditors(), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        memberSlugs: ["sara-marques"],
      });
    });
    const cached = queryClient.getQueryData<StudioPlaylistEditorView[]>(
      studioKeys.playlistEditors(false, "playlist-1"),
    );
    expect(cached?.map((editor) => editor.person.slug)).toEqual([
      "sara-marques",
    ]);
    expect(cached?.[0]?.isPending).toBe(true);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: studioKeys.playlist(false, "playlist-1"),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: studioKeys.myPlaylists(false),
    });
  });

  it("drops a removed editor from the cached list only once the server agrees", async () => {
    const queryClient = newClient();
    const editorsKey = studioKeys.playlistEditors(false, "playlist-1");
    queryClient.setQueryData(editorsKey, [
      toPlaylistEditorView({
        editorId: "editor-1",
        member: sara,
        status: "active",
        source: "member_invite",
        invitedAt: "2026-10-14T10:00:00.000Z",
      }),
    ]);
    const { result } = renderHook(() => useRemoveStudioPlaylistEditor(), {
      wrapper: wrapperFor(queryClient),
    });
    editorsApi.removeStudioPlaylistEditor.mockRejectedValueOnce(
      new ApiError(500, "boom"),
    );
    await act(async () => {
      await result.current
        .mutateAsync({
          playlistId: "playlist-1",
          editorId: "editor-1",
          memberSlug: "sara-marques",
        })
        .catch(() => undefined);
    });
    expect(
      queryClient.getQueryData<StudioPlaylistEditorView[]>(editorsKey),
    ).toHaveLength(1);
    editorsApi.removeStudioPlaylistEditor.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        editorId: "editor-1",
        memberSlug: "sara-marques",
      });
    });
    expect(
      queryClient.getQueryData<StudioPlaylistEditorView[]>(editorsKey),
    ).toEqual([]);
    expect(editorsApi.removeStudioPlaylistEditor).toHaveBeenLastCalledWith(
      "playlist-1",
      "editor-1",
    );
  });

  it("settles a remove of a row id the server does not know as a removal", async () => {
    const queryClient = newClient();
    const editorsKey = studioKeys.playlistEditors(false, "playlist-1");
    queryClient.setQueryData(editorsKey, [
      toPlaylistEditorView({
        editorId: "editor-2",
        member: { slug: "", displayName: "Former member", avatarUrl: null },
        status: "active",
        source: "member_invite",
        invitedAt: "2026-10-14T10:00:00.000Z",
      }),
    ]);
    editorsApi.removeStudioPlaylistEditor.mockRejectedValueOnce(
      new ApiError(404, "gone", {
        statusCode: 404,
        code: "studio_playlist_editor_not_found",
      }),
    );
    const { result } = renderHook(() => useRemoveStudioPlaylistEditor(), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        editorId: "editor-2",
        memberSlug: "",
      });
    });
    expect(
      queryClient.getQueryData<StudioPlaylistEditorView[]>(editorsKey),
    ).toEqual([]);
  });

  it("puts an accepted playlist at the top of your playlists", async () => {
    const queryClient = newClient();
    queryClient.setQueryData(studioKeys.myPlaylists(false), minePages([]));
    editorsApi.respondStudioPlaylistInvite.mockResolvedValue(playlistDto());
    const { result } = renderHook(() => useRespondStudioPlaylistInvite(), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        response: "accept",
      });
    });
    const mine = queryClient.getQueryData<MinePages>(
      studioKeys.myPlaylists(false),
    );
    expect(mine?.pages[0]?.items.map((card) => card.id)).toEqual([
      "playlist-1",
    ]);
    expect(
      queryClient.getQueryData<StudioPlaylistView>(
        studioKeys.playlist(false, "playlist-1"),
      )?.role,
    ).toBe("editor");
  });

  it("drops a declined or a left playlist from your playlists", async () => {
    const queryClient = newClient();
    const card = cardOfPlaylist(toPlaylistView(playlistDto()));
    const otherCard = { ...card, id: "playlist-2" };
    queryClient.setQueryData(
      studioKeys.myPlaylists(false),
      minePages([card, otherCard]),
    );
    editorsApi.respondStudioPlaylistInvite.mockResolvedValue(undefined);
    editorsApi.leaveStudioPlaylist.mockResolvedValue(undefined);
    const respond = renderHook(() => useRespondStudioPlaylistInvite(), {
      wrapper: wrapperFor(queryClient),
    });
    const leave = renderHook(() => useLeaveStudioPlaylist(), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await respond.result.current.mutateAsync({
        playlistId: "playlist-1",
        response: "decline",
      });
      await leave.result.current.mutateAsync({ playlistId: "playlist-2" });
    });
    expect(
      queryClient.getQueryData<MinePages>(studioKeys.myPlaylists(false))
        ?.pages[0]?.items,
    ).toEqual([]);
  });

  it("reads the playlist again when the invite is gone", async () => {
    const queryClient = newClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    editorsApi.respondStudioPlaylistInvite.mockRejectedValue(
      new ApiError(409, "gone", {
        statusCode: 409,
        code: "studio_playlist_invite_unavailable",
      }),
    );
    const { result } = renderHook(() => useRespondStudioPlaylistInvite(), {
      wrapper: wrapperFor(queryClient),
    });
    await act(async () => {
      await result.current
        .mutateAsync({ playlistId: "playlist-1", response: "accept" })
        .catch(() => undefined);
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: studioKeys.playlist(false, "playlist-1"),
    });
  });
});

describe("leaving a playlist", () => {
  it("settles a leave as left when the seat already ended", async () => {
    for (const [status, code] of [
      [403, "studio_playlist_owner_only"],
      [404, "studio_playlist_not_found"],
    ] as const) {
      const queryClient = newClient();
      const card = cardOfPlaylist(toPlaylistView(playlistDto()));
      queryClient.setQueryData(
        studioKeys.myPlaylists(false),
        minePages([card]),
      );
      editorsApi.leaveStudioPlaylist.mockRejectedValueOnce(
        new ApiError(status, "seat ended", { statusCode: status, code }),
      );
      const { result } = renderHook(() => useLeaveStudioPlaylist(), {
        wrapper: wrapperFor(queryClient),
      });
      await act(async () => {
        await result.current.mutateAsync({ playlistId: "playlist-1" });
      });
      expect(
        queryClient.getQueryData<MinePages>(studioKeys.myPlaylists(false))
          ?.pages[0]?.items,
      ).toEqual([]);
    }
  });

  it("still fails a leave on any other refusal", async () => {
    editorsApi.leaveStudioPlaylist.mockRejectedValueOnce(
      new ApiError(500, "boom"),
    );
    const { result } = renderHook(() => useLeaveStudioPlaylist(), {
      wrapper: wrapperFor(newClient()),
    });
    await expect(
      result.current.mutateAsync({ playlistId: "playlist-1" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
