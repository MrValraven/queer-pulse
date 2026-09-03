/**
 * SVG builders for the QueerPulse mark, for the asset generators.
 *
 * The geometry is read from the same JSON the React component
 * (src/shared/components/ui/BrandMark.tsx) renders from, so the favicon, the
 * PWA icons, the splash screens, the press kit and the OG image cannot drift
 * from what the app draws. Colours are passed in as sRGB hex by the caller,
 * which reads them from the token stylesheet or the manifest constants.
 */
import { readFile } from "node:fs/promises";

const GEOMETRY_PATH = new URL(
  "../src/shared/components/ui/brandMark.geometry.json",
  import.meta.url,
);

export const geometry = JSON.parse(await readFile(GEOMETRY_PATH, "utf8"));

const SIZE = geometry.viewBox;
const CENTRE = geometry.centre;

function ring({ r, strokeWidth, opacity }, colour) {
  return `<circle cx="${CENTRE}" cy="${CENTRE}" r="${r}" fill="none" stroke="${colour}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

/**
 * The mark's shapes only (no ground), in one of its four states.
 *
 * `core` and `ring` are hex colours. Pass the same colour to both for the
 * mono version; pass `null` as `ring` on the `dot` state (it has none).
 */
export function markShapes({ state = "rest", core, ring: ringColour }) {
  switch (state) {
    case "rest":
      return [
        `<path d="${geometry.outerArc.path}" fill="none" stroke="${ringColour}" stroke-width="${geometry.outerArc.strokeWidth}" stroke-linecap="round" opacity="${geometry.outerArc.opacity}"/>`,
        ring(geometry.innerRing, ringColour),
        `<circle cx="${CENTRE}" cy="${CENTRE}" r="${geometry.core.r}" fill="${core}"/>`,
      ].join("\n  ");
    case "compact":
      return [
        ring(geometry.compactRing, ringColour),
        `<circle cx="${CENTRE}" cy="${CENTRE}" r="${geometry.core.r}" fill="${core}"/>`,
      ].join("\n  ");
    case "dot":
      return `<circle cx="${CENTRE}" cy="${CENTRE}" r="${geometry.dotAlone.r}" fill="${core}"/>`;
    case "gathering": {
      const { satellites, satelliteOpacity, coreR } = geometry.gathering;
      return [
        ...satellites.map(
          (s) =>
            `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${ringColour}" opacity="${satelliteOpacity}"/>`,
        ),
        `<circle cx="${CENTRE}" cy="${CENTRE}" r="${coreR}" fill="${core}"/>`,
      ].join("\n  ");
    }
    default:
      throw new Error(`Unknown mark state: ${state}`);
  }
}

/**
 * A complete SVG document of the mark.
 *
 * `tile` paints an opaque ground behind the shapes: `{ fill, radius }`, where
 * `radius` is in the 64-unit grid (`geometry.tileRadius` for the rounded
 * favicon tile, 0 for a full-bleed square the platform will mask itself).
 * `inset` scales the shapes toward the centre (0.8 leaves the 10%-per-side
 * margin Android's maskable safe zone wants). `label` adds role/aria-label.
 */
export function markSvg({
  state = "rest",
  core,
  ring,
  tile = null,
  inset = 1,
  label = null,
}) {
  const shapes = markShapes({ state, core, ring });
  const offset = (SIZE * (1 - inset)) / 2;
  const group =
    inset === 1
      ? shapes
      : `<g transform="translate(${offset} ${offset}) scale(${inset})">\n  ${shapes}\n  </g>`;
  const ground = tile
    ? `<rect width="${SIZE}" height="${SIZE}" rx="${tile.radius}" fill="${tile.fill}"/>\n  `
    : "";
  const a11y = label
    ? ` role="img" aria-label="${label}"`
    : ` aria-hidden="true"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"${a11y}>
  ${ground}${group}
</svg>
`;
}
