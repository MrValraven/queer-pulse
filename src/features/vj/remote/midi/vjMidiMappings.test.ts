import { afterEach, describe, expect, it, vi } from "vitest";
import { VJ_REMOTE_MIDI_STORAGE_KEY } from "../../vj.constants";
import {
  VJ_MIDI_MAPPINGS_MAX,
  isVjMidiContinuousTarget,
  parseVjMidiMappings,
  readVjMidiMappings,
  removeVjMidiMapping,
  upsertVjMidiMapping,
  vjMidiActionOf,
  vjMidiTargetKey,
  writeVjMidiMappings,
  type VjMidiMapping,
} from "./vjMidiMappings";

const PAD_ON_NOTE: VjMidiMapping = {
  controlKey: "note:1:36",
  target: { kind: "pad", padId: "invert" },
};
const CROSSFADER_ON_CC: VjMidiMapping = {
  controlKey: "cc:1:7",
  target: { kind: "crossfader" },
};

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("mapping list", () => {
  it("one control maps to one target", () => {
    const first = upsertVjMidiMapping([], PAD_ON_NOTE);
    const remapped = upsertVjMidiMapping(first, {
      controlKey: "note:1:36",
      target: { kind: "go" },
    });
    expect(remapped).toEqual([
      { controlKey: "note:1:36", target: { kind: "go" } },
    ]);
  });

  it("mapping a target again drops its old control", () => {
    const first = upsertVjMidiMapping([CROSSFADER_ON_CC], PAD_ON_NOTE);
    const moved = upsertVjMidiMapping(first, {
      controlKey: "note:2:40",
      target: { kind: "pad", padId: "invert" },
    });
    expect(moved).toEqual([
      CROSSFADER_ON_CC,
      { controlKey: "note:2:40", target: { kind: "pad", padId: "invert" } },
    ]);
  });

  it("keeps at most the cap, dropping the oldest", () => {
    let mappings: VjMidiMapping[] = [];
    for (let slotIndex = 0; slotIndex <= VJ_MIDI_MAPPINGS_MAX; slotIndex += 1) {
      mappings = upsertVjMidiMapping(mappings, {
        controlKey: `note:${Math.floor(slotIndex / 128) + 1}:${slotIndex % 128}`,
        target: { kind: "clipSlot", index: slotIndex },
      });
    }
    expect(mappings).toHaveLength(VJ_MIDI_MAPPINGS_MAX);
    expect(mappings[0]?.target).toEqual({ kind: "clipSlot", index: 1 });
  });

  it("removes one mapping by control", () => {
    expect(
      removeVjMidiMapping([PAD_ON_NOTE, CROSSFADER_ON_CC], "note:1:36"),
    ).toEqual([CROSSFADER_ON_CC]);
  });

  it("names each target once", () => {
    expect(vjMidiTargetKey({ kind: "clipSlot", index: 4 })).toBe("clipSlot:4");
    expect(vjMidiTargetKey({ kind: "pad", padId: "strobe" })).toBe(
      "pad:strobe",
    );
    expect(vjMidiTargetKey({ kind: "blackout" })).toBe("blackout");
  });

  it("crossfader and transition length are continuous", () => {
    expect(isVjMidiContinuousTarget({ kind: "crossfader" })).toBe(true);
    expect(isVjMidiContinuousTarget({ kind: "transitionLength" })).toBe(true);
    expect(isVjMidiContinuousTarget({ kind: "go" })).toBe(false);
    expect(isVjMidiContinuousTarget({ kind: "clipSlot", index: 0 })).toBe(
      false,
    );
  });
});

describe("parseVjMidiMappings", () => {
  it("parse drops malformed rows", () => {
    const parsed = parseVjMidiMappings([
      PAD_ON_NOTE,
      null,
      "note:1:1",
      { controlKey: "note:17:1", target: { kind: "go" } },
      { controlKey: "note:1:128", target: { kind: "go" } },
      { controlKey: "pitch:1:1", target: { kind: "go" } },
      { controlKey: "cc:1:9", target: { kind: "pad", padId: "sparkles" } },
      { controlKey: "cc:1:10", target: { kind: "clipSlot", index: -1 } },
      { controlKey: "cc:1:11", target: { kind: "clipSlot", index: 1.5 } },
      { controlKey: "cc:1:12", target: { kind: "warp" } },
      { controlKey: "note:1:36", target: { kind: "go" } },
      { controlKey: "note:3:3", target: { kind: "pad", padId: "invert" } },
      CROSSFADER_ON_CC,
      { controlKey: "note:1:50", target: { kind: "pad", padId: "strobe" } },
    ]);
    expect(parsed).toEqual([
      PAD_ON_NOTE,
      CROSSFADER_ON_CC,
      { controlKey: "note:1:50", target: { kind: "pad", padId: "strobe" } },
    ]);
  });

  it("a value that is no list reads as none", () => {
    expect(parseVjMidiMappings({ controlKey: "note:1:1" })).toEqual([]);
    expect(parseVjMidiMappings("garbage")).toEqual([]);
    expect(parseVjMidiMappings(undefined)).toEqual([]);
  });
});

