import type { StickerSketch } from "../kit/stickerSketch";

export type TeaStyle = { accentColor: string; hasDieCut: boolean };

export const TEA_DEFAULTS: TeaStyle = {
  accentColor: "#e8775a",
  hasDieCut: true,
};

export const TEA_PALETTE = {
  ink: "#1b1b1b",
  cream: "#f7f3ee",
  paper: "#ffffff",
  gold: "#f5c542",
  goldDark: "#d9a21b",
  goldLight: "#fbe08a",
  tea: "#c27a3a",
  teaDark: "#8f5424",
  teaLight: "#e3a567",
  night: "#2b2b3a",
  nightShine: "#5a5a70",
  shadow: "#4a4160",
  spark: "#ffd23f",
  highlighter: "#fff27a",
  red: "#e0245e",
  silver: "#c9ced8",
  teal: "#6fd3c9",
  receiptLine: "#c9c3ba",
  receiptLineDark: "#8a847c",
  plateInner: "#f1ede6",
  beamLight: "#fff3b0",
  discoBase: "#d7dbe3",
  discoMid: "#9aa3b5",
  discoLight: "#c3c9d5",
  discoPale: "#eef0f4",
} as const;

export type TeaItemId =
  | "spill-the-tea"
  | "throwing-shade"
  | "sparkles"
  | "mother"
  | "receipts"
  | "watching"
  | "unbothered"
  | "mwah"
  | "ate"
  | "the-walk"
  | "lets-dance"
  | "fan-clack";

/** Draws one Tea sticker into the sketch in 512 space; the template fits it. */
export type TeaArt = (sketch: StickerSketch, accentColor: string) => void;
