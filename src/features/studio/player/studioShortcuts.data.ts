/** One row of the player shortcut help (Plan 3 renders it in the help sheet
 *  and on /studio/accessibility). */
export interface StudioPlayerShortcut {
  id: string;
  /** Shown as separate <kbd> chips. An entry that starts with
   *  "studio:shortcuts.key." is a catalog key to translate (Space, Shift);
   *  any other entry is shown as written (a letter, "?" or an arrow). */
  keys: readonly string[];
  labelKey: string;
}

const KEY_LABEL_PREFIX = "studio:shortcuts.key.";
const SPACE = `${KEY_LABEL_PREFIX}space`;
const SHIFT = `${KEY_LABEL_PREFIX}shift`;
const COMMAND_OR_CONTROL = `${KEY_LABEL_PREFIX}commandOrControl`;

export function isStudioShortcutKeyLabelKey(key: string): boolean {
  return key.startsWith(KEY_LABEL_PREFIX);
}

/** Spec 7.9, in table order. The arrows are display text: the glyph lint
 *  rules leave U+2190 to U+21FF alone. */
export const STUDIO_PLAYER_SHORTCUTS: readonly StudioPlayerShortcut[] = [
  { id: "playPause", keys: [SPACE], labelKey: "studio:shortcuts.playPause" },
  { id: "seekBack", keys: ["←"], labelKey: "studio:shortcuts.seekBack" },
  { id: "seekForward", keys: ["→"], labelKey: "studio:shortcuts.seekForward" },
  {
    id: "previousTrack",
    keys: [SHIFT, "←"],
    labelKey: "studio:shortcuts.previousTrack",
  },
  {
    id: "nextTrack",
    keys: [SHIFT, "→"],
    labelKey: "studio:shortcuts.nextTrack",
  },
  { id: "volumeUp", keys: ["↑"], labelKey: "studio:shortcuts.volumeUp" },
  { id: "volumeDown", keys: ["↓"], labelKey: "studio:shortcuts.volumeDown" },
  { id: "mute", keys: ["M"], labelKey: "studio:shortcuts.mute" },
  { id: "shuffle", keys: ["S"], labelKey: "studio:shortcuts.shuffle" },
  { id: "repeat", keys: ["R"], labelKey: "studio:shortcuts.repeat" },
  { id: "lyrics", keys: ["L"], labelKey: "studio:shortcuts.lyrics" },
  { id: "queue", keys: ["Q"], labelKey: "studio:shortcuts.queue" },
  { id: "help", keys: ["?"], labelKey: "studio:shortcuts.help" },
  // The shell's search shortcuts, listed here so the help sheet names every
  // key Studio answers to. The player itself never claims them.
  { id: "focusSearch", keys: ["/"], labelKey: "studio:shortcuts.focusSearch" },
  {
    id: "focusSearchCommand",
    keys: [COMMAND_OR_CONTROL, "K"],
    labelKey: "studio:shortcuts.focusSearch",
  },
];
