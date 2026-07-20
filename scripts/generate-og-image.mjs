/**
 * One-off Open Graph image generation from public/og-default.svg.
 *
 * Social scrapers (Slack, WhatsApp, iMessage, Signal, X) and Google all refuse
 * to render SVG in link unfurls, so the shared social image must be a raster
 * PNG. Output is committed to public/ rather than generated at build time, for
 * the same reason as the PWA icons: the artwork changes roughly never and a
 * build-time dependency on sharp's platform binaries is a poor trade.
 *
 * Re-run with `pnpm og` if og-default.svg changes.
 *
 * NOTE: og-default.svg uses system font families (Georgia, Helvetica Neue).
 * sharp rasterises via librsvg, which substitutes whatever the host has — so
 * the PNG will not be pixel-identical to a browser rendering of the SVG. That
 * is acceptable for a social card; verify the output looks right before
 * committing.
 */
import sharp from "sharp";

const SOURCE = "public/og-default.svg";
const OUTPUT_PATH = "public/og-default.png";
const OPEN_GRAPH_WIDTH = 1200;
const OPEN_GRAPH_HEIGHT = 630;

// High density so the SVG rasterises crisply at the target size.
await sharp(SOURCE, { density: 192 })
  .resize(OPEN_GRAPH_WIDTH, OPEN_GRAPH_HEIGHT, { fit: "contain" })
  .png()
  .toFile(OUTPUT_PATH);

console.log(
  `Wrote ${OPEN_GRAPH_WIDTH}x${OPEN_GRAPH_HEIGHT} Open Graph image to ${OUTPUT_PATH}`,
);
