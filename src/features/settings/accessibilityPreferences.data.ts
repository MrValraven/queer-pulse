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
  skipLink: false,
  textSize: 100,
  colorTheme: "default",
};
