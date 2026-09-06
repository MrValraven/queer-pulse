import { TEXT_SCALE_DEFAULT } from "../../app/providers/accessibilityContext";

/**
 * The accessibility pane's preferences.
 *
 * Every one of these is applied. The shape used to carry twelve, ten of which
 * were badged "coming soon" and rendered inert: high contrast, a colour theme,
 * a dyslexia font, a larger-text boolean, pause-decorative, larger tap targets
 * and sticky nav. PRD-307 removed those rows rather than leaving dead switches
 * on the one page that exists specifically for members who need it. What each
 * of them would take is recorded in the deep-scan build notes; a settings page
 * is not the place to promise it.
 */
export interface A11yPrefs {
  reduceMotion: boolean;
  wideSpacing: boolean;
  focusRings: boolean;
  skipLink: boolean;
  /** Root font size as a percentage of the browser's default. */
  textSize: number;
}

export const DEFAULT_PREFS: A11yPrefs = {
  reduceMotion: false,
  wideSpacing: false,
  focusRings: false,
  // WCAG 2.4.1 (Bypass Blocks) is a baseline, not a taste: the link ships on for
  // everyone. It's visually hidden until it takes focus, so it costs sighted
  // mouse users nothing — and a keyboard user shouldn't have to reach Settings
  // (through the very nav they can't bypass) to get it.
  skipLink: true,
  textSize: TEXT_SCALE_DEFAULT,
};
