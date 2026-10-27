import { afterEach, describe, expect, it, vi } from "vitest";
import { safeStorage } from "../../../shared/storage/safeStorage";
import {
  clearStudioRecentlyPlayed,
  readStudioRecentlyPlayed,
  recordStudioRecentlyPlayed,
  resumeStudioListeningMemoryForTests,
} from "./studioListeningMemory";
import {
  clampCrossfadeSeconds,
  clampVolume,
  DEFAULT_PLAYER_PREFERENCES,
  dropLegacyRecentlyPlayedField,
  normalizePlayerPreferences,
  readLegacyRecentlyPlayedOff,
  readListeningPreferences,
  readPlayerPreferences,
  STUDIO_LISTENING_PREFERENCES_KEY,
  STUDIO_PLAYER_PREFERENCES_KEY,
  writeListeningPreferences,
  writePlayerPreferences,
} from "./studioPlayerPreferences";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.removeItem(STUDIO_PLAYER_PREFERENCES_KEY);
});

describe("player preferences", () => {
  it("defaults to full volume, unmuted, even loudness on", () => {
    expect(DEFAULT_PLAYER_PREFERENCES).toEqual({
      volume: 1,
      isMuted: false,
      isLoudnessEven: true,
    });
    expect(readPlayerPreferences()).toEqual(DEFAULT_PLAYER_PREFERENCES);
  });

  it("round-trips what the member chose", () => {
    const chosen = { volume: 0.4, isMuted: true, isLoudnessEven: false };
    writePlayerPreferences(chosen);
    expect(readPlayerPreferences()).toEqual(chosen);
  });

  it("keeps the crossfade length out of this device's storage", () => {
    writePlayerPreferences({
      ...DEFAULT_PLAYER_PREFERENCES,
      crossfadeSeconds: 6,
    } as typeof DEFAULT_PLAYER_PREFERENCES);
    expect(
      window.localStorage.getItem(STUDIO_PLAYER_PREFERENCES_KEY),
    ).not.toContain("crossfade");
  });

  it("clamps volume and crossfade and fills what is missing", () => {
    expect(clampVolume(1.7)).toBe(1);
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(1);
    expect(clampCrossfadeSeconds(12.6)).toBe(12);
    expect(clampCrossfadeSeconds(4.4)).toBe(4);
    expect(clampCrossfadeSeconds(-1)).toBe(0);
    expect(normalizePlayerPreferences({ volume: 0.5, isMuted: "yes" })).toEqual(
      {
        ...DEFAULT_PLAYER_PREFERENCES,
        volume: 0.5,
      },
    );
    expect(normalizePlayerPreferences(null)).toEqual(
      DEFAULT_PLAYER_PREFERENCES,
    );
  });

  it("reads the defaults from broken JSON or blocked storage", () => {
    window.localStorage.setItem(STUDIO_PLAYER_PREFERENCES_KEY, "{oops");
    expect(readPlayerPreferences()).toEqual(DEFAULT_PLAYER_PREFERENCES);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(readPlayerPreferences()).toEqual(DEFAULT_PLAYER_PREFERENCES);
    expect(() =>
      writePlayerPreferences(DEFAULT_PLAYER_PREFERENCES),
    ).not.toThrow();
  });
});

function storeDevice(record: Record<string, boolean>) {
  safeStorage.set(STUDIO_LISTENING_PREFERENCES_KEY, JSON.stringify(record));
}

describe("listening preferences", () => {
  afterEach(() => {
    safeStorage.remove(STUDIO_LISTENING_PREFERENCES_KEY);
    clearStudioRecentlyPlayed();
  });

  it("reads the listening switches without the retired Recently played field", () => {
    storeDevice({ isRecentlyPlayedOn: false, areSingleKeyShortcutsOn: false });
    expect(readListeningPreferences()).toEqual({
      shouldResumeAcrossSessions: false,
      areSingleKeyShortcutsOn: false,
    });
  });

  it("keeps a stored legacy off value through a later write until the read drops it", () => {
    storeDevice({ isRecentlyPlayedOn: false });
    writeListeningPreferences({ shouldResumeAcrossSessions: true });
    expect(readLegacyRecentlyPlayedOff()).toBe(true);
    dropLegacyRecentlyPlayedField();
    expect(readLegacyRecentlyPlayedOff()).toBe(false);
    expect(readListeningPreferences().shouldResumeAcrossSessions).toBe(true);
    expect(safeStorage.get(STUDIO_LISTENING_PREFERENCES_KEY)).not.toContain(
      "isRecentlyPlayedOn",
    );
  });

  it("leaves the recently played list in place when a device switch changes", () => {
    resumeStudioListeningMemoryForTests();
    recordStudioRecentlyPlayed("member-1", "t1");
    writeListeningPreferences({ areSingleKeyShortcutsOn: false });
    expect(readStudioRecentlyPlayed("member-1")).toHaveLength(1);
  });
});
