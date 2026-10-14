import type { TFunction } from "../../../../shared/i18n/types";
import { isStudioShortcutKeyLabelKey } from "../studioShortcuts.data";

/** A shortcut key as shown in a chip: `studio:shortcuts.key.*` catalog keys
 *  are translated, display text such as "M", "?" or an arrow stays as it is
 *  (Plan 2's rule, beside the data). */
export function shortcutKeyLabel(key: string, t: TFunction): string {
  return isStudioShortcutKeyLabelKey(key) ? t(key) : key;
}

const ARROW_NAME_KEYS: Readonly<Record<string, string>> = {
  "\u2190": "studio:shortcuts.key.left",
  "\u2192": "studio:shortcuts.key.right",
  "\u2191": "studio:shortcuts.key.up",
  "\u2193": "studio:shortcuts.key.down",
};

/** What a screen reader says for a chip: an arrow glyph is announced
 *  unreliably, so it maps to its catalog name ("Left arrow"); any other key
 *  reads as it is shown. */
export function shortcutKeySpokenLabel(key: string, t: TFunction): string {
  const arrowNameKey = ARROW_NAME_KEYS[key];
  return arrowNameKey ? t(arrowNameKey) : shortcutKeyLabel(key, t);
}
