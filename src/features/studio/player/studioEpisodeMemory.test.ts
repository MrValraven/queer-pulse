import { afterEach, describe, expect, it, vi } from "vitest";
import {
  capEpisodeMemory,
  clearStudioEpisodeMemory,
  endStudioEpisodeSaving,
  episodeMemoryKey,
  episodeSpeedKey,
  markEpisodePlayed,
  markEpisodeUnplayed,
  parseEpisodeMemory,
  readEpisodeMemory,
  readEpisodeSpeed,
  resumeStudioEpisodeSavingForTests,
  saveEpisodePosition,
  subscribeEpisodeMemory,
  writeEpisodeSpeed,
} from "./studioEpisodeMemory";

const at = (iso: string) => new Date(iso);

afterEach(() => {
  resumeStudioEpisodeSavingForTests();
  clearStudioEpisodeMemory();
  window.localStorage.removeItem("unrelated.key");
  vi.restoreAllMocks();
});

describe("studio episode memory", () => {
  it("saves a position and marks played, which drops the position", () => {
    saveEpisodePosition("m1", "e1", 612.7, at("2026-10-14T10:00:00.000Z"));
    expect(readEpisodeMemory("m1").e1).toEqual({
      positionSeconds: 612,
      touchedAt: "2026-10-14T10:00:00.000Z",
    });
    markEpisodePlayed("m1", "e1", at("2026-10-14T11:00:00.000Z"));
    expect(readEpisodeMemory("m1").e1).toEqual({
      playedAt: "2026-10-14T11:00:00.000Z",
      touchedAt: "2026-10-14T11:00:00.000Z",
    });
  });

  it("marks unplayed and keeps a saved position", () => {
    saveEpisodePosition("m1", "e1", 300);
    markEpisodeUnplayed("m1", "e1");
    expect(readEpisodeMemory("m1").e1?.playedAt).toBeUndefined();
    expect(readEpisodeMemory("m1").e1?.positionSeconds).toBe(300);
  });

  it("keeps the newest 500 entries by touchedAt", () => {
    const memory = Object.fromEntries(
      Array.from({ length: 502 }, (_unused, index) => [
        `e${index}`,
        {
          touchedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
        },
      ]),
    );
    const capped = capEpisodeMemory(memory);
    expect(Object.keys(capped)).toHaveLength(500);
    expect(capped.e0).toBeUndefined();
    expect(capped.e1).toBeUndefined();
    expect(capped.e501).toBeDefined();
  });

  it("reads anything unreadable as empty", () => {
    expect(parseEpisodeMemory("{not json")).toEqual({});
    expect(parseEpisodeMemory("[1,2]")).toEqual({});
    expect(
      parseEpisodeMemory(
        JSON.stringify({
          ok: { touchedAt: "x" },
          bad: { positionSeconds: -1, touchedAt: "x" },
        }),
      ),
    ).toEqual({ ok: { touchedAt: "x" } });
  });

  it("keeps the speed per member and falls back to 1x", () => {
    expect(readEpisodeSpeed("m1")).toBe(1);
    writeEpisodeSpeed("m1", 1.5);
    expect(readEpisodeSpeed("m1")).toBe(1.5);
    expect(readEpisodeSpeed("m2")).toBe(1);
    expect(readEpisodeSpeed(null)).toBe(1);
    window.localStorage.setItem(episodeSpeedKey("m1"), "7");
    expect(readEpisodeSpeed("m1")).toBe(1);
  });

  it("clears every episode key for every member and nothing else", () => {
    saveEpisodePosition("m1", "e1", 10);
    saveEpisodePosition("m2", "e2", 10);
    writeEpisodeSpeed("m1", 2);
    window.localStorage.setItem("unrelated.key", "stays");
    clearStudioEpisodeMemory();
    expect(window.localStorage.getItem(episodeMemoryKey("m1"))).toBeNull();
    expect(window.localStorage.getItem(episodeMemoryKey("m2"))).toBeNull();
    expect(window.localStorage.getItem(episodeSpeedKey("m1"))).toBeNull();
    expect(window.localStorage.getItem("unrelated.key")).toBe("stays");
  });

  it("works with storage blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => saveEpisodePosition("m3", "e1", 10)).not.toThrow();
    expect(readEpisodeMemory("m3")).toEqual({});
    expect(() => clearStudioEpisodeMemory()).not.toThrow();
  });

  it("notifies on a write and on another tab's storage event", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeEpisodeMemory(listener);
    markEpisodePlayed("m1", "e9");
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(
      new StorageEvent("storage", { key: episodeMemoryKey("m1") }),
    );
    expect(listener).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated.key" }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("writes nothing after Quick Exit ends saving, its own pagehide included", () => {
    saveEpisodePosition("m1", "e1", 120);
    clearStudioEpisodeMemory();
    endStudioEpisodeSaving();
    saveEpisodePosition("m1", "e1", 240);
    markEpisodePlayed("m1", "e2");
    markEpisodeUnplayed("m1", "e3");
    writeEpisodeSpeed("m1", 2);
    expect(window.localStorage.getItem(episodeMemoryKey("m1"))).toBeNull();
    expect(window.localStorage.getItem(episodeSpeedKey("m1"))).toBeNull();
    expect(readEpisodeMemory("m1")).toEqual({});
    expect(readEpisodeSpeed("m1")).toBe(1);
  });
});
