import { describe, expect, it } from "vitest";
import {
  VJ_CLIENT_UPLOAD_CODES,
  VJ_LIMITS,
  VJ_REFUSAL_CODES,
  VJ_SOCKET_ERROR_CODES,
  createVjStageState,
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
      transition: { mode: "fade", fadeMs: 800 },
      overlay: { text: "", style: "big", isVisible: false },
      effects: {
        speed: 1,
        isMonochrome: false,
        isMirrored: false,
        isHueCycling: false,
        isStrobing: false,
        isBlackout: false,
        strobeStartedAt: null,
      },
      shuffle: {
        isOn: false,
        intervalKind: "seconds",
        intervalValue: 8,
        bpm: 124,
      },
      updatedAt: 1000,
    });
  });

  it("times a seconds interval", () => {
    expect(
      vjShuffleIntervalMs({
        isOn: true,
        intervalKind: "seconds",
        intervalValue: 8,
        bpm: 124,
      }),
    ).toBe(8000);
  });

  it("times a beats interval at the tempo", () => {
    const beats = (intervalValue: number, bpm: number) =>
      vjShuffleIntervalMs({
        isOn: true,
        intervalKind: "beats",
        intervalValue,
        bpm,
      });
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
    expect(VJ_REFUSAL_CODES).toHaveLength(26);
    expect(new Set(VJ_REFUSAL_CODES).size).toBe(26);
    expect(VJ_SOCKET_ERROR_CODES).toHaveLength(27);
    expect(new Set(VJ_SOCKET_ERROR_CODES).size).toBe(27);
    expect(VJ_CLIENT_UPLOAD_CODES).toHaveLength(4);
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
  });
});
