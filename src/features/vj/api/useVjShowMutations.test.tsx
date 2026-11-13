import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  createVjStageState,
  vjSceneLookOf,
  type VjSceneDTO,
  type VjSetlistDTO,
} from "../../../shared/contracts/vj";
import {
  demoCreateVjScene,
  demoCreateVjSetlist,
  demoDeleteVjScene,
  demoDeleteVjSetlist,
  demoReorderVjScenes,
  demoReorderVjSetlists,
  demoSetVjSetlistItems,
  demoUpdateVjScene,
  demoUpdateVjSetlist,
} from "../demo/vjDemoStore";
import { vjRefusal } from "../demo/vjDemoRefusals";
import { vjErrorKeyOf } from "../vjErrors";
import { useVjIsWriting } from "./useVjPackMutations";
import { useVjSceneMutations } from "./useVjSceneMutations";
import { useVjSetlistMutations } from "./useVjSetlistMutations";
import { vjKeys } from "./vjKeys";

const PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const CREATED_AT = "2026-11-06T20:00:00.000Z";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoCreateVjScene: vi.fn(),
    demoUpdateVjScene: vi.fn(),
    demoReorderVjScenes: vi.fn(),
    demoDeleteVjScene: vi.fn(),
    demoCreateVjSetlist: vi.fn(),
    demoUpdateVjSetlist: vi.fn(),
    demoReorderVjSetlists: vi.fn(),
    demoSetVjSetlistItems: vi.fn(),
    demoDeleteVjSetlist: vi.fn(),
  };
});

