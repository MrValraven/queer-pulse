/**
 * The story image recipe from the Create Gathering v2 design: a 1080x1920
 * portrait PNG. Every coordinate is a text baseline in canvas pixels.
 */

export const STORY_CANVAS_WIDTH = 1080;
export const STORY_CANVAS_HEIGHT = 1920;

/** The brand wordmark painted at the top. A proper noun in every language. */
export const STORY_BRAND_NAME = "QueerPulse";

/** Brand colour channel tokens (each "r, g, b"). All four stay the same in
 *  both themes, so the image reads identically from a dark-mode session. */
export const STORY_COLOR_TOKENS = {
  plum: "--plum-rgb",
  accent: "--accent-rgb",
  jade: "--jade-rgb",
  cream: "--cream-rgb",
} as const;

export const STORY_FONT_TOKENS = {
  serif: "--serif",
  sans: "--sans",
} as const;

/**
 * Used only when a token cannot be read from the document (no DOM, or a
 * stylesheet that failed to load). Mirrors src/styles/tokens/colors.css and
 * typography.css; keep them in step if the brand palette changes.
 */
export const STORY_FALLBACK_PALETTE = {
  plum: "45, 27, 61",
  accent: "232, 119, 90",
  jade: "74, 140, 111",
  cream: "247, 243, 238",
  serif: '"Fraunces Variable", "Fraunces", Georgia, serif',
  sans: '"DM Sans Variable", "DM Sans", system-ui, sans-serif',
} as const;

export type StoryPalette = Record<keyof typeof STORY_FALLBACK_PALETTE, string>;

export interface StoryOrb {
  tone: "accent" | "jade";
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export const STORY_ORBS: readonly StoryOrb[] = [
  { tone: "accent", x: 950, y: 200, radius: 700, alpha: 0.45 },
  { tone: "jade", x: 100, y: 1750, radius: 700, alpha: 0.4 },
];

export const STORY_BRAND_DOT = { x: 120, y: 180, radius: 14 } as const;

export interface StoryTextSpec {
  x: number;
  y: number;
  size: number;
  weight: number;
  family: "serif" | "sans";
  isItalic?: boolean;
  /** Cream opacity; ignored for the accent tone. */
  alpha?: number;
  tone?: "cream" | "accent";
}

export const STORY_TEXT = {
  brand: { x: 160, y: 200, size: 56, weight: 600, family: "serif" },
  formatName: {
    x: 120,
    y: 520,
    size: 34,
    weight: 500,
    family: "sans",
    alpha: 0.6,
  },
  dayNumber: { x: 100, y: 860, size: 300, weight: 300, family: "serif" },
  weekday: { x: 120, y: 940, size: 60, weight: 400, family: "serif" },
  monthAndTime: { x: 120, y: 1020, size: 60, weight: 400, family: "serif" },
  title: { x: 120, y: 1220, size: 88, weight: 500, family: "serif" },
  place: {
    x: 120,
    y: 0,
    size: 52,
    weight: 400,
    family: "serif",
    isItalic: true,
    tone: "accent",
  },
  details: { x: 120, y: 0, size: 36, weight: 500, family: "sans", alpha: 0.7 },
  url: { x: 120, y: 1800, size: 30, weight: 500, family: "sans", alpha: 0.5 },
} as const satisfies Record<string, StoryTextSpec>;

/** The clear edge kept right of every line. It matches the 120 most lines
 *  start from on the left, so a fitted line ends where the title wraps. */
export const STORY_SIDE_MARGIN = 120;

/** Title wrapping, and where the two lines under it sit, measured from the
 *  baseline of the title's last line. */
export const STORY_TITLE_LAYOUT = {
  /** 840: the canvas width less the title's x and the side margin. */
  maxWidth: STORY_CANVAS_WIDTH - STORY_TEXT.title.x - STORY_SIDE_MARGIN,
  lineHeight: 100,
  /** Four lines keep the place and details clear of the URL at the foot. */
  maxLines: 4,
  placeOffsetY: 120,
  detailsOffsetY: 200,
} as const;

export const STORY_TRUNCATION_MARK = "…";
