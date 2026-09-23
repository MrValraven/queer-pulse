/**
 * The quick-pick frame colours offered beside the sticker builder's colour
 * field. Raw hex is correct here: these are sticker ARTWORK colours baked into
 * the exported PNG, so they must never shift with the theme or a token change.
 *
 * Cream comes first because it is the template default
 * (`UNO_REVERSE_DEFAULTS.frameColor`). The set spans a warm light, a pure
 * light and a dark, plus the brand coral (the `--accent` hue, copied as a
 * fixed value) for a pack that should read as QueerPulse's own.
 */
export interface StickerColorPreset {
  id: string;
  /** Lowercase `#rrggbb`, the same form the colour field commits. */
  color: string;
  /** Key under `admin:stickerPacks.color.preset.*`. */
  labelKey: string;
}

export const STICKER_COLOR_PRESETS: readonly StickerColorPreset[] = [
  {
    id: "cream",
    color: "#f6f2e8",
    labelKey: "admin:stickerPacks.color.preset.cream",
  },
  {
    id: "white",
    color: "#ffffff",
    labelKey: "admin:stickerPacks.color.preset.white",
  },
  {
    id: "ink",
    color: "#1b1b1b",
    labelKey: "admin:stickerPacks.color.preset.ink",
  },
  {
    id: "coral",
    color: "#e8775a",
    labelKey: "admin:stickerPacks.color.preset.coral",
  },
];
