import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { StudioAudioEngine } from "./studioAudioEngine";
import {
  clearStudioEpisodeMemory,
  writeEpisodeSpeed,
} from "./studioEpisodeMemory";
import { playbackRateFor, useStudioEpisodeRate } from "./useStudioEpisodeRate";
import { DEMO_EPISODE_MEMBER_ID } from "./useStudioEpisodeMemory";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

afterEach(() => clearStudioEpisodeMemory());

describe("useStudioEpisodeRate", () => {
  it("plays music at 1x whatever the episode speed", () => {
    expect(playbackRateFor(false, 2)).toBe(1);
    expect(playbackRateFor(true, 1.5)).toBe(1.5);
  });

  it("applies the speed to an episode and 1x to the music after it", () => {
    writeEpisodeSpeed(DEMO_EPISODE_MEMBER_ID, 1.5);
    const setPlaybackRate = vi.fn();
    const engineRef = {
      current: { setPlaybackRate } as unknown as StudioAudioEngine,
    };
    const { rerender } = renderHook(
      ({ isEpisode }: { isEpisode: boolean }) =>
        useStudioEpisodeRate(engineRef, isEpisode, false, "playing"),
      { wrapper, initialProps: { isEpisode: true } },
    );
    expect(setPlaybackRate).toHaveBeenLastCalledWith(1.5);
    rerender({ isEpisode: false });
    expect(setPlaybackRate).toHaveBeenLastCalledWith(1);
  });

  it("applies the rate again after a plain-mode switch", () => {
    writeEpisodeSpeed(DEMO_EPISODE_MEMBER_ID, 2);
    const setPlaybackRate = vi.fn();
    const engineRef = {
      current: { setPlaybackRate } as unknown as StudioAudioEngine,
    };
    const { rerender } = renderHook(
      ({ isPlainMode }: { isPlainMode: boolean }) =>
        useStudioEpisodeRate(engineRef, true, isPlainMode, "playing"),
      { wrapper, initialProps: { isPlainMode: false } },
    );
    setPlaybackRate.mockClear();
    rerender({ isPlainMode: true });
    expect(setPlaybackRate).toHaveBeenCalledWith(2);
  });

  it("does nothing with an engine that has no rate control", () => {
    const engineRef = { current: {} as unknown as StudioAudioEngine };
    expect(() =>
      renderHook(
        () => useStudioEpisodeRate(engineRef, true, false, "playing"),
        {
          wrapper,
        },
      ),
    ).not.toThrow();
  });
});
