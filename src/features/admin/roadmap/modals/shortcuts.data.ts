export interface RoadmapShortcutRow {
  /** One or more keys shown as separate `<kbd>` chips (e.g. `["j", "k"]`). */
  keys: string[];
  /** i18n key for what the shortcut does. */
  labelKey: string;
}

/**
 * The keyboard shortcuts `useRoadmapShortcuts` wires across the roadmap admin
 * tools, in the order shown in the "?" help modal. Kept as static data (not
 * inline in `ShortcutsModal.tsx`) since it's a fixed reference list, same
 * pattern as any other `.data.ts` colocated with its component.
 */
export const ROADMAP_SHORTCUTS: RoadmapShortcutRow[] = [
  { keys: ["/"], labelKey: "admin:roadmap.modals.shortcuts.filter" },
  { keys: ["n"], labelKey: "admin:roadmap.modals.shortcuts.newItem" },
  { keys: ["j", "k"], labelKey: "admin:roadmap.modals.shortcuts.moveThroughCards" },
  { keys: ["e"], labelKey: "admin:roadmap.modals.shortcuts.editFocused" },
  { keys: ["⌘", "↵"], labelKey: "admin:roadmap.modals.shortcuts.saveClose" },
  { keys: ["esc"], labelKey: "admin:roadmap.modals.shortcuts.close" },
  { keys: ["?"], labelKey: "admin:roadmap.modals.shortcuts.thisList" },
  { keys: ["drag"], labelKey: "admin:roadmap.modals.shortcuts.dragMove" },
];
