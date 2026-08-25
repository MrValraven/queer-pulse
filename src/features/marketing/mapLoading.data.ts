// Decorative "city lights" for the map loader: brand-coloured dots scattered
// across the panel that breathe at staggered offsets — queer venues waking up
// across Lisbon before the real pins land. Positions/timings are hand-tuned for
// an organic, un-gridded scatter; colours cycle the warm brand palette. The
// plum-toned lights use --text-strong (identical to plum in light mode) rather
// than bare --plum, so they flip to a luminous light in dark mode instead of
// going dark-on-dark — every light stays lit on the night-sky field. Purely
// decorative (the layer is aria-hidden), so no semantics ride on these values.
export interface MapLoadingDot {
  top: string;
  left: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export const MAP_LOADING_DOTS: MapLoadingDot[] = [
  {
    top: "18%",
    left: "14%",
    size: 10,
    color: "var(--text-strong)",
    delay: 0,
    duration: 2.8,
  },
  {
    top: "30%",
    left: "76%",
    size: 8,
    color: "var(--accent)",
    delay: 0.5,
    duration: 3.1,
  },
  {
    top: "13%",
    left: "52%",
    size: 7,
    color: "var(--jade)",
    delay: 0.9,
    duration: 2.6,
  },
  {
    top: "58%",
    left: "22%",
    size: 9,
    color: "var(--accent)",
    delay: 0.3,
    duration: 3.0,
  },
  {
    top: "45%",
    left: "87%",
    size: 11,
    color: "var(--text-strong)",
    delay: 0.7,
    duration: 2.9,
  },
  {
    top: "72%",
    left: "58%",
    size: 8,
    color: "var(--jade)",
    delay: 1.1,
    duration: 3.2,
  },
  {
    top: "36%",
    left: "38%",
    size: 6,
    color: "var(--accent-ink)",
    delay: 0.2,
    duration: 2.5,
  },
  {
    top: "80%",
    left: "30%",
    size: 9,
    color: "var(--text-strong)",
    delay: 0.6,
    duration: 3.0,
  },
  {
    top: "63%",
    left: "83%",
    size: 7,
    color: "var(--jade)",
    delay: 1.0,
    duration: 2.7,
  },
  {
    top: "24%",
    left: "33%",
    size: 8,
    color: "var(--accent)",
    delay: 0.4,
    duration: 2.9,
  },
];

// Decorative "street web" drawn behind the lights: a loose, un-gridded network
// of lines threaded through the dot positions above, so each breathing light
// lands on an intersection — Lisbon's streets sketching themselves in while the
// venues wake up. Points are `x y` pairs in a 0–100 space matching the dots'
// left/top percentages; the loader's SVG uses preserveAspectRatio="none" so the
// two coordinate spaces line up exactly. `artery` streets draw a touch heavier.
// Purely decorative (the layer is aria-hidden), so no semantics ride on these.
export interface MapLoadingStreet {
  points: string;
  artery: boolean;
  delay: number;
}

export const MAP_LOADING_STREETS: MapLoadingStreet[] = [
  // Top arc sweeping across the skyline.
  { points: "14,18 33,24 52,13 76,30 87,45", artery: true, delay: 0 },
  // Left descent down to the riverfront.
  { points: "14,18 22,58 30,80", artery: true, delay: 0.15 },
  // Mid diagonal cutting through the centre.
  { points: "38,36 58,72 83,63", artery: false, delay: 0.3 },
  // Cross-street stitching the top arc to the left descent.
  { points: "52,13 38,36 22,58", artery: false, delay: 0.4 },
  // Right vertical linking the arc down to the centre.
  { points: "76,30 58,72", artery: false, delay: 0.5 },
  // Bottom-right sweep along the water's edge.
  { points: "87,45 83,63 58,72 30,80", artery: false, delay: 0.6 },
];
