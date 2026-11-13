import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  VjSceneDTO,
  VjSetlistDTO,
  VjSetlistItemDTO,
} from "../../../shared/contracts/vj";
import { useVjScreenSetlistClips } from "./useVjScreenSetlistClips";

const SETLIST_ID = "setlist-1";

const mocks = vi.hoisted(() => ({
  setlists: undefined as VjSetlistDTO[] | undefined,
  scenes: undefined as VjSceneDTO[] | undefined,
  setlistsEnabledCalls: [] as (boolean | undefined)[],
}));

vi.mock("../api/useVjSetlists", () => ({
  useVjSetlists: (options?: { isEnabled?: boolean }) => {
    mocks.setlistsEnabledCalls.push(options?.isEnabled);
    return { data: mocks.setlists };
  },
}));

vi.mock("../api/useVjScenes", () => ({
  useVjScenes: () => ({ data: mocks.scenes }),
}));

function clipStep(position: number, clipId: string): VjSetlistItemDTO {
  return {
    id: `item-${position}`,
    position,
    kind: "clip",
    sceneId: null,
    clipId,
    duration: null,
  };
}

function setlistOf(items: VjSetlistItemDTO[]): VjSetlistDTO {
  return {
    id: SETLIST_ID,
    name: "Friday set",
    position: 0,
    isLooping: true,
    stepDuration: { kind: "seconds", value: 8 },
    items,
    createdBy: null,
    createdAt: "2026-11-13T19:00:00.000Z",
    updatedAt: "2026-11-13T19:00:00.000Z",
  };
}

interface HookProps {
  activeSetlistId: string | null;
  setlistIndex: number | null;
}

function renderSetlistClips(initialProps: HookProps) {
  return renderHook(
    ({ activeSetlistId, setlistIndex }: HookProps) =>
      useVjScreenSetlistClips(activeSetlistId, setlistIndex),
    { initialProps },
  );
}

beforeEach(() => {
  mocks.setlists = [
    setlistOf([
      clipStep(0, "clip-a"),
      clipStep(1, "clip-b"),
      clipStep(2, "clip-c"),
    ]),
  ];
  mocks.scenes = undefined;
  mocks.setlistsEnabledCalls.length = 0;
});

describe("useVjScreenSetlistClips", () => {
  it("starts at the step after setlistIndex and wraps round", () => {
    const { result, rerender } = renderSetlistClips({
      activeSetlistId: SETLIST_ID,
      setlistIndex: 0,
    });
    expect(result.current).toEqual(["clip-b", "clip-c", "clip-a"]);

    rerender({ activeSetlistId: SETLIST_ID, setlistIndex: 2 });
    expect(result.current).toEqual(["clip-a", "clip-b", "clip-c"]);
  });

  it("starts an armed set list (index null) at its first step", () => {
    const { result } = renderSetlistClips({
      activeSetlistId: SETLIST_ID,
      setlistIndex: null,
    });
    expect(result.current).toEqual(["clip-a", "clip-b", "clip-c"]);
  });

  it("counts clip steps before the scenes arrive", () => {
    mocks.scenes = undefined;
    const { result } = renderSetlistClips({
      activeSetlistId: SETLIST_ID,
      setlistIndex: 1,
    });
    expect(result.current).toEqual(["clip-c", "clip-a", "clip-b"]);
  });

  it("names nothing and loads nothing while no set list is active", () => {
    const { result } = renderSetlistClips({
      activeSetlistId: null,
      setlistIndex: null,
    });
    expect(result.current).toEqual([]);
    expect(mocks.setlistsEnabledCalls.every((isEnabled) => !isEnabled)).toBe(
      true,
    );
  });

  it("keeps the same list while the ids stay the same", () => {
    const { result, rerender } = renderSetlistClips({
      activeSetlistId: SETLIST_ID,
      setlistIndex: 0,
    });
    const firstList = result.current;
    mocks.setlists = [
      setlistOf([
        clipStep(0, "clip-a"),
        clipStep(1, "clip-b"),
        clipStep(2, "clip-c"),
      ]),
    ];
    rerender({ activeSetlistId: SETLIST_ID, setlistIndex: 0 });
    expect(result.current).toBe(firstList);
  });
});
