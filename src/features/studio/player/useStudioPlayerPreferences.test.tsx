import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeAudioEngine } from "../../../test/studioFakeAudioEngine";
import type { StudioPlaybackPreferencesDTO } from "../api/studio.types";
import {
  STUDIO_PLAYER_PREFERENCES_KEY,
  writePlayerPreferences,
} from "./studioPlayerPreferences";
import { useStudioPlayerPreferences } from "./useStudioPlayerPreferences";

let server: StudioPlaybackPreferencesDTO = {
  autoplayNext: true,
  hideExplicit: false,
  crossfadeSeconds: 0,
};
const savePreferences = vi.fn(
  (patch: Partial<StudioPlaybackPreferencesDTO>) => {
    server = { ...server, ...patch };
  },
);
vi.mock("../api/useStudioPlaybackPreferences", () => ({
  useStudioPlaybackSettings: () => server,
  useStudioPlaybackPreferences: () => ({
    preferences: server,
    isLoading: false,
    savePreferences,
  }),
}));

beforeEach(() => {
  server = { autoplayNext: true, hideExplicit: false, crossfadeSeconds: 0 };
  savePreferences.mockClear();
});
afterEach(() => window.localStorage.removeItem(STUDIO_PLAYER_PREFERENCES_KEY));

function setup() {
  const engine = createFakeAudioEngine();
  const engineRef = { current: engine };
  const hook = renderHook(() => useStudioPlayerPreferences(engineRef));
  return { engine, hook };
}

describe("useStudioPlayerPreferences", () => {
  it("starts from what this device saved and the server's crossfade", () => {
    writePlayerPreferences({
      volume: 0.3,
      isMuted: false,
      isLoudnessEven: false,
    });
    server = { ...server, crossfadeSeconds: 4 };
    const { hook } = setup();
    expect(hook.result.current.preferences).toEqual({
      volume: 0.3,
      isMuted: false,
      crossfadeSeconds: 4,
      isLoudnessEven: false,
    });
  });

  it("applies and saves each device change", () => {
    const { engine, hook } = setup();
    act(() => hook.result.current.setVolume(0.4));
    expect(engine.setVolume).toHaveBeenLastCalledWith(0.4);
    expect(
      JSON.parse(
        window.localStorage.getItem(STUDIO_PLAYER_PREFERENCES_KEY) ?? "{}",
      ),
    ).toMatchObject({ volume: 0.4 });
    act(() => hook.result.current.toggleMute());
    expect(engine.setMuted).toHaveBeenLastCalledWith(true);
    act(() => hook.result.current.setVolume(0.6));
    expect(hook.result.current.preferences.isMuted).toBe(false);
    act(() => hook.result.current.setLoudnessEven(false));
    expect(engine.setLoudnessEven).toHaveBeenLastCalledWith(false);
  });

  it("shows the crossfade length at once and saves it to the server, clamped", () => {
    vi.useFakeTimers();
    const { hook } = setup();
    act(() => hook.result.current.setCrossfadeSeconds(30));
    expect(hook.result.current.preferences.crossfadeSeconds).toBe(12);
    expect(hook.result.current.readPreferences().crossfadeSeconds).toBe(12);
    expect(savePreferences).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(savePreferences).toHaveBeenCalledWith({ crossfadeSeconds: 12 });
    expect(
      window.localStorage.getItem(STUDIO_PLAYER_PREFERENCES_KEY) ?? "",
    ).not.toContain("crossfade");
    vi.useRealTimers();
  });

  it("sends one save with the last value after several quick changes", () => {
    vi.useFakeTimers();
    const { hook } = setup();
    act(() => hook.result.current.setCrossfadeSeconds(2));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => hook.result.current.setCrossfadeSeconds(5));
    act(() => hook.result.current.setCrossfadeSeconds(8));
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(savePreferences).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(savePreferences).toHaveBeenCalledTimes(1);
    expect(savePreferences).toHaveBeenCalledWith({ crossfadeSeconds: 8 });
    vi.useRealTimers();
  });

  it("sends a pending crossfade save when the player unmounts", () => {
    vi.useFakeTimers();
    const { hook } = setup();
    act(() => hook.result.current.setCrossfadeSeconds(6));
    hook.unmount();
    expect(savePreferences).toHaveBeenCalledWith({ crossfadeSeconds: 6 });
    vi.useRealTimers();
  });

  it("mirrors autoplay next and hide explicit", () => {
    server = { ...server, autoplayNext: false, hideExplicit: true };
    const { hook } = setup();
    expect(hook.result.current.playbackSettings).toEqual({
      autoplayNext: false,
      hideExplicit: true,
      askBeforeWarnings: true,
    });
    expect(hook.result.current.readPlaybackSettings()).toEqual({
      autoplayNext: false,
      hideExplicit: true,
      askBeforeWarnings: true,
    });
  });

  it("applies everything to a new engine", () => {
    const { hook } = setup();
    const other = createFakeAudioEngine();
    act(() => hook.result.current.setVolume(0.5));
    hook.result.current.applyTo(other);
    expect(other.setVolume).toHaveBeenCalledWith(0.5);
    expect(other.setMuted).toHaveBeenCalledWith(false);
    expect(other.setLoudnessEven).toHaveBeenCalledWith(true);
  });
});

describe("useStudioPlayerPreferences: crossfade mirror", () => {
  it("keeps the picked value until the server value matches", () => {
    vi.useFakeTimers();
    const { hook } = setup();
    savePreferences.mockImplementationOnce(() => {});
    act(() => hook.result.current.setCrossfadeSeconds(7));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(hook.result.current.preferences.crossfadeSeconds).toBe(7);
    server = { ...server, crossfadeSeconds: 7 };
    hook.rerender();
    expect(hook.result.current.preferences.crossfadeSeconds).toBe(7);
    server = { ...server, crossfadeSeconds: 3 };
    hook.rerender();
    expect(hook.result.current.preferences.crossfadeSeconds).toBe(3);
    vi.useRealTimers();
  });

  it("shows the server value again when the sent save is refused", () => {
    vi.useFakeTimers();
    const { hook } = setup();
    // Open pages' save writes its cache at once, then rolls it back on a refusal.
    act(() => hook.result.current.setCrossfadeSeconds(9));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    server = { ...server, crossfadeSeconds: 9 };
    hook.rerender();
    server = { ...server, crossfadeSeconds: 0 };
    hook.rerender();
    expect(hook.result.current.preferences.crossfadeSeconds).toBe(0);
    vi.useRealTimers();
  });
});
