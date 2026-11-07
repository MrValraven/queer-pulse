import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  createVjStageState,
  vjSceneLookOf,
  type VjClipMediaListDTO,
  type VjEventOptionListDTO,
  type VjPackEventDTO,
  type VjSceneDTO,
  type VjSceneListDTO,
  type VjSetlistListDTO,
} from "../../../shared/contracts/vj";
import {
  demoGetVjClipsMedia,
  demoGetVjPackEvent,
  demoGetVjScenes,
  demoGetVjSetlists,
  demoGetVjUpcomingEvents,
} from "../demo/vjDemoStore";
import { useVjClipsMediaFetcher } from "./useVjClipsMediaFetcher";
import { useVjPackEvent } from "./useVjPackEvent";
import { selectVjScenesForPack, useVjScenes } from "./useVjScenes";
import { useVjSetlists } from "./useVjSetlists";
import { useVjUpcomingEvents } from "./useVjUpcomingEvents";
import { vjKeys } from "./vjKeys";

const PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const OTHER_PACK_ID = "00000000-0000-4000-8000-0000000000a2";
const CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const EVENT_ID = "00000000-0000-4000-8000-0000000000e1";
const CREATED_AT = "2026-11-06T20:00:00.000Z";

function buildScene(
  sceneId: string,
  packId: string | null,
  position: number,
): VjSceneDTO {
  return {
    id: sceneId,
    name: `Scene ${sceneId}`,
    packId,
    position,
    look: vjSceneLookOf(createVjStageState("epoch-1", 0)),
    setlistItemCount: 0,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

/** Out of order on purpose: the hooks own the position order. */
const SCENES: VjSceneDTO[] = [
  buildScene("scene-pack-late", PACK_ID, 3),
  buildScene("scene-unfiled-late", null, 4),
  buildScene("scene-other", OTHER_PACK_ID, 0),
  buildScene("scene-pack-early", PACK_ID, 1),
  buildScene("scene-unfiled-early", null, 2),
];

const SETLISTS: VjSetlistListDTO = {
  items: [
    {
      id: "setlist-1",
      name: "Friday",
      position: 0,
      items: [
        { id: "item-1", sceneId: "scene-pack-early", position: 0 },
        { id: "item-2", sceneId: "scene-unfiled-early", position: 1 },
      ],
      createdBy: null,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
  ],
};

const PACK_EVENT: VjPackEventDTO = {
  packId: PACK_ID,
  card: {
    eventId: EVENT_ID,
    title: "Closing party",
    startAt: CREATED_AT,
    endAt: null,
    timezone: "Europe/Lisbon",
    area: "Intendente",
    isOnline: false,
    publicUrl: null,
  },
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

const CLIPS_MEDIA: VjClipMediaListDTO = {
  items: [
    {
      clipId: CLIP_ID,
      url: "https://media.test/clip.mp4",
      expiresAt: CREATED_AT,
      mimeType: "video/mp4",
      byteSize: 1024,
    },
  ],
};

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoGetVjScenes: vi.fn(),
    demoGetVjSetlists: vi.fn(),
    demoGetVjPackEvent: vi.fn(),
    demoGetVjUpcomingEvents: vi.fn(),
    demoGetVjClipsMedia: vi.fn(),
  };
});

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

function idsOf(scenes: readonly VjSceneDTO[] | undefined): string[] {
  return (scenes ?? []).map((scene) => scene.id);
}

beforeEach(() => {
  vi.mocked(demoGetVjScenes).mockReset();
  vi.mocked(demoGetVjScenes).mockImplementation((): VjSceneListDTO => ({
    items: SCENES,
  }));
  vi.mocked(demoGetVjSetlists).mockReset();
  vi.mocked(demoGetVjSetlists).mockImplementation(() => SETLISTS);
  vi.mocked(demoGetVjPackEvent).mockReset();
  vi.mocked(demoGetVjPackEvent).mockImplementation(() => PACK_EVENT);
  vi.mocked(demoGetVjUpcomingEvents).mockReset();
  vi.mocked(demoGetVjUpcomingEvents).mockImplementation(() => UPCOMING_EVENTS);
  vi.mocked(demoGetVjClipsMedia).mockReset();
  vi.mocked(demoGetVjClipsMedia).mockImplementation(() => CLIPS_MEDIA);
});

describe("VJ show reads (demo)", () => {
  it("scenes come back in position order", async () => {
    const { result } = renderHook(() => useVjScenes(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(idsOf(result.current.data)).toEqual([
      "scene-other",
      "scene-pack-early",
      "scene-unfiled-early",
      "scene-pack-late",
      "scene-unfiled-late",
    ]);
  });

  it("a pack view lists the pack's scenes, then the unfiled ones", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        packView: useVjScenes({ packId: PACK_ID }),
        unfiledView: useVjScenes({ packId: null }),
        everyScene: useVjScenes(),
      }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => {
      expect(result.current.packView.isSuccess).toBe(true);
      expect(result.current.unfiledView.isSuccess).toBe(true);
      expect(result.current.everyScene.isSuccess).toBe(true);
    });
    expect(idsOf(result.current.packView.data)).toEqual([
      "scene-pack-early",
      "scene-pack-late",
      "scene-unfiled-early",
      "scene-unfiled-late",
    ]);
    expect(idsOf(result.current.unfiledView.data)).toEqual([
      "scene-unfiled-early",
      "scene-unfiled-late",
    ]);
    expect(idsOf(selectVjScenesForPack(SCENES, OTHER_PACK_ID))).toEqual([
      "scene-other",
      "scene-unfiled-early",
      "scene-unfiled-late",
    ]);
    // Every view reads one cache entry, filled by one store read.
    expect(
      queryClient.getQueryCache().findAll({ queryKey: vjKeys.scenes(true) }),
    ).toHaveLength(1);
    expect(vi.mocked(demoGetVjScenes)).toHaveBeenCalledTimes(1);
  });

  it("set lists come back with their items", async () => {
    const { result } = renderHook(() => useVjSetlists(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.items.map((item) => item.sceneId)).toEqual(
      ["scene-pack-early", "scene-unfiled-early"],
    );
  });

  it("the pack event query waits for a pack", async () => {
    const { result, rerender } = renderHook(
      ({ packId }: { packId: string | null }) => useVjPackEvent(packId),
      {
        wrapper: createWrapper(createQueryClient()),
        initialProps: { packId: null as string | null },
      },
    );
    expect(result.current.fetchStatus).toBe("idle");
    expect(vi.mocked(demoGetVjPackEvent)).not.toHaveBeenCalled();

    rerender({ packId: PACK_ID });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(demoGetVjPackEvent)).toHaveBeenCalledWith(PACK_ID);
    expect(result.current.data?.card?.eventId).toBe(EVENT_ID);
  });

  it("the pack event query stays idle while it is turned off", () => {
    const { result } = renderHook(
      () => useVjPackEvent(PACK_ID, { isEnabled: false }),
      { wrapper: createWrapper(createQueryClient()) },
    );
    expect(result.current.fetchStatus).toBe("idle");
    expect(vi.mocked(demoGetVjPackEvent)).not.toHaveBeenCalled();
  });

  it("upcoming events read once and stay fresh in demo", async () => {
    const queryClient = createQueryClient();
    const { result, rerender } = renderHook(
      () => ({
        picker: useVjUpcomingEvents(),
        secondPicker: useVjUpcomingEvents(),
      }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => expect(result.current.picker.isSuccess).toBe(true));
    rerender();
    expect(result.current.secondPicker.data).toEqual(UPCOMING_EVENTS.items);
    expect(result.current.picker.isStale).toBe(false);
    expect(vi.mocked(demoGetVjUpcomingEvents)).toHaveBeenCalledTimes(1);
  });

  it("clip media is fetched on every call and never cached", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useVjClipsMediaFetcher(), {
      wrapper: createWrapper(queryClient),
    });
    let firstAnswer: VjClipMediaListDTO | null = null;
    let secondAnswer: VjClipMediaListDTO | null = null;
    await act(async () => {
      firstAnswer = await result.current([CLIP_ID]);
      secondAnswer = await result.current([CLIP_ID]);
    });
    expect(firstAnswer).toEqual(CLIPS_MEDIA);
    expect(secondAnswer).toEqual(CLIPS_MEDIA);
    expect(vi.mocked(demoGetVjClipsMedia)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(demoGetVjClipsMedia)).toHaveBeenCalledWith([CLIP_ID]);
    const cachedKeys = queryClient
      .getQueryCache()
      .getAll()
      .map((query) => JSON.stringify(query.queryKey));
    expect(cachedKeys.some((key) => key.includes("media"))).toBe(false);
  });
});
