import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  VjClipDTO,
  VjEventOptionListDTO,
  VjPackClipsDTO,
  VjPackDTO,
  VjPackEventDTO,
} from "../../../shared/contracts/vj";
import { demoSetVjPackEvent, demoUpdateVjClip } from "../demo/vjDemoStore";
import { vjRefusal } from "../demo/vjDemoRefusals";
import { vjReasonOf } from "../vjErrors";
import { useSetVjPackEvent } from "./useSetVjPackEvent";
import { useVjClipFavorite } from "./useVjClipFavorite";
import {
  patchVjClipCaches,
  useUpdateVjClip,
  vjClipPatchOf,
} from "./useVjClipMutations";
import { vjKeys } from "./vjKeys";

const CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const OTHER_CLIP_ID = "00000000-0000-4000-8000-0000000000c2";
const PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const OTHER_PACK_ID = "00000000-0000-4000-8000-0000000000a2";
const EVENT_ID = "00000000-0000-4000-8000-0000000000e1";
const CREATED_AT = "2026-11-06T20:00:00.000Z";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoUpdateVjClip: vi.fn(),
    demoSetVjPackEvent: vi.fn(),
  };
});

function buildClip(clipId: string, overrides: Partial<VjClipDTO> = {}) {
  return {
    id: clipId,
    title: `Clip ${clipId}`,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1024,
    width: 1920,
    height: 1080,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: "https://media.test/thumb.jpg",
    mediaUrl: "https://media.test/clip.mp4",
    packIds: [PACK_ID, OTHER_PACK_ID],
    packCount: 2,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
    setlistItemCount: 0,
    ...overrides,
  } satisfies VjClipDTO;
}

function buildPack(packId: string, overrides: Partial<VjPackDTO> = {}) {
  return {
    id: packId,
    name: `Pack ${packId}`,
    position: 0,
    clipCount: 2,
    totalByteSize: 2048,
    coverThumbnailUrl: null,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    event: null,
    ...overrides,
  } satisfies VjPackDTO;
}

const LINKED_EVENT = {
  id: EVENT_ID,
  title: "Closing party",
  startAt: CREATED_AT,
  isAvailable: true,
};

const PACK_EVENT: VjPackEventDTO = {
  packId: PACK_ID,
  card: null,
  unavailableReason: null,
};

