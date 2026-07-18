export type ColorTheme = "default" | "softer" | "high-contrast";

export interface A11yPrefs {
  highContrast: boolean;
  largerText: boolean;
  dyslexia: boolean;
  reduceMotion: boolean;
  pauseDecorative: boolean;
  wideSpacing: boolean;
  focusRings: boolean;
  largeTargets: boolean;
  stickyNav: boolean;
  skipLink: boolean;
  textSize: number;
  colorTheme: ColorTheme;
}

export const DEFAULT_PREFS: A11yPrefs = {
  highContrast: false,
  largerText: false,
  dyslexia: false,
  reduceMotion: false,
  pauseDecorative: false,
  wideSpacing: false,
  focusRings: false,
  largeTargets: false,
  stickyNav: true,
  // WCAG 2.4.1 (Bypass Blocks) is a baseline, not a taste: the link ships on for
  // everyone. It's visually hidden until it takes focus, so it costs sighted
  // mouse users nothing — and a keyboard user shouldn't have to reach Settings
  // (through the very nav they can't bypass) to get it.
  skipLink: true,
  textSize: 100,
  colorTheme: "default",
};
