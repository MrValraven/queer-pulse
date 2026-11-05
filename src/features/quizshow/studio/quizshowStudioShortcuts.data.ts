/** One key cap: a letter or word as printed on the key, the platform's command key, or an arrow. */
export type StudioShortcutKey =
  | { kind: "text"; text: string }
  | { kind: "command" }
  | { kind: "arrowUp" }
  | { kind: "arrowDown" }
  | { kind: "delete" };

export interface StudioShortcut {
  id: "new" | "move" | "ends" | "duplicate" | "delete" | "save" | "help";
  /** Pressed together, except `move` and `ends`, whose two keys are alternatives. */
  keys: readonly StudioShortcutKey[];
  labelKey: string;
}

/** Every studio shortcut, in the order the sheet lists them (see useStudioShortcuts). */
export const STUDIO_SHORTCUTS: readonly StudioShortcut[] = [
  {
    id: "new",
    keys: [{ kind: "text", text: "N" }],
    labelKey: "quizshow:studio.shortcuts.newQuestion",
  },
  {
    id: "move",
    keys: [{ kind: "arrowUp" }, { kind: "arrowDown" }],
    labelKey: "quizshow:studio.shortcuts.moveList",
  },
  {
    id: "ends",
    keys: [
      { kind: "text", text: "Home" },
      { kind: "text", text: "End" },
    ],
    labelKey: "quizshow:studio.shortcuts.listEnds",
  },
  {
    id: "duplicate",
    keys: [{ kind: "command" }, { kind: "text", text: "D" }],
    labelKey: "quizshow:studio.shortcuts.duplicate",
  },
  {
    id: "delete",
    keys: [{ kind: "delete" }],
    labelKey: "quizshow:studio.shortcuts.delete",
  },
  {
    id: "save",
    keys: [{ kind: "command" }, { kind: "text", text: "S" }],
    labelKey: "quizshow:studio.shortcuts.save",
  },
  {
    id: "help",
    keys: [{ kind: "text", text: "?" }],
    labelKey: "quizshow:studio.shortcuts.help",
  },
];

/** The ones the one-line strip under the canvas shows. */
export const STUDIO_HINT_SHORTCUT_IDS: readonly StudioShortcut["id"][] = [
  "new",
  "move",
  "duplicate",
  "help",
];