const UPCOMING_EVENTS: VjEventOptionListDTO = {
  items: [
    {
      id: EVENT_ID,
      title: "Closing party",
      startAt: CREATED_AT,
      endAt: null,
      area: "Intendente",
      isOnline: false,
    },
  ],
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

/** The clip list and two pack lists that both hold the clip. */
function seedClipCaches(queryClient: QueryClient): void {
  queryClient.setQueryData(vjKeys.clips(true), [
    buildClip(CLIP_ID),
    buildClip(OTHER_CLIP_ID),
  ]);
  for (const packId of [PACK_ID, OTHER_PACK_ID]) {
    queryClient.setQueryData<VjPackClipsDTO>(vjKeys.packClips(packId, true), {
      pack: buildPack(packId),
      items: [buildClip(CLIP_ID), buildClip(OTHER_CLIP_ID)],
    });
  }
}

function cachedClipsOf(queryClient: QueryClient): VjClipDTO[] {
  const listed = queryClient.getQueryData<VjClipDTO[]>(vjKeys.clips(true));
  const packed = [PACK_ID, OTHER_PACK_ID].flatMap(
    (packId) =>
      queryClient.getQueryData<VjPackClipsDTO>(vjKeys.packClips(packId, true))
        ?.items ?? [],
  );
  return [...(listed ?? []), ...packed].filter((clip) => clip.id === CLIP_ID);
}

function favoritesOf(queryClient: QueryClient): boolean[] {
  return cachedClipsOf(queryClient).map((clip) => clip.isFavorite);
}

beforeEach(() => {
  vi.mocked(demoUpdateVjClip).mockReset();
  vi.mocked(demoUpdateVjClip).mockImplementation((clipId, body) =>
    buildClip(clipId, body as Partial<VjClipDTO>),
  );
  vi.mocked(demoSetVjPackEvent).mockReset();
});

describe("clip updates (demo)", () => {
  it("sends only the defaults the caller set", async () => {
    expect(vjClipPatchOf({ clipId: CLIP_ID, defaultSpeed: 2 })).toEqual({
      defaultSpeed: 2,
    });
    const { result } = renderHook(() => useUpdateVjClip(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await act(async () => {
      await result.current.mutateAsync({
        clipId: CLIP_ID,
        defaultSpeed: 2,
        loopMode: "pingPong",
      });
    });
    expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
      defaultSpeed: 2,
      loopMode: "pingPong",
    });
  });

  it("keeps a null loop point in the body", async () => {
    expect(
      vjClipPatchOf({ clipId: CLIP_ID, loopInMs: null, loopOutMs: 4000 }),
    ).toEqual({ loopInMs: null, loopOutMs: 4000 });
    const { result } = renderHook(() => useUpdateVjClip(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await act(async () => {
      await result.current.mutateAsync({
        clipId: CLIP_ID,
        loopInMs: null,
        loopOutMs: null,
      });
    });
    expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
      loopInMs: null,
      loopOutMs: null,
    });
  });

  it("updates the clip inside every cached pack", async () => {
    const queryClient = createQueryClient();
    seedClipCaches(queryClient);
    const { result } = renderHook(() => useUpdateVjClip(), {
      wrapper: createWrapper(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({ clipId: CLIP_ID, title: "Neon rain" });
    });
    const titles = cachedClipsOf(queryClient).map((clip) => clip.title);
    expect(titles).toEqual(["Neon rain", "Neon rain", "Neon rain"]);
    const otherTitles = (
      queryClient.getQueryData<VjPackClipsDTO>(vjKeys.packClips(PACK_ID, true))
        ?.items ?? []
    )
      .filter((clip) => clip.id === OTHER_CLIP_ID)
      .map((clip) => clip.title);
    expect(otherTitles).toEqual([`Clip ${OTHER_CLIP_ID}`]);
  });
});

describe("clip favorite (demo)", () => {
  it("flips the star at once", async () => {
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.mocked(demoUpdateVjClip).mockImplementation(
      (clipId, body) =>
        held.then(() =>
          buildClip(clipId, body as Partial<VjClipDTO>),
        ) as unknown as VjClipDTO,
    );
    const queryClient = createQueryClient();
    seedClipCaches(queryClient);
    const { result } = renderHook(() => useVjClipFavorite(), {
      wrapper: createWrapper(queryClient),
    });
    act(() => {
      result.current.mutate({ clipId: CLIP_ID, isFavorite: true });
    });
    await waitFor(() =>
      expect(favoritesOf(queryClient)).toEqual([true, true, true]),
    );
    expect(demoUpdateVjClip).toHaveBeenCalledWith(CLIP_ID, {
      isFavorite: true,
    });
    await act(async () => {
      release();
      await held;
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(favoritesOf(queryClient)).toEqual([true, true, true]);
  });

  it("rolls the star back when the server refuses", async () => {
    let refuse: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      refuse = resolve;
    });
    vi.mocked(demoUpdateVjClip).mockImplementation(
      () =>
        held.then(() => {
          throw vjRefusal("VJ_CLIP_FAVORITE_INVALID");
        }) as unknown as VjClipDTO,
    );
    const queryClient = createQueryClient();
    seedClipCaches(queryClient);
    const { result } = renderHook(() => useVjClipFavorite(), {
      wrapper: createWrapper(queryClient),
    });
    act(() => {
      result.current.mutate({ clipId: CLIP_ID, isFavorite: true });
    });
    await waitFor(() =>
      expect(favoritesOf(queryClient)).toEqual([true, true, true]),
    );
    await act(async () => {
      refuse();
      await held.catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(favoritesOf(queryClient)).toEqual([false, false, false]);
    expect(vjReasonOf(result.current.error)).toBe("VJ_CLIP_FAVORITE_INVALID");
  });

  it("flips back only the star when a refusal lands after a newer write", async () => {
    let refuse: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      refuse = resolve;
    });
    vi.mocked(demoUpdateVjClip).mockImplementation(
      () =>
        held.then(() => {
          throw vjRefusal("VJ_CLIP_FAVORITE_INVALID");
        }) as unknown as VjClipDTO,
    );
    const queryClient = createQueryClient();
    seedClipCaches(queryClient);
    const { result } = renderHook(() => useVjClipFavorite(), {
      wrapper: createWrapper(queryClient),
    });
    act(() => {
      result.current.mutate({ clipId: CLIP_ID, isFavorite: true });
    });
    await waitFor(() =>
      expect(favoritesOf(queryClient)).toEqual([true, true, true]),
    );
    // A rename lands while the star is still on its way.
    patchVjClipCaches(queryClient, true, CLIP_ID, (clip) => ({
      ...clip,
      title: "Neon rain",
    }));
    await act(async () => {
      refuse();
      await held.catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(favoritesOf(queryClient)).toEqual([false, false, false]);
    expect(cachedClipsOf(queryClient).map((clip) => clip.title)).toEqual([
      "Neon rain",
      "Neon rain",
      "Neon rain",
    ]);
  });

  it("keeps a newer unstar when the earlier star is refused", async () => {
    let refuse: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      refuse = resolve;
    });
    vi.mocked(demoUpdateVjClip).mockImplementationOnce(
      () =>
        held.then(() => {
          throw vjRefusal("VJ_CLIP_FAVORITE_INVALID");
        }) as unknown as VjClipDTO,
    );
    const queryClient = createQueryClient();
    seedClipCaches(queryClient);
    const { result } = renderHook(() => useVjClipFavorite(), {
      wrapper: createWrapper(queryClient),
    });
    act(() => {
      result.current.mutate({ clipId: CLIP_ID, isFavorite: true });
    });
    await waitFor(() =>
      expect(favoritesOf(queryClient)).toEqual([true, true, true]),
    );
    await act(async () => {
      await result.current.mutateAsync({ clipId: CLIP_ID, isFavorite: false });
    });
    expect(favoritesOf(queryClient)).toEqual([false, false, false]);
    await act(async () => {
      refuse();
      await held.catch(() => undefined);
      // Lets the refused star's rollback run.
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    });
    expect(favoritesOf(queryClient)).toEqual([false, false, false]);
  });
});

describe("pack event link (demo)", () => {
  function seedPackCaches(queryClient: QueryClient): void {
    queryClient.setQueryData(vjKeys.packs(true), [
      buildPack(PACK_ID),
      buildPack(OTHER_PACK_ID),
    ]);
    queryClient.setQueryData(vjKeys.packEvent(PACK_ID, true), PACK_EVENT);
    queryClient.setQueryData(vjKeys.upcomingEvents(true), UPCOMING_EVENTS);
  }

  it("links an event and puts the answer in the pack list", async () => {
    vi.mocked(demoSetVjPackEvent).mockImplementation(() =>
      buildPack(PACK_ID, { event: LINKED_EVENT }),
    );
    const queryClient = createQueryClient();
    seedPackCaches(queryClient);
    const { result } = renderHook(() => useSetVjPackEvent(), {
      wrapper: createWrapper(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({ packId: PACK_ID, eventId: EVENT_ID });
    });
    expect(demoSetVjPackEvent).toHaveBeenCalledWith(PACK_ID, {
      eventId: EVENT_ID,
    });
    const packs = queryClient.getQueryData<VjPackDTO[]>(vjKeys.packs(true));
    expect(packs?.map((pack) => pack.event?.id ?? null)).toEqual([
      EVENT_ID,
      null,
    ]);
    expect(
      queryClient.getQueryState(vjKeys.packEvent(PACK_ID, true))?.isInvalidated,
    ).toBe(true);
  });

  it("unlinks with eventId null", async () => {
    vi.mocked(demoSetVjPackEvent).mockImplementation(() =>
      buildPack(PACK_ID, { event: null }),
    );
    const queryClient = createQueryClient();
    queryClient.setQueryData(vjKeys.packs(true), [
      buildPack(PACK_ID, { event: LINKED_EVENT }),
    ]);
    const { result } = renderHook(() => useSetVjPackEvent(), {
      wrapper: createWrapper(queryClient),
    });
    await act(async () => {
      await result.current.mutateAsync({ packId: PACK_ID, eventId: null });
    });
    expect(demoSetVjPackEvent).toHaveBeenCalledWith(PACK_ID, {
      eventId: null,
    });
    const packs = queryClient.getQueryData<VjPackDTO[]>(vjKeys.packs(true));
    expect(packs?.[0]?.event).toBeNull();
  });

  it("a refused link reads the upcoming events again", async () => {
    vi.mocked(demoSetVjPackEvent).mockImplementation(() => {
      throw vjRefusal("VJ_EVENT_NOT_LINKABLE");
    });
    const queryClient = createQueryClient();
    seedPackCaches(queryClient);
    const { result } = renderHook(() => useSetVjPackEvent(), {
      wrapper: createWrapper(queryClient),
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ packId: PACK_ID, eventId: EVENT_ID }),
      ).rejects.toMatchObject({ data: { code: "VJ_EVENT_NOT_LINKABLE" } });
    });
    expect(
      queryClient.getQueryState(vjKeys.upcomingEvents(true))?.isInvalidated,
    ).toBe(true);
    const packs = queryClient.getQueryData<VjPackDTO[]>(vjKeys.packs(true));
    expect(packs?.[0]?.event).toBeNull();
  });
});
