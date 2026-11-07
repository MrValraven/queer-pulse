import { renderHook } from "@testing-library/react";
import type { UseQueryResult } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjScreenStatus,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import { useVjClips } from "../../api/useVjClips";
import { useVjPackClips } from "../../api/useVjPackClips";
import { useVjPacks } from "../../api/useVjPacks";
import type { VjStageController } from "../../live/useVjStage";
import { useVjRemoteLibrary } from "./useVjRemoteLibrary";

vi.mock("../../api/useVjPacks", () => ({ useVjPacks: vi.fn() }));
vi.mock("../../api/useVjPackClips", () => ({ useVjPackClips: vi.fn() }));
vi.mock("../../api/useVjClips", () => ({ useVjClips: vi.fn() }));
vi.mock("../../api/useInvalidateVjLibrary", () => ({
  useInvalidateVjLibrary: () => vi.fn(),
}));

const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const PACK_PEAK = "00000000-0000-4000-8000-0000000000a2";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_RIBBON = "00000000-0000-4000-8000-0000000000c3";
const CLIP_OUTSIDE = "00000000-0000-4000-8000-0000000000c9";

function packOf(id: string, clipCount: number): VjPackDTO {
  return { id, name: id, position: 0, clipCount } as VjPackDTO;
}

function clipOf(id: string, title: string, isFavorite: boolean): VjClipDTO {
  return { id, title, isFavorite } as VjClipDTO;
}

const PACKS = [packOf(PACK_WARM, 3), packOf(PACK_PEAK, 5)];
const WARM_CLIPS = [
  clipOf(CLIP_GRID, "Neon grid", true),
  clipOf(CLIP_HAZE, "Neon haze", false),
  clipOf(CLIP_RIBBON, "Warm ribbon", true),
];
const OUTSIDE_CLIP = clipOf(CLIP_OUTSIDE, "Peak strobe", false);

function queryOf<Data>(data: Data | undefined): UseQueryResult<Data, Error> {
  return { data } as UseQueryResult<Data, Error>;
}

function screenOf(changes: Partial<VjScreenStatus>): VjScreenStatus {
  return {
    screenId: "screen-1",
    number: 1,
    isConnected: true,
    isLead: false,
    isFullscreen: true,
    connectedAt: 0,
    lastSeenAt: 0,
    preload: { packId: null, clips: [] },
    health: null,
    nextClipId: null,
    mic: null,
    ...changes,
  };
}

function stageOf(
  state: VjStageState,
  screens: readonly VjScreenStatus[] = [],
): VjStageController {
  return {
    state,
    latestState: state,
    screens,
    subscribeLibrary: () => () => undefined,
  } as unknown as VjStageController;
}

function stateWith(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("library-epoch", 0),
    activePackId: PACK_WARM,
    liveClipId: CLIP_GRID,
    ...changes,
  };
}

beforeEach(() => {
  vi.mocked(useVjPacks).mockReturnValue(queryOf<VjPackDTO[]>(PACKS));
  vi.mocked(useVjPackClips).mockReturnValue(
    queryOf<VjPackClipsDTO>({ pack: PACKS[0] as VjPackDTO, items: WARM_CLIPS }),
  );
  vi.mocked(useVjClips).mockReturnValue(
    queryOf<VjClipDTO[]>([...WARM_CLIPS, OUTSIDE_CLIP]),
  );
});

describe("useVjRemoteLibrary", () => {
  it("filters favorites and search together", () => {
    const { result } = renderHook(() =>
      useVjRemoteLibrary(stageOf(stateWith()), {
        searchQuery: "neon",
        isFavoritesOnly: true,
      }),
    );
    expect(result.current.visibleClips.map((clip) => clip.id)).toEqual([
      CLIP_GRID,
    ]);
    expect(result.current.packClips).toHaveLength(3);
    expect(result.current.activePack?.id).toBe(PACK_WARM);
  });

  it("finds the live clip outside the active pack", () => {
    const { result } = renderHook(() =>
      useVjRemoteLibrary(stageOf(stateWith({ liveClipId: CLIP_OUTSIDE })), {
        searchQuery: "",
        isFavoritesOnly: false,
      }),
    );
    expect(vi.mocked(useVjClips)).toHaveBeenLastCalledWith({ isEnabled: true });
    expect(result.current.liveClip?.id).toBe(CLIP_OUTSIDE);
    expect(result.current.clipsById.get(CLIP_HAZE)?.title).toBe("Neon haze");
  });

  it("leaves the whole library idle while every named clip is in the pack", () => {
    const { result } = renderHook(() =>
      useVjRemoteLibrary(stageOf(stateWith()), {
        searchQuery: "",
        isFavoritesOnly: false,
      }),
    );
    expect(vi.mocked(useVjClips)).toHaveBeenLastCalledWith({
      isEnabled: false,
    });
    expect(result.current.liveClip?.id).toBe(CLIP_GRID);
  });

  it("reads readiness per pack", () => {
    const readyClips = WARM_CLIPS.map((clip) => ({
      clipId: clip.id,
      state: "ready" as const,
      progress: 1,
      failure: null,
    }));
    const screens = [
      screenOf({
        isLead: true,
        preload: { packId: PACK_WARM, clips: readyClips },
      }),
    ];
    const { result } = renderHook(() =>
      useVjRemoteLibrary(stageOf(stateWith(), screens), {
        searchQuery: "",
        isFavoritesOnly: false,
      }),
    );
    expect(result.current.readinessOf(PACK_WARM)).toEqual({
      kind: "ready",
      readyCount: 3,
      totalCount: 3,
    });
    expect(result.current.readinessOf(PACK_PEAK)).toEqual({
      kind: "notPreloaded",
      totalCount: 5,
    });
  });

  it("reads the lead screen's next clip", () => {
    const screens = [
      screenOf({ screenId: "screen-1", nextClipId: null }),
      screenOf({ screenId: "screen-2", isLead: true, nextClipId: CLIP_HAZE }),
    ];
    const { result } = renderHook(() =>
      useVjRemoteLibrary(stageOf(stateWith(), screens), {
        searchQuery: "",
        isFavoritesOnly: false,
      }),
    );
    expect(result.current.leadNextClipId).toBe(CLIP_HAZE);
  });
});
