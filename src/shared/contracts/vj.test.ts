import { describe, expect, it } from "vitest";
import {
  VJ_CLIENT_FRAME_NAMES,
  VJ_CLIENT_UPLOAD_CODES,
  VJ_LIMITS,
  VJ_REFUSAL_CODES,
  VJ_REMOTE_COMMAND_NAMES,
  VJ_RENDERERS,
  VJ_RENDER_MODES,
  VJ_SERVER_FRAME_NAMES,
  VJ_SOCKET_ERROR_CODES,
  createVjStageState,
  isVjRenderMode,
  vjShuffleIntervalMs,
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
