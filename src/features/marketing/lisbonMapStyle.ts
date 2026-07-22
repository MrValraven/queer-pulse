import type {
  StyleSpecification,
  LayerSpecification,
} from "maplibre-gl";

// OpenFreeMap public vector style — no API key, no signup. Swapping to another
// provider (e.g. MapTiler) later is a single change to this constant.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// SW then NE corner (lng, lat) framing the 5 central parishes.
export const LISBON_BOUNDS: [[number, number], [number, number]] = [
  [-9.19, 38.695],
  [-9.11, 38.735],
];

// Hex mirrors of the design tokens. Required because MapLibre paint runs in a
// WebGL context that cannot read CSS custom properties. Keep in sync with
// src/styles/tokens/colors.css.
export const BRAND = {
  cream: "#f7f3ee", // --cream (page bg)
  plum: "#2d1b3d", // --plum
  accent: "#e8775a", // --accent (coral)
  accentInk: "#c85a40", // --accent-ink
  jade: "#4a8c6f", // --jade
  ink: "#1a1a1f", // --ink
  paper: "#ffffff", // --paper
  water: "#cdd9da", // soft muted blue for the Tejo/water
  green: "#e7ebe0", // muted sage for parks/greenery
  building: "#efe9e1", // faint warm building fill
} as const;

// Label anchor per parish (lng, lat) — real approximate parish centres.
export const FREGUESIA_LABEL_POINTS: Record<string, [number, number]> = {
  "Alcântara": [-9.177, 38.704],
  "Estrela": [-9.16, 38.713],
  "Misericórdia": [-9.146, 38.711],
  "Santa Maria Maior": [-9.133, 38.712],
  "Arroios": [-9.135, 38.726],
};

// OpenFreeMap's glyph server hosts Noto Sans, not the "Open Sans / Metropolis"
// stack the positron style requests (those 404). Every text layer is remapped
// to Noto so labels render from the server with no missing-glyph fallback.
const NOTO_REGULAR = "Noto Sans Regular";
const NOTO_BOLD = "Noto Sans Bold";

// Fetches the positron style and patches it IN PLACE before the map is created:
// warm recolour + Noto fonts. Doing this pre-creation means no recolour flash
// and no glyph 404s. Layer ids/paint vary by provider version, so recolouring
// stays heuristic.
export async function buildWarmStyle(): Promise<StyleSpecification> {
  const response = await fetch(MAP_STYLE_URL);
  if (!response.ok) {
    throw new Error(`Map style request failed: ${response.status}`);
  }
  const style = (await response.json()) as StyleSpecification;
  for (const layer of style.layers ?? []) {
    remapLayerFont(layer);
    recolorLayer(layer);
  }
  return style;
}

function remapLayerFont(layer: LayerSpecification): void {
  if (layer.type !== "symbol" || !layer.layout) return;
  const current = layer.layout["text-font"];
  const wantsBold =
    Array.isArray(current) &&
    current.some((font) => typeof font === "string" && /bold/i.test(font));
  layer.layout["text-font"] = [wantsBold ? NOTO_BOLD : NOTO_REGULAR];
}

function recolorLayer(layer: LayerSpecification): void {
  const id = layer.id.toLowerCase();
  if (layer.type === "background") {
    layer.paint = { ...layer.paint, "background-color": BRAND.cream };
  } else if (layer.type === "fill") {
    if (id.includes("water")) {
      layer.paint = { ...layer.paint, "fill-color": BRAND.water };
    } else if (/park|wood|green|landcover|landuse/.test(id)) {
      layer.paint = { ...layer.paint, "fill-color": BRAND.green };
    } else if (id.includes("building")) {
      layer.paint = {
        ...layer.paint,
        "fill-color": BRAND.building,
        "fill-opacity": 0.5,
      };
    }
  }
}
