import type {
  StyleSpecification,
  LayerSpecification,
  FilterSpecification,
} from "maplibre-gl";

type FillLayer = Extract<LayerSpecification, { type: "fill" }>;
type LineLayer = Extract<LayerSpecification, { type: "line" }>;
type SymbolLayer = Extract<LayerSpecification, { type: "symbol" }>;

// OpenFreeMap public vector style — no API key, no signup. Swapping to another
// provider (e.g. MapTiler) later is a single change to this constant.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// SW then NE corner (lng, lat) framing greater Lisbon: Sintra and Cascais to
// the west, the south-margin cities (Almada, Seixal, Barreiro, Montijo,
// Alcochete) across the Tejo, and Setúbal to the south.
export const GREATER_LISBON_BOUNDS: [[number, number], [number, number]] = [
  [-9.47, 38.47],
  [-8.82, 38.85],
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
  settled: "#f2ebe1", // built-up landuse, a warm step off the cream ground
  building: "#ece3d7", // warm building fill
  // Road scale. positron paints its streets white / light grey for its own
  // near-white ground; on cream those wash out, so the web is repainted on a
  // warm scale with a casing dark enough to give every street an edge.
  road: "#ffffff", // major road fill; a bright ribbon on the cream ground
  roadCasing: "#d3c6b6", // warm taupe road edge
  roadMinor: "#e6dccf", // minor streets, one warm step down from cream
  rail: "#cdc0b0", // railway lines
  // Label scale, warmed off positron's neutral #333/#666/#000.
  labelInk: "#4a4038", // base place labels
  labelSoft: "#7c6f63", // road names, POIs, anything secondary
  waterInk: "#5c7c83", // water names
} as const;

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
    patchLayerFilter(layer);
    hideOverlaidPlaceLabels(layer);
  }
  return style;
}

// Neighbourhood-scale OSM `place` classes that the freguesia overlay
// (useLisbonMap) already labels with our own branded symbols. positron draws
// these same features from its `label_other` layer (e.g. a grey uppercase
// "CAMPOLIDE" beneath our bold "Campolide"), so the two stack — often as a
// visible duplicate. Suppressing them at the base leaves the overlay as the
// single source of truth. City-and-up labels ("Lisbon") and every road / water
// / POI label are untouched.
const OVERLAID_PLACE_CLASSES = [
  "borough",
  "suburb",
  "neighbourhood",
  "quarter",
] as const;

// Excludes the overlaid classes from any base symbol layer reading the `place`
// source-layer. positron's place filters are all expression-based, so wrapping
// the existing filter in an `all` is safe (no legacy/expression mixing).
function hideOverlaidPlaceLabels(layer: LayerSpecification): void {
  if (layer.type !== "symbol") return;
  const sourceLayer = (layer as { "source-layer"?: string })["source-layer"];
  if (sourceLayer !== "place") return;
  const excludeOverlaid: FilterSpecification = [
    "!",
    ["in", ["get", "class"], ["literal", [...OVERLAID_PLACE_CLASSES]]],
  ];
  layer.filter =
    "filter" in layer && layer.filter !== undefined
      ? (["all", layer.filter, excludeOverlaid] as FilterSpecification)
      : excludeOverlaid;
}

// Comparison operators positron uses in layer filters. When one operand is a
// value-typed `["get", …]` and the other a number literal, MapLibre wraps the
// `get` in an implicit `["number", …]` assertion (see the expression compiler:
// `"value"===s.type.kind && "value"!==o.type.kind ? new Assertion(o.type,[s])`).
// That assertion THROWS "Expected value to be of type number, but found null
// instead." for every feature missing the property — a benign but noisy console
// warning. positron hits it on nullable OSM props: admin_level / maritime /
// disputed on boundaries, rank on country labels, ref_length on road shields.
const COMPARISON_OPERATORS = new Set(["==", "!=", "<", "<=", ">", ">="]);

type FilterNode = unknown;

// The property name of a bare `["get", "name"]` operand, else null (legacy
// string-key filters and computed operands are left untouched).
function comparedPropertyName(operand: FilterNode): string | null {
  return Array.isArray(operand) &&
    operand[0] === "get" &&
    operand.length === 2 &&
    typeof operand[1] === "string"
    ? operand[1]
    : null;
}

// Guard a numeric comparison with `has` so it is never evaluated on a missing
// property (null in a vector tile ⇒ the key is absent). `all`/`any` short-
// circuit at the leading `has`, so the throwing assertion is never reached.
// Semantics are preserved: a missing property is neither equal to nor ordered
// against a number, so "!=" stays true and every other comparison stays false.
function guardNumericComparison(comparison: unknown[]): FilterNode {
  const [operator, left, right] = comparison;
  const propertyName =
    comparedPropertyName(left) ?? comparedPropertyName(right);
  const comparesToNumber =
    typeof left === "number" || typeof right === "number";
  if (!propertyName || !comparesToNumber) return comparison;
  return operator === "!="
    ? ["any", ["!", ["has", propertyName]], comparison]
    : ["all", ["has", propertyName], comparison];
}