function buildScene(
  sceneId: string,
  position: number,
  packId: string | null = PACK_ID,
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

function buildSetlist(
  setlistId: string,
  position: number,
  sceneIds: string[] = [],
): VjSetlistDTO {
  return {
    id: setlistId,
    name: `Set list ${setlistId}`,
    position,
    isLooping: false,
    stepDuration: { kind: "seconds", value: 8 },
    items: sceneIds.map((sceneId, itemIndex) => ({
      id: `${setlistId}-item-${itemIndex}`,
      position: itemIndex,
      kind: "scene",
      sceneId,
      clipId: null,
      duration: null,
    })),
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

const SCENE_ONE = buildScene("scene-1", 0);
const SCENE_TWO = buildScene("scene-2", 1);
const SETLIST_ONE = buildSetlist("setlist-1", 0, ["scene-1"]);
const SETLIST_TWO = buildSetlist("setlist-2", 1);

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** A client whose scene and set list caches already hold the fixtures (demo). */
function seededQueryClient(): QueryClient {
  const queryClient = createQueryClient();
  queryClient.setQueryData(vjKeys.scenes(true), [SCENE_ONE, SCENE_TWO]);
  queryClient.setQueryData(vjKeys.setlists(true), [SETLIST_ONE, SETLIST_TWO]);
  return queryClient;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

function renderShowWrites(queryClient: QueryClient) {
  return renderHook(
    () => ({
      scenes: useVjSceneMutations(),
      setlists: useVjSetlistMutations(),
      isWriting: useVjIsWriting(),
    }),
    { wrapper: createWrapper(queryClient) },
  );
}

/** The query keys every `invalidateQueries` call named, in call order. */
function invalidatedKeysOf(invalidateSpy: {
  mock: { calls: readonly (readonly unknown[])[] };
}): unknown[] {
  return invalidateSpy.mock.calls.map(
    (call) => (call[0] as { queryKey?: unknown } | undefined)?.queryKey,
  );
}

function idsOf(rows: readonly { id: string }[] | undefined): string[] {
  return (rows ?? []).map((row) => row.id);
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

beforeEach(() => {
  vi.mocked(demoCreateVjScene).mockReset();
  vi.mocked(demoUpdateVjScene).mockReset();
  vi.mocked(demoReorderVjScenes).mockReset();
  vi.mocked(demoDeleteVjScene).mockReset();
  vi.mocked(demoCreateVjSetlist).mockReset();
  vi.mocked(demoUpdateVjSetlist).mockReset();
  vi.mocked(demoReorderVjSetlists).mockReset();
  vi.mocked(demoSetVjSetlistItems).mockReset();
  vi.mocked(demoDeleteVjSetlist).mockReset();
});

describe("scene writes (demo)", () => {
  it("creating a scene puts it in the cache", async () => {
    const createdScene = buildScene("scene-3", 2);
    vi.mocked(demoCreateVjScene).mockReturnValue(createdScene);
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.scenes.createScene.mutateAsync({
        name: createdScene.name,
        packId: PACK_ID,
        look: createdScene.look,
      });
    });
    expect(
      idsOf(queryClient.getQueryData<VjSceneDTO[]>(vjKeys.scenes(true))),
    ).toEqual(["scene-1", "scene-2", "scene-3"]);
  });

  it("renaming a scene sends the name only", async () => {
    const renamedScene = { ...SCENE_ONE, name: "Warm open" };
    vi.mocked(demoUpdateVjScene).mockReturnValue(renamedScene);
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.scenes.updateScene.mutateAsync({
        sceneId: "scene-1",
        name: "Warm open",
      });
    });
    expect(vi.mocked(demoUpdateVjScene).mock.calls[0]).toEqual([
      "scene-1",
      { name: "Warm open" },
    ]);
    expect(
      Object.keys(at(vi.mocked(demoUpdateVjScene).mock.calls, 0)[1]),
    ).toEqual(["name"]);
    expect(
      queryClient.getQueryData<VjSceneDTO[]>(vjKeys.scenes(true))?.[0]?.name,
    ).toBe("Warm open");
  });

  it("moving a scene to no pack sends packId null", async () => {
    vi.mocked(demoUpdateVjScene).mockReturnValue({
      ...SCENE_TWO,
      packId: null,
    });
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.scenes.updateScene.mutateAsync({
        sceneId: "scene-2",
        packId: null,
      });
    });
    expect(vi.mocked(demoUpdateVjScene).mock.calls[0]).toEqual([
      "scene-2",
      { packId: null },
    ]);
    expect(
      queryClient.getQueryData<VjSceneDTO[]>(vjKeys.scenes(true))?.[1]?.packId,
    ).toBeNull();
  });

  it("reordering scenes keeps the answer in the cache without a refetch", async () => {
    const reordered = [
      { ...SCENE_TWO, position: 0 },
      { ...SCENE_ONE, position: 1 },
    ];
    vi.mocked(demoReorderVjScenes).mockReturnValue({ items: reordered });
    const queryClient = seededQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.scenes.reorderScenes.mutateAsync({
        sceneIds: ["scene-2", "scene-1"],
      });
    });
    expect(queryClient.getQueryData(vjKeys.scenes(true))).toEqual(reordered);
    expect(invalidatedKeysOf(invalidateSpy)).not.toContainEqual(
      vjKeys.scenes(true),
    );
  });

  it("deleting a scene drops it and reads set lists again", async () => {
    vi.mocked(demoDeleteVjScene).mockReturnValue({
      deletedSceneId: "scene-1",
      removedFromSetlistCount: 1,
    });
    const queryClient = seededQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.scenes.deleteScene.mutateAsync({
        sceneId: "scene-1",
      });
    });
    expect(
      idsOf(queryClient.getQueryData<VjSceneDTO[]>(vjKeys.scenes(true))),
    ).toEqual(["scene-2"]);
    expect(invalidatedKeysOf(invalidateSpy)).toContainEqual(
      vjKeys.setlists(true),
    );
  });

  it("a refusal naming a deleted scene reads scenes and set lists again", async () => {
    vi.mocked(demoUpdateVjScene).mockImplementation(() => {
      throw vjRefusal("VJ_SCENE_NOT_FOUND", { sceneId: "scene-1" });
    });
    const queryClient = seededQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderShowWrites(queryClient);
    let caught: unknown = null;
    await act(async () => {
      caught = await result.current.scenes.updateScene
        .mutateAsync({ sceneId: "scene-1", name: "Late set" })
        .catch((cause: unknown) => cause);
    });
    expect(vjErrorKeyOf(caught)).toBe("vj:error.sceneNotFound");
    expect(invalidatedKeysOf(invalidateSpy)).toEqual(
      expect.arrayContaining([vjKeys.scenes(true), vjKeys.setlists(true)]),
    );
  });
});

