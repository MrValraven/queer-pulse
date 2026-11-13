import { describe, expect, it } from "vitest";
import {
  VJ_CLIENT_FRAME_NAMES,
  VJ_CLIENT_UPLOAD_CODES,
  VJ_LIMITS,
  VJ_REFUSAL_CODES,
  VJ_LIBRARY_CHANGE_KINDS,
  VJ_REMOTE_COMMAND_NAMES,
  VJ_RENDERERS,
  VJ_RENDER_MODES,
  VJ_SERVER_FRAME_NAMES,
  VJ_SETLIST_ITEM_KINDS,
  VJ_SETLIST_PLAYBACK_STATUSES,
  VJ_SOCKET_ERROR_CODES,
  VJ_STAGE_CAUSES,
  VJ_STEP_BEAT_COUNTS,
  VJ_STEP_DURATION_KINDS,
  createVjSetlistPlayback,
  createVjStageState,
  isVjRenderMode,
  vjShuffleIntervalMs,
  vjStepDurationMs,
  vjStrobeFlashesPerSecond,
} from "./vj";

describe("vj contract mirror", () => {
  it("builds the default stage", () => {
    expect(createVjStageState("epoch-1", 1000)).toEqual({
      stageEpoch: "epoch-1",
      revision: 0,
      clipSequence: 0,
      activePackId: null,
      liveClipId: null,
      liveGeneratorId: null,
      liveGeneratorVariant: null,
      liveSince: null,
      transition: { mode: "fade", length: { unit: "ms", value: 800 } },
      overlay: {
        text: "",
        style: "big",
        isVisible: false,
        position: "center",
        size: "l",
        colorToken: "cream",
        hideAt: null,
      },
      countdown: { isVisible: false, targetAt: null, label: "" },
      logo: { isVisible: false, corner: "bottomRight" },
      eventCard: { isVisible: false, kind: "qr" },
      effects: {
        speed: 1,
        settings: {},
        isStrobing: false,
        isBlackout: false,
        strobeStartedAt: null,
      },
      mix: { clipId: null, amount: 0, blendMode: "normal" },
      tempo: {
        bpm: 124,
        downbeatAt: 1000,
        quantize: "off",
        source: "manual",
      },
      shuffle: {
        isOn: false,
        intervalKind: "seconds",
        intervalValue: 8,
        source: "pack",
        excludedClipIds: [],
      },
      recentClipIds: [],
      screenOverrides: {},
      activeSetlistId: null,
      setlistIndex: null,
      setlistPlayback: {
        status: "manual",
        itemId: null,
        isFlashConfirmed: false,
        stepStartedAt: null,
        stepEndsAt: null,
        stepDurationMs: null,
        pausedRemainingMs: null,
        isLooping: false,
      },
      updatedAt: 1000,
    });
  });

  it("times a seconds interval", () => {
    const stage = createVjStageState("epoch-1", 0);
    expect(
      vjShuffleIntervalMs(
        { ...stage.shuffle, isOn: true, intervalKind: "seconds" },
        stage.tempo,
      ),
    ).toBe(8000);
  });

  it("times a beats interval at the tempo", () => {
    const stage = createVjStageState("epoch-1", 0);
    const beats = (intervalValue: number, bpm: number) =>
      vjShuffleIntervalMs(
        { ...stage.shuffle, isOn: true, intervalKind: "beats", intervalValue },
        { ...stage.tempo, bpm },
      );
    expect(beats(8, 124)).toBe(3871);
    expect(beats(4, 60)).toBe(4000);
    expect(beats(32, 200)).toBe(9600);
  });

  it("caps the strobe at three flashes a second", () => {
    expect(vjStrobeFlashesPerSecond(60)).toBe(1);
    expect(vjStrobeFlashesPerSecond(124)).toBe(124 / 60);
    expect(vjStrobeFlashesPerSecond(180)).toBe(3);
    expect(vjStrobeFlashesPerSecond(200)).toBe(3);
  });

  it("lists every code once", () => {
    expect(new Set(VJ_REFUSAL_CODES).size).toBe(VJ_REFUSAL_CODES.length);
    expect(VJ_REFUSAL_CODES.length).toBeGreaterThan(26);
    expect(new Set(VJ_SOCKET_ERROR_CODES).size).toBe(
      VJ_SOCKET_ERROR_CODES.length,
    );
    expect(VJ_SOCKET_ERROR_CODES.length).toBeGreaterThan(27);
    // Codes added after v1 append behind vj_server_error, so its index stays put.
    expect(VJ_SOCKET_ERROR_CODES.indexOf("vj_stopped")).toBeGreaterThan(
      VJ_SOCKET_ERROR_CODES.indexOf("vj_server_error"),
    );
    expect(VJ_CLIENT_UPLOAD_CODES).toEqual([
      "VJ_UPLOAD_HEVC",
      "VJ_UPLOAD_UNPLAYABLE",
      "VJ_UPLOAD_GIF_DAMAGED",
      "VJ_UPLOAD_THUMBNAIL_FAILED",
      "VJ_PREVIEW_UNSUPPORTED",
      "VJ_PREVIEW_FAILED",
    ]);
    const refusalCodes: readonly string[] = VJ_REFUSAL_CODES;
    for (const clientCode of VJ_CLIENT_UPLOAD_CODES) {
      expect(refusalCodes).not.toContain(clientCode);
    }
  });

  it("keeps the limits the backend enforces", () => {
    expect(VJ_LIMITS.clipMaxBytes).toBe(104_857_600);
    expect(VJ_LIMITS.thumbnailMaxBytes).toBe(262_144);
    expect(VJ_LIMITS.overlayTextMax).toBe(80);
    expect(VJ_LIMITS.packsMax).toBe(50);
    expect(VJ_LIMITS.packClipsMax).toBe(200);
    expect(VJ_LIMITS.libraryClipsMax).toBe(1000);
    expect(VJ_LIMITS.fadeMsDefault).toBe(800);
    expect(VJ_LIMITS.bpmDefault).toBe(124);
    expect(VJ_LIMITS.quantizeMinLeadMs).toBe(150);
  });

  it("lists the simple renderer and the two render modes", () => {
    expect(VJ_RENDERERS).toEqual(["webgl2", "dom", "simple"]);
    expect(VJ_RENDER_MODES).toEqual(["effects", "simple"]);
    expect(isVjRenderMode("simple")).toBe(true);
    expect(isVjRenderMode("dom")).toBe(false);
    expect(isVjRenderMode(null)).toBe(false);
  });

  it("places the render mode frames right after screen:identify, outside the stamped commands", () => {
    const clientIndex = VJ_CLIENT_FRAME_NAMES.indexOf("screen:identify");
    expect(VJ_CLIENT_FRAME_NAMES[clientIndex + 1]).toBe(
      "screens:setRenderMode",
    );
    const serverIndex = VJ_SERVER_FRAME_NAMES.indexOf("screen:identify");
    expect(VJ_SERVER_FRAME_NAMES[serverIndex + 1]).toBe("screen:renderMode");
    expect(VJ_REMOTE_COMMAND_NAMES).not.toContain("screens:setRenderMode");
  });

  it("lists the two render mode refusals side by side", () => {
    const invalidIndex = VJ_SOCKET_ERROR_CODES.indexOf(
      "vj_render_mode_invalid",
    );
    expect(invalidIndex).toBeGreaterThan(-1);
    expect(VJ_SOCKET_ERROR_CODES[invalidIndex + 1]).toBe(
      "vj_no_screens_connected",
    );
  });
});

