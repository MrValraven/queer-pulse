import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { VjSetlistDTO } from "../../../shared/contracts/vj";
import {
  demoCreateVjSetlist,
  demoDeleteVjSetlist,
  demoSetVjSetlistItems,
  demoUpdateVjSetlist,
} from "../demo/vjDemoStore";
import { vjRefusal } from "../demo/vjDemoRefusals";
import { updateBodyOf, useVjSetlistMutations } from "./useVjSetlistMutations";
import { vjKeys } from "./vjKeys";

const SETLIST_ID = "00000000-0000-4000-8000-0000000000b1";
const CLIP_ID = "00000000-0000-4000-8000-0000000000c4";
const SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const CREATED_AT = "2026-11-13T20:00:00.000Z";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoCreateVjSetlist: vi.fn(),
    demoUpdateVjSetlist: vi.fn(),
    demoSetVjSetlistItems: vi.fn(),
    demoDeleteVjSetlist: vi.fn(),
  };
});

function buildSetlist(items: VjSetlistDTO["items"] = []): VjSetlistDTO {
  return {
    id: SETLIST_ID,
    name: "Friday set",
    position: 0,
    isLooping: true,
    stepDuration: { kind: "seconds", value: 8 },
    items,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

const CLIP_STEP: VjSetlistDTO["items"][number] = {
  id: "00000000-0000-4000-8000-000000000101",
  position: 0,
  kind: "clip",
  sceneId: null,
  clipId: CLIP_ID,
  duration: null,
};

function renderSetlistWrites(queryClient: QueryClient) {
  return renderHook(() => useVjSetlistMutations(), {
    wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return (
        <TestProviders queryClient={queryClient}>{children}</TestProviders>
      );
    },
  });
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** The query keys every `invalidateQueries` call named, in call order. */
function invalidatedKeysOf(invalidateSpy: {
  mock: { calls: readonly (readonly unknown[])[] };
}): unknown[] {
  return invalidateSpy.mock.calls.map(
    (call) => (call[0] as { queryKey?: unknown } | undefined)?.queryKey,
  );
}

beforeEach(() => {
  vi.mocked(demoCreateVjSetlist).mockReset();
  vi.mocked(demoUpdateVjSetlist).mockReset();
  vi.mocked(demoSetVjSetlistItems).mockReset();
  vi.mocked(demoDeleteVjSetlist).mockReset();
});

describe("updateBodyOf", () => {
  it("keeps only the fields the caller set", () => {
    expect(updateBodyOf({ setlistId: SETLIST_ID, isLooping: false })).toEqual({
      isLooping: false,
    });
    expect(
      updateBodyOf({
        setlistId: SETLIST_ID,
        name: "Late set",
        stepDuration: { kind: "beats", value: 16 },
      }),
    ).toEqual({ name: "Late set", stepDuration: { kind: "beats", value: 16 } });
    expect(
      Object.keys(
        updateBodyOf({
          setlistId: SETLIST_ID,
          name: undefined,
          isLooping: true,
          stepDuration: undefined,
        }),
      ),
    ).toEqual(["isLooping"]);
  });
});

describe("set list step writes mark clip counts stale (demo)", () => {
  it("a steps save sends the items and marks clips and every pack's clip list stale", async () => {
    vi.mocked(demoSetVjSetlistItems).mockReturnValue(buildSetlist([CLIP_STEP]));
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderSetlistWrites(queryClient);
    const items = [{ kind: "clip" as const, clipId: CLIP_ID }];

    await act(async () => {
      await result.current.setSetlistItems.mutateAsync({
        setlistId: SETLIST_ID,
        items,
      });
    });

    expect(vi.mocked(demoSetVjSetlistItems).mock.calls[0]).toEqual([
      SETLIST_ID,
      { items },
    ]);
    const keys = invalidatedKeysOf(invalidateSpy);
    expect(keys).toContainEqual(vjKeys.clips(true));
    expect(keys).toContainEqual(vjKeys.packClipsRoot);
    expect(keys).toContainEqual(vjKeys.scenes(true));
  });

  it("deleting a set list marks clips and every pack's clip list stale", async () => {
    vi.mocked(demoDeleteVjSetlist).mockReturnValue({
      deletedSetlistId: SETLIST_ID,
    });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderSetlistWrites(queryClient);

    await act(async () => {
      await result.current.deleteSetlist.mutateAsync({
        setlistId: SETLIST_ID,
      });
    });

    const keys = invalidatedKeysOf(invalidateSpy);
    expect(keys).toContainEqual(vjKeys.clips(true));
    expect(keys).toContainEqual(vjKeys.packClipsRoot);
  });

  it("a create with a clip step marks clips stale; one with scenes only does not", async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderSetlistWrites(queryClient);

    vi.mocked(demoCreateVjSetlist).mockReturnValue(
      buildSetlist([
        {
          id: "00000000-0000-4000-8000-000000000100",
          position: 0,
          kind: "scene",
          sceneId: SCENE_ID,
          clipId: null,
          duration: null,
        },
      ]),
    );
    await act(async () => {
      await result.current.createSetlist.mutateAsync({
        name: "Friday set",
        sceneIds: [SCENE_ID],
      });
    });
    expect(invalidatedKeysOf(invalidateSpy)).not.toContainEqual(
      vjKeys.packClipsRoot,
    );

    vi.mocked(demoCreateVjSetlist).mockReturnValue(buildSetlist([CLIP_STEP]));
    await act(async () => {
      await result.current.createSetlist.mutateAsync({
        name: "Clip set",
        items: [{ kind: "clip", clipId: CLIP_ID }],
      });
    });
    const keys = invalidatedKeysOf(invalidateSpy);
    expect(keys).toContainEqual(vjKeys.clips(true));
    expect(keys).toContainEqual(vjKeys.packClipsRoot);
  });

  it("a missing clip refusal reads clips, pack clip lists and set lists again", async () => {
    vi.mocked(demoSetVjSetlistItems).mockImplementation(() => {
      throw vjRefusal("VJ_CLIP_NOT_FOUND", { clipId: CLIP_ID });
    });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderSetlistWrites(queryClient);

    await act(async () => {
      await result.current.setSetlistItems
        .mutateAsync({
          setlistId: SETLIST_ID,
          items: [{ kind: "clip", clipId: CLIP_ID }],
        })
        .catch(() => undefined);
    });

    const keys = invalidatedKeysOf(invalidateSpy);
    expect(keys).toContainEqual(vjKeys.clips(true));
    expect(keys).toContainEqual(vjKeys.packClipsRoot);
    expect(keys).toContainEqual(vjKeys.setlists(true));
  });

  it("an update sends only the set fields to the demo route and posts the answer", async () => {
    vi.mocked(demoUpdateVjSetlist).mockReturnValue({
      ...buildSetlist(),
      isLooping: false,
    });
    const queryClient = createQueryClient();
    queryClient.setQueryData(vjKeys.setlists(true), [buildSetlist()]);
    const { result } = renderSetlistWrites(queryClient);

    await act(async () => {
      await result.current.updateSetlist.mutateAsync({
        setlistId: SETLIST_ID,
        isLooping: false,
      });
    });

    expect(vi.mocked(demoUpdateVjSetlist).mock.calls[0]).toEqual([
      SETLIST_ID,
      { isLooping: false },
    ]);
    expect(
      queryClient.getQueryData<VjSetlistDTO[]>(vjKeys.setlists(true))?.[0]
        ?.isLooping,
    ).toBe(false);
  });
});
