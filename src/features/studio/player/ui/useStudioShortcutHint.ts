import { useCallback } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_PLAYER_SHORTCUTS } from "../studioShortcuts.data";
import { useStudioListeningPreferences } from "../useStudioPlayerPreferences";
import {
  isSingleKeyShortcut,
  type StudioPlayerShortcutId,
} from "../useStudioPlayerShortcuts";
import { shortcutKeyLabel } from "./studioShortcutKeys";

/** `aria-keyshortcuts` values (WAI-ARIA key names) for the controls that
 *  carry a shortcut. */
const ARIA_KEY_SHORTCUTS: Partial<Record<StudioPlayerShortcutId, string>> = {
  playPause: "Space",
  previousTrack: "Shift+ArrowLeft",
  nextTrack: "Shift+ArrowRight",
  mute: "M",
  shuffle: "S",
  repeat: "R",
  queue: "Q",
};

export interface StudioShortcutHint {
  /** The tooltip text: "Shuffle (S)", or the bare label when the shortcut
   *  is switched off. */
  tooltip: string;
  /** For `aria-keyshortcuts`; undefined when the shortcut is off. */
  ariaKeyShortcuts: string | undefined;
}

/** DES-13: an icon control's tooltip names its shortcut, so mouse members
 *  find Space, S, R, M and Q. With single-key shortcuts off in Studio
 *  Settings, the letters drop out of the hint. */
export function useStudioShortcutHint(): (
  label: string,
  shortcutId: StudioPlayerShortcutId,
) => StudioShortcutHint {
  const { t } = useTranslation();
  const { preferences } = useStudioListeningPreferences();
  const areSingleKeysOn = preferences.areSingleKeyShortcutsOn;
  return useCallback(
    (label, shortcutId) => {
      const shortcut = STUDIO_PLAYER_SHORTCUTS.find(
        (entry) => entry.id === shortcutId,
      );
      const isOff = isSingleKeyShortcut(shortcutId) && !areSingleKeysOn;
      if (!shortcut || isOff)
        return { tooltip: label, ariaKeyShortcuts: undefined };
      const keys = shortcut.keys
        .map((key) => shortcutKeyLabel(key, t))
        .join("+");
      return {
        tooltip: t("studio:player.shortcutHint", { label, keys }),
        ariaKeyShortcuts: ARIA_KEY_SHORTCUTS[shortcutId],
      };
    },
    [areSingleKeysOn, t],
  );
}
