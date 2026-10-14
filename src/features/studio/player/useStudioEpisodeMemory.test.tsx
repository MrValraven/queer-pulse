import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  clearStudioEpisodeMemory,
  episodeMemoryKey,
  markEpisodePlayed,
} from "./studioEpisodeMemory";
import {
  DEMO_EPISODE_MEMBER_ID,
  useStudioEpisodeMemory,
  useStudioEpisodeSpeed,
} from "./useStudioEpisodeMemory";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

afterEach(() => clearStudioEpisodeMemory());

describe("useStudioEpisodeMemory (demo)", () => {
  it("uses the demo member id and re-renders on a mark", () => {
    const { result } = renderHook(() => useStudioEpisodeMemory(), { wrapper });
    expect(result.current.memberId).toBe(DEMO_EPISODE_MEMBER_ID);
    expect(result.current.isPlayed("e1")).toBe(false);
    act(() => result.current.markPlayed("e1"));
    expect(result.current.isPlayed("e1")).toBe(true);
    act(() => result.current.markUnplayed("e1"));
    expect(result.current.isPlayed("e1")).toBe(false);
  });

  it("follows a write made in another tab", () => {
    const { result } = renderHook(() => useStudioEpisodeMemory(), { wrapper });
    act(() => {
      markEpisodePlayed(DEMO_EPISODE_MEMBER_ID, "e2");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: episodeMemoryKey(DEMO_EPISODE_MEMBER_ID),
        }),
      );
    });
    expect(result.current.isPlayed("e2")).toBe(true);
  });

  it("stores the speed", () => {
    const { result } = renderHook(() => useStudioEpisodeSpeed(), { wrapper });
    expect(result.current.speed).toBe(1);
    act(() => result.current.setSpeed(1.25));
    expect(result.current.speed).toBe(1.25);
  });
});
