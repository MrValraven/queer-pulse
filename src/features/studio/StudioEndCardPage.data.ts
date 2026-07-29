/* Fixed constellation dot coordinates (in the 1920×1080 frame). */
export const DOT_COORDS: ReadonlyArray<readonly [number, number]> = [
  [300, 180],
  [470, 120],
  [640, 230],
  [250, 330],
  [560, 360],
  [1300, 160],
  [1480, 250],
  [1660, 150],
  [1380, 330],
  [1620, 360],
  [920, 120],
  [1050, 250],
  [760, 310],
];

/* Hairline pairs — indices into DOT_COORDS. */
export const HAIRLINE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 4],
  [5, 6],
  [6, 7],
  [5, 8],
  [7, 9],
  [10, 11],
  [11, 12],
];

export const SPINE_COUNT = 150;
/* The two bars near the middle rendered in jade-light. */
export const JADE_BARS = new Set([96, 97]);
