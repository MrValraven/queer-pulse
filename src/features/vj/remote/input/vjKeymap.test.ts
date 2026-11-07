import { describe, expect, it } from "vitest";
import {
  VJ_CLIP_KEY_CODES,
  VJ_PAD_KEY_CODES,
  VJ_SHORTCUT_ROWS,
  isVjShortcutKeyLabelKey,
  vjActionForKey,
  type VjKeyInput,
} from "./vjKeymap";

function keyInput(
  code: string,
  overrides: Partial<VjKeyInput> = {},
): VjKeyInput {
  return {
    code,
    isShift: false,
    isMeta: false,
    isCtrl: false,
    isAlt: false,
    isRepeat: false,
    isEditableTarget: false,
    ...overrides,
  };
}

describe("vjActionForKey", () => {
  it("Digit1 shows the first clip", () => {
    expect(vjActionForKey(keyInput("Digit1"))).toEqual({
      kind: "goClipAt",
      index: 0,
    });
    expect(vjActionForKey(keyInput("Digit9"))).toEqual({
      kind: "goClipAt",
      index: 8,
    });
  });

  it("KeyA shows clip 10", () => {
    expect(vjActionForKey(keyInput("KeyA"))).toEqual({
      kind: "goClipAt",
      index: 9,
    });
    expect(vjActionForKey(keyInput("KeyL"))).toEqual({
      kind: "goClipAt",
      index: 17,
    });
  });

  it("Shift+KeyZ holds dock slot 1", () => {
    expect(vjActionForKey(keyInput("KeyZ", { isShift: true }))).toEqual({
      kind: "padSlot",
      slot: 0,
    });
    expect(vjActionForKey(keyInput("Period", { isShift: true }))).toEqual({
      kind: "padSlot",
      slot: 8,
    });
  });

  it("B is blackout and Shift+B holds dock slot 5", () => {
    expect(vjActionForKey(keyInput("KeyB"))).toEqual({ kind: "blackout" });
    expect(vjActionForKey(keyInput("KeyB", { isShift: true }))).toEqual({
      kind: "padSlot",
      slot: 4,
    });
  });

  it("Space is go", () => {
    expect(vjActionForKey(keyInput("Space"))).toEqual({ kind: "go" });
  });

  it("R resets the look, T taps the tempo and Q cycles quantize", () => {
    expect(vjActionForKey(keyInput("KeyR"))).toEqual({ kind: "resetLook" });
    expect(vjActionForKey(keyInput("KeyT"))).toEqual({ kind: "tapTempo" });
    expect(vjActionForKey(keyInput("KeyQ"))).toEqual({
      kind: "cycleQuantize",
    });
  });

  it("ignores keys typed into a field", () => {
    expect(
      vjActionForKey(keyInput("Digit1", { isEditableTarget: true })),
    ).toBeNull();
    expect(
      vjActionForKey(keyInput("Space", { isEditableTarget: true })),
    ).toBeNull();
    expect(
      vjActionForKey(
        keyInput("KeyZ", { isShift: true, isEditableTarget: true }),
      ),
    ).toBeNull();
  });

  it("ignores Ctrl and Meta chords", () => {
    expect(vjActionForKey(keyInput("KeyR", { isCtrl: true }))).toBeNull();
    expect(vjActionForKey(keyInput("KeyR", { isMeta: true }))).toBeNull();
    expect(vjActionForKey(keyInput("Digit1", { isAlt: true }))).toBeNull();
    expect(
      vjActionForKey(keyInput("KeyZ", { isShift: true, isMeta: true })),
    ).toBeNull();
  });

  it("ignores auto-repeat", () => {
    expect(vjActionForKey(keyInput("KeyT", { isRepeat: true }))).toBeNull();
    expect(
      vjActionForKey(keyInput("KeyX", { isShift: true, isRepeat: true })),
    ).toBeNull();
  });

  it("arrows return null", () => {
    for (const code of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) {
      expect(vjActionForKey(keyInput(code))).toBeNull();
      expect(vjActionForKey(keyInput(code, { isShift: true }))).toBeNull();
    }
  });

  it("Shift+Slash opens shortcuts", () => {
    expect(vjActionForKey(keyInput("Slash", { isShift: true }))).toEqual({
      kind: "openShortcuts",
    });
    expect(vjActionForKey(keyInput("Slash"))).toBeNull();
  });

  it("Shift with a clip key does nothing", () => {
    expect(vjActionForKey(keyInput("Digit1", { isShift: true }))).toBeNull();
    expect(vjActionForKey(keyInput("Space", { isShift: true }))).toBeNull();
  });

  it("every clip and pad code is unique", () => {
    expect(VJ_CLIP_KEY_CODES).toHaveLength(18);
    expect(VJ_PAD_KEY_CODES).toHaveLength(9);
    expect(new Set(VJ_CLIP_KEY_CODES).size).toBe(VJ_CLIP_KEY_CODES.length);
    expect(new Set(VJ_PAD_KEY_CODES).size).toBe(VJ_PAD_KEY_CODES.length);
    const commandCodes = ["Space", "KeyB", "KeyR", "KeyT", "KeyQ"];
    for (const commandCode of commandCodes) {
      expect(VJ_CLIP_KEY_CODES).not.toContain(commandCode);
    }
    expect(VJ_PAD_KEY_CODES).not.toContain("Slash");
  });
});

describe("VJ_SHORTCUT_ROWS", () => {
  it("labels every row with a vj:keys key", () => {
    expect(VJ_SHORTCUT_ROWS.length).toBeGreaterThan(0);
    for (const row of VJ_SHORTCUT_ROWS) {
      expect(row.labelKey.startsWith("vj:keys.")).toBe(true);
      expect(row.keys.length).toBeGreaterThan(0);
    }
  });

  it("marks named keys as i18n keys and key caps as printed text", () => {
    expect(isVjShortcutKeyLabelKey("vj:keys.shift")).toBe(true);
    expect(isVjShortcutKeyLabelKey("B")).toBe(false);
  });
});