describe("vjMidiActionOf", () => {
  it("a note drives a pad press and release", () => {
    expect(
      vjMidiActionOf(PAD_ON_NOTE, {
        kind: "noteOn",
        channel: 1,
        note: 36,
        velocity: 100,
      }),
    ).toEqual({ action: { kind: "pad", padId: "invert" }, phase: "press" });
    expect(
      vjMidiActionOf(PAD_ON_NOTE, { kind: "noteOff", channel: 1, note: 36 }),
    ).toEqual({ action: { kind: "pad", padId: "invert" }, phase: "release" });
  });

  it("a CC drives a pad press at 64 and a release below it", () => {
    const padOnCc: VjMidiMapping = {
      controlKey: "cc:1:20",
      target: { kind: "pad", padId: "glitch" },
    };
    const ccAt = (value: number) =>
      ({ kind: "cc", channel: 1, controller: 20, value }) as const;
    expect(vjMidiActionOf(padOnCc, ccAt(127), 0)?.phase).toBe("press");
    expect(vjMidiActionOf(padOnCc, ccAt(100), 127)).toBeNull();
    expect(vjMidiActionOf(padOnCc, ccAt(0), 127)?.phase).toBe("release");
  });

  it("a CC drives the crossfader with a normalized value", () => {
    expect(
      vjMidiActionOf(CROSSFADER_ON_CC, {
        kind: "cc",
        channel: 1,
        controller: 7,
        value: 127,
      }),
    ).toEqual({ action: { kind: "crossfader", amount: 1 }, phase: "value" });
    expect(
      vjMidiActionOf(
        { controlKey: "cc:1:7", target: { kind: "transitionLength" } },
        { kind: "cc", channel: 1, controller: 7, value: 0 },
      ),
    ).toEqual({
      action: { kind: "transitionLength", normalized: 0 },
      phase: "value",
    });
  });

  it("a note on the crossfader does nothing", () => {
    expect(
      vjMidiActionOf(
        { controlKey: "note:1:7", target: { kind: "crossfader" } },
        { kind: "noteOn", channel: 1, note: 7, velocity: 90 },
      ),
    ).toBeNull();
  });

  it("a clip slot shows on note on and on a CC crossing up only", () => {
    const slotOnCc: VjMidiMapping = {
      controlKey: "cc:2:1",
      target: { kind: "clipSlot", index: 3 },
    };
    const ccAt = (value: number) =>
      ({ kind: "cc", channel: 2, controller: 1, value }) as const;
    expect(vjMidiActionOf(slotOnCc, ccAt(64), 10)).toEqual({
      action: { kind: "goClipAt", index: 3 },
      phase: "press",
    });
    expect(vjMidiActionOf(slotOnCc, ccAt(90), 64)).toBeNull();
    expect(vjMidiActionOf(slotOnCc, ccAt(0), 90)).toBeNull();
    expect(
      vjMidiActionOf(
        { controlKey: "note:1:60", target: { kind: "clipSlot", index: 0 } },
        { kind: "noteOff", channel: 1, note: 60 },
      ),
    ).toBeNull();
  });

  it("a message from another control does nothing", () => {
    expect(
      vjMidiActionOf(PAD_ON_NOTE, {
        kind: "noteOn",
        channel: 2,
        note: 36,
        velocity: 100,
      }),
    ).toBeNull();
    expect(vjMidiActionOf(PAD_ON_NOTE, { kind: "ignored" })).toBeNull();
  });
});

describe("mapping storage", () => {
  it("writes and reads the mappings back", () => {
    writeVjMidiMappings([PAD_ON_NOTE, CROSSFADER_ON_CC]);
    expect(readVjMidiMappings()).toEqual([PAD_ON_NOTE, CROSSFADER_ON_CC]);
  });

  it("an empty list clears the key", () => {
    writeVjMidiMappings([PAD_ON_NOTE]);
    writeVjMidiMappings([]);
    expect(window.localStorage.getItem(VJ_REMOTE_MIDI_STORAGE_KEY)).toBeNull();
  });

  it("reads none from a corrupt value", () => {
    window.localStorage.setItem(VJ_REMOTE_MIDI_STORAGE_KEY, "{oops");
    expect(readVjMidiMappings()).toEqual([]);
  });

  it("reads none and writes quietly when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readVjMidiMappings()).toEqual([]);
    expect(() => writeVjMidiMappings([PAD_ON_NOTE])).not.toThrow();
  });
});
