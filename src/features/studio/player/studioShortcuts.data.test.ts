import { describe, expect, it } from "vitest";
import {
  isStudioShortcutKeyLabelKey,
  STUDIO_PLAYER_SHORTCUTS,
} from "./studioShortcuts.data";

/** Contract D: the only shortcut keys Plan 2 may reference. */
const ACTION_KEYS = [
  "playPause",
  "seekBack",
  "seekForward",
  "previousTrack",
  "nextTrack",
  "volumeUp",
  "volumeDown",
  "mute",
  "shuffle",
  "repeat",
  "lyrics",
  "queue",
  "help",
  // "/" and Cmd or Ctrl+K both focus search.
  "focusSearch",
  "focusSearch",
].map((name) => `studio:shortcuts.${name}`);
const KEY_LABEL_KEYS = [
  "space",
  "shift",
  "left",
  "right",
  "up",
  "down",
  "commandOrControl",
].map((name) => `studio:shortcuts.key.${name}`);

describe("STUDIO_PLAYER_SHORTCUTS", () => {
  it("lists every contract action, in table order", () => {
    expect(STUDIO_PLAYER_SHORTCUTS.map((row) => row.labelKey)).toEqual(
      ACTION_KEYS,
    );
    const ids = STUDIO_PLAYER_SHORTCUTS.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only contract key labels for words", () => {
    for (const row of STUDIO_PLAYER_SHORTCUTS) {
      for (const key of row.keys) {
        if (isStudioShortcutKeyLabelKey(key))
          expect(KEY_LABEL_KEYS).toContain(key);
        else expect(key.length).toBe(1);
      }
    }
  });
});