describe("vj sequences contract mirror", () => {
  it("builds the default stage with the playback createVjSetlistPlayback(false) answers", () => {
    expect(createVjStageState("epoch-1", 0).setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(createVjSetlistPlayback(true)).toEqual({
      ...createVjSetlistPlayback(false),
      isLooping: true,
    });
  });

  it("lists the sequence vocabulary in contract order", () => {
    expect(VJ_SETLIST_ITEM_KINDS).toEqual(["scene", "clip"]);
    expect(VJ_STEP_DURATION_KINDS).toEqual(["seconds", "beats"]);
    expect(VJ_STEP_BEAT_COUNTS).toEqual([4, 8, 16, 32, 64]);
    expect(VJ_SETLIST_PLAYBACK_STATUSES).toEqual([
      "manual",
      "playing",
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ]);
    const lastCauseIndex = VJ_STAGE_CAUSES.indexOf("countdown_end");
    expect(VJ_STAGE_CAUSES[lastCauseIndex + 1]).toBe("setlist");
  });

  it("keeps the sequence limits", () => {
    expect(VJ_LIMITS.setlistStepSecondsMin).toBe(2);
    expect(VJ_LIMITS.setlistStepSecondsMax).toBe(600);
    expect(VJ_LIMITS.setlistStepSecondsDefault).toBe(8);
    expect(VJ_LIMITS.setlistTimerRetryMs).toBe(1000);
    expect(VJ_LIMITS.setlistItemsMax).toBe(100);
  });

  it("times a step length in seconds and in beats", () => {
    const { tempo } = createVjStageState("epoch-1", 0);
    expect(vjStepDurationMs({ kind: "seconds", value: 8 }, tempo)).toBe(8000);
    expect(vjStepDurationMs({ kind: "seconds", value: 600 }, tempo)).toBe(
      600_000,
    );
    expect(vjStepDurationMs({ kind: "beats", value: 16 }, tempo)).toBe(7742);
    expect(
      vjStepDurationMs({ kind: "beats", value: 4 }, { ...tempo, bpm: 60 }),
    ).toBe(4000);
    expect(
      vjStepDurationMs({ kind: "beats", value: 64 }, { ...tempo, bpm: 200 }),
    ).toBe(19_200);
  });

  it("appends the sequence socket codes and frames", () => {
    expect(VJ_SOCKET_ERROR_CODES.at(-1)).toBe("vj_setlist_flash_unconfirmed");
    const noScreensIndex = VJ_SOCKET_ERROR_CODES.indexOf(
      "vj_no_screens_connected",
    );
    expect(VJ_SOCKET_ERROR_CODES[noScreensIndex + 1]).toBe(
      "vj_setlist_flash_unconfirmed",
    );
    for (const frameNames of [
      VJ_CLIENT_FRAME_NAMES,
      VJ_REMOTE_COMMAND_NAMES,
    ] as const) {
      const previousIndex = frameNames.indexOf("stage:setlistPrevious");
      expect(frameNames[previousIndex + 1]).toBe("stage:setlistSetPlaying");
      expect(frameNames[previousIndex + 2]).toBe("stage:setlistSetLooping");
    }
  });

  it("appends the five sequence refusal codes after VJ_SETLIST_FULL", () => {
    const fullIndex = VJ_REFUSAL_CODES.indexOf("VJ_SETLIST_FULL");
    expect(VJ_REFUSAL_CODES.slice(fullIndex + 1, fullIndex + 6)).toEqual([
      "VJ_SETLIST_STEP_INVALID",
      "VJ_SETLIST_STEP_DURATION_INVALID",
      "VJ_SETLIST_ITEM_NOT_FOUND",
      "VJ_SETLIST_LOOP_INVALID",
      "VJ_SETLIST_PATCH_EMPTY",
    ]);
  });

  it("renames setlist_renamed to setlist_updated in place", () => {
    const kinds: readonly string[] = VJ_LIBRARY_CHANGE_KINDS;
    expect(kinds).not.toContain("setlist_renamed");
    expect(kinds.indexOf("setlist_updated")).toBe(
      kinds.indexOf("setlist_created") + 1,
    );
  });
});