describe("set list writes (demo)", () => {
  it("creating a set list puts it last", async () => {
    const createdSetlist = buildSetlist("setlist-3", 2);
    vi.mocked(demoCreateVjSetlist).mockReturnValue(createdSetlist);
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.setlists.createSetlist.mutateAsync({
        name: createdSetlist.name,
      });
    });
    expect(
      idsOf(queryClient.getQueryData<VjSetlistDTO[]>(vjKeys.setlists(true))),
    ).toEqual(["setlist-1", "setlist-2", "setlist-3"]);
  });

  it("saving a set list's steps replaces it in the cache and refreshes scene counts", async () => {
    const savedSetlist = buildSetlist("setlist-2", 1, ["scene-2", "scene-2"]);
    vi.mocked(demoSetVjSetlistItems).mockReturnValue(savedSetlist);
    const queryClient = seededQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.setlists.setSetlistItems.mutateAsync({
        setlistId: "setlist-2",
        items: [
          { kind: "scene", sceneId: "scene-2" },
          { kind: "scene", sceneId: "scene-2" },
        ],
      });
    });
    expect(vi.mocked(demoSetVjSetlistItems).mock.calls[0]).toEqual([
      "setlist-2",
      {
        items: [
          { kind: "scene", sceneId: "scene-2" },
          { kind: "scene", sceneId: "scene-2" },
        ],
      },
    ]);
    const cachedSetlists = queryClient.getQueryData<VjSetlistDTO[]>(
      vjKeys.setlists(true),
    );
    expect(cachedSetlists?.[1]).toEqual(savedSetlist);
    expect(idsOf(cachedSetlists)).toEqual(["setlist-1", "setlist-2"]);
    expect(invalidatedKeysOf(invalidateSpy)).toContainEqual(
      vjKeys.scenes(true),
    );
  });

  it("deleting a set list drops it", async () => {
    vi.mocked(demoDeleteVjSetlist).mockReturnValue({
      deletedSetlistId: "setlist-1",
    });
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    await act(async () => {
      await result.current.setlists.deleteSetlist.mutateAsync({
        setlistId: "setlist-1",
      });
    });
    expect(
      idsOf(queryClient.getQueryData<VjSetlistDTO[]>(vjKeys.setlists(true))),
    ).toEqual(["setlist-2"]);
  });

  it("every write marks the library as writing", async () => {
    let release: () => void = () => undefined;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.mocked(demoUpdateVjSetlist).mockImplementation(
      () => hold.then(() => SETLIST_ONE) as unknown as VjSetlistDTO,
    );
    vi.mocked(demoUpdateVjScene).mockImplementation(
      () => hold.then(() => SCENE_ONE) as unknown as VjSceneDTO,
    );
    const queryClient = seededQueryClient();
    const { result } = renderShowWrites(queryClient);
    expect(result.current.isWriting).toBe(false);
    act(() => {
      result.current.setlists.updateSetlist.mutate({
        setlistId: "setlist-1",
        name: "Friday",
      });
      result.current.scenes.updateScene.mutate({
        sceneId: "scene-1",
        name: "Warm open",
      });
    });
    await waitFor(() => expect(result.current.isWriting).toBe(true));
    await act(async () => {
      release();
      await hold;
    });
    await waitFor(() => expect(result.current.isWriting).toBe(false));
  });
});