function makeFilterNullSafe(node: FilterNode): FilterNode {
  if (!Array.isArray(node)) return node;
  const operator = (node as unknown[])[0];
  if (typeof operator === "string" && COMPARISON_OPERATORS.has(operator)) {
    return guardNumericComparison(node);
  }
  return node.map(makeFilterNullSafe);
}

function patchLayerFilter(layer: LayerSpecification): void {
  if (!("filter" in layer) || layer.filter === undefined) return;
  layer.filter = makeFilterNullSafe(layer.filter) as FilterSpecification;
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
    recolorFill(layer, id);
  } else if (layer.type === "line") {
    recolorLine(layer, id);
  } else if (layer.type === "symbol") {
    recolorSymbol(layer, id);
  }
}

function recolorFill(layer: FillLayer, id: string): void {
  if (id.includes("water")) {
    layer.paint = { ...layer.paint, "fill-color": BRAND.water };
  } else if (/park|wood|grass|green|landcover/.test(id)) {
    layer.paint = { ...layer.paint, "fill-color": BRAND.green };
  } else if (id.includes("landuse")) {
    // Built-up land, NOT greenery. positron paints `landuse_residential` a
    // neutral grey; the old catch-all regex swept it in with the parks, which
    // laid a sage film over the whole built-up city and flattened everything
    // drawn on top of it.
    layer.paint = { ...layer.paint, "fill-color": BRAND.settled };
  } else if (id.includes("pier")) {
    // positron's own background colour, so on cream it shows as a cold patch.
    layer.paint = { ...layer.paint, "fill-color": BRAND.cream };
  } else if (id.includes("aeroway")) {
    layer.paint = { ...layer.paint, "fill-color": BRAND.road };
  } else if (id.includes("building")) {
    // Was 0.5 over a near-identical warm grey, which left blocks invisible and
    // took the basemap's structure with them. Buildings are the thing that
    // makes a light basemap read as sharp at street zoom, so they get to show.
    layer.paint = {
      ...layer.paint,
      "fill-color": BRAND.building,
      "fill-opacity": 0.9,
    };
  }
}

// Order matters: "casing" and "dashline" are checked before the road/rail
// families they belong to, because ids like `highway_major_casing` and
// `railway_transit_dashline` match both.
function recolorLine(layer: LineLayer, id: string): void {
  const color = lineColor(id);
  if (color) layer.paint = { ...layer.paint, "line-color": color };
}

function lineColor(id: string): string | null {
  if (/water/.test(id)) return BRAND.water;
  // The light dashes drawn ON TOP of a rail line read as the gap between
  // sleepers, so they take the ground colour, not a rail colour.
  if (/dashline|pier/.test(id)) return BRAND.cream;
  if (/casing/.test(id)) return BRAND.roadCasing;
  if (/railway/.test(id)) return BRAND.rail;
  // "subtle" layers are the low-zoom stand-ins for the same roads.
  if (/minor|path|subtle|taxiway/.test(id)) return BRAND.roadMinor;
  if (/highway|motorway|runway/.test(id)) return BRAND.road;
  if (/boundary/.test(id)) return BRAND.roadCasing;
  return null;
}

// positron haloes every label with a BLURRED white ring (`text-halo-blur` 1 on
// place labels, 0.5 on road names). That is invisible against its own near-
// white ground, but over cream it becomes a soft white fog around each word,
// the single biggest reason the recoloured basemap reads as out of focus. The
// halo becomes an unblurred cream cut-out and the ink warms to match.
function recolorSymbol(layer: SymbolLayer, id: string): void {
  if (!layer.paint) return;
  const paint = { ...layer.paint };
  if (
    paint["text-halo-width"] !== undefined ||
    paint["text-halo-color"] !== undefined
  ) {
    paint["text-halo-color"] = BRAND.cream;
    paint["text-halo-blur"] = 0;
  }
  if (paint["text-color"] !== undefined) {
    paint["text-color"] = textColor(id);
  }
  layer.paint = paint;
}

function textColor(id: string): string {
  if (/water/.test(id)) return BRAND.waterInk;
  // City and up: the few labels that should anchor the whole view.
  if (/^label_(city|country|state|town)/.test(id)) return BRAND.plum;
  if (/highway|shield|airport|path/.test(id)) return BRAND.labelSoft;
  return BRAND.labelInk;
}
