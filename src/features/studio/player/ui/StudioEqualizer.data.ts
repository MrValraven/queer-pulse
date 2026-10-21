export type StudioEqualizerPresetId = "flat" | "warm" | "voice" | "bass";

export interface StudioEqualizerPreset {
  id: StudioEqualizerPresetId;
  labelKey: string;
  /** dB for the five bands: 80 Hz, 250 Hz, 1 kHz, 3.5 kHz, 10 kHz. */
  gainsDb: readonly number[];
}

/** Gentle curves that colour the sound without fighting the mix. Warm adds
 *  weight and rounds off the top; Voice lifts the speech band and trims
 *  rumble; Bass lifts the low end with a little body above it. */
export const STUDIO_EQUALIZER_PRESETS: readonly StudioEqualizerPreset[] = [
  {
    id: "flat",
    labelKey: "studio:player.equalizer.presets.flat",
    gainsDb: [0, 0, 0, 0, 0],
  },
  {
    id: "warm",
    labelKey: "studio:player.equalizer.presets.warm",
    gainsDb: [3, 1, 0, -1, -2],
  },
  {
    id: "voice",
    labelKey: "studio:player.equalizer.presets.voice",
    gainsDb: [-3, -1, 1, 3, 1],
  },
  {
    id: "bass",
    labelKey: "studio:player.equalizer.presets.bass",
    gainsDb: [5, 2, 0, 0, 0],
  },
];
