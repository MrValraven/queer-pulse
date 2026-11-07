/**
 * Keyboard shortcuts for the remote. Keys are read by physical position
 * (`KeyboardEvent.code`), so AZERTY and QWERTZ layouts keep the same places
 * under the hand. Arrow keys belong to the clip grid's focus and stay out of
 * this map.
 */
import type { VjRemoteAction } from "./vjRemoteAction";

export interface VjKeyInput {
  code: string;
  isShift: boolean;
  isMeta: boolean;
  isCtrl: boolean;
  isAlt: boolean;
  isRepeat: boolean;
  isEditableTarget: boolean;
}

/** Clips 1 to 9 on the digit row, then clips 10 to 18 on the home row. */
export const VJ_CLIP_KEY_CODES: readonly string[] = [
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
];

/** With Shift held, the bottom row holds dock slots 1 to 9. */
export const VJ_PAD_KEY_CODES: readonly string[] = [
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
];

const VJ_SHORTCUTS_KEY_CODE = "Slash";

const VJ_UNSHIFTED_COMMANDS: Readonly<Record<string, VjRemoteAction>> = {
  Space: { kind: "go" },
  KeyB: { kind: "blackout" },
  KeyR: { kind: "resetLook" },
  KeyT: { kind: "tapTempo" },
  KeyQ: { kind: "cycleQuantize" },
};

function shiftedActionOf(code: string): VjRemoteAction | null {
  if (code === VJ_SHORTCUTS_KEY_CODE) return { kind: "openShortcuts" };
  const padSlot = VJ_PAD_KEY_CODES.indexOf(code);
  return padSlot >= 0 ? { kind: "padSlot", slot: padSlot } : null;
}

function unshiftedActionOf(code: string): VjRemoteAction | null {
  const clipIndex = VJ_CLIP_KEY_CODES.indexOf(code);
  if (clipIndex >= 0) return { kind: "goClipAt", index: clipIndex };
  return VJ_UNSHIFTED_COMMANDS[code] ?? null;
}

/**
 * The action a key press asks for, or null when the key is not a shortcut.
 * Typing into a field, any Meta, Ctrl or Alt chord and auto-repeat all read
 * as null, so browser and system shortcuts keep working.
 */
export function vjActionForKey(input: VjKeyInput): VjRemoteAction | null {
  if (input.isEditableTarget || input.isRepeat) return null;
  if (input.isMeta || input.isCtrl || input.isAlt) return null;
  return input.isShift
    ? shiftedActionOf(input.code)
    : unshiftedActionOf(input.code);
}

/**
 * One line of the shortcut sheet. Each entry of `keys` is one key chip,
 * pressed together with the others. An entry that starts with `vj:` is an
 * i18n key for a named key (Shift, Space, Arrow keys); any other entry is the
 * key cap as printed. `rangeEndKey`, when set, makes the row a range running
 * from the last chip of `keys` to this key.
 */
export interface VjShortcutRow {
  keys: readonly string[];
  rangeEndKey?: string;
  labelKey: string;
}

/** True when a `VjShortcutRow` chip names an i18n key to translate. */
export function isVjShortcutKeyLabelKey(key: string): boolean {
  return key.startsWith("vj:");
}

export const VJ_SHORTCUT_ROWS: readonly VjShortcutRow[] = [
  { keys: ["1"], rangeEndKey: "9", labelKey: "vj:keys.clips1to9" },
  { keys: ["A"], rangeEndKey: "L", labelKey: "vj:keys.clips10to18" },
  { keys: ["vj:keys.space"], labelKey: "vj:keys.go" },
  { keys: ["B"], labelKey: "vj:keys.blackout" },
  { keys: ["R"], labelKey: "vj:keys.resetLook" },
  { keys: ["T"], labelKey: "vj:keys.tapTempo" },
  { keys: ["Q"], labelKey: "vj:keys.quantize" },
  { keys: ["vj:keys.arrowKeys"], labelKey: "vj:keys.arrows" },
  {
    keys: ["vj:keys.shift", "Z"],
    rangeEndKey: ".",
    labelKey: "vj:keys.holdPad",
  },
  { keys: ["vj:keys.shift", "/"], labelKey: "vj:keys.openShortcuts" },
];
