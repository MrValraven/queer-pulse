// scratchpad/fetch-freguesias-greater-lisbon.mjs
// Extends src/shared/components/map/freguesias.data.ts with the freguesias of
// Oeiras, Cascais and the south bank of the Tejo (Almada, Seixal, Barreiro,
// Moita, Montijo, Alcochete). Lisbon's 24 parishes are read back from the
// existing data file and kept byte for byte; the new ones are appended.
//
// Source: OpenStreetMap admin_level=8 relations enumerated from Overpass for
// each admin_level=7 concelho, geometry from Nominatim exactly like
// fetch-freguesias.mjs (same simplification, precision and label anchors).
// A name carried by more than one parish (or already used by Lisbon) becomes
// "Name (Concelho)" so every name stays unique: names are keys everywhere.
//
// Run:  node scratchpad/fetch-freguesias-greater-lisbon.mjs  (from queerpulse/)
// Env:  FREGUESIA_CACHE_DIR keeps raw Nominatim answers so a rerun resumes.
// Requires Node 18+ (global fetch). No npm dependencies.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const USER_AGENT = "queerpulse-map-dev/1.0 (akatiago@gmail.com)";
const OUTPUT = new URL(
  "../src/shared/components/map/freguesias.data.ts",
  import.meta.url,
);
const CACHE_DIR =
  process.env.FREGUESIA_CACHE_DIR ?? path.join(tmpdir(), "freguesia-cache");
const SIMPLIFY_TOLERANCE = 0.0001; // degrees, ~11m
const COORD_DECIMALS = 5;
const GRID_STEPS = 48; // resolution of the label-anchor search grid
const LISBON_PARISH_COUNT = 24;
const CONCELHOS = [
  "Oeiras",
  "Cascais",
  "Almada",
  "Seixal",
  "Barreiro",
  "Moita",
  "Montijo",
  "Alcochete",
  "Setúbal",
];

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

// --- Enumerate ---------------------------------------------------------------
async function enumerateParishes() {
  const query = `[out:json][timeout:90];
(
  rel["boundary"="administrative"]["admin_level"="7"]["name"~"^(${CONCELHOS.join("|")})$"];
)->.concelhos;
foreach.concelhos->.concelho{
  .concelho out tags;
  .concelho map_to_area->.concelhoArea;
  rel(area.concelhoArea)["boundary"="administrative"]["admin_level"="8"];
  out tags;
}`;
  let response = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ data: query }),
    });
    if (response.ok) break;
    await sleep(5000 * attempt); // Overpass answers 502/504 when busy
  }
  if (!response?.ok) throw new Error(`Overpass -> HTTP ${response?.status}`);
  const { elements } = await response.json();
  if (elements.length < 20)
    throw new Error("Overpass returned too few elements");
  const parishes = [];
  let currentConcelho = null;
  for (const element of elements) {
    if (element.tags.admin_level === "7") {
      currentConcelho = element.tags.name;
    } else {
      parishes.push({
        concelho: currentConcelho,
        name: element.tags.name,
        relationId: element.id,
      });
    }
  }
  return parishes;
}

// Lisbon keeps its names; any other parish whose name is shared gets a suffix.
function disambiguate(parishes, lisbonNames) {
  const counts = new Map();
  for (const name of lisbonNames) counts.set(name, 1);
  for (const parish of parishes) {
    counts.set(parish.name, (counts.get(parish.name) ?? 0) + 1);
  }
  return parishes.map((parish) => ({
    ...parish,
    uniqueName:
      counts.get(parish.name) > 1
        ? `${parish.name} (${parish.concelho})`
        : parish.name,
  }));
}

async function fetchPolygonsCached(relationId) {
  const cachePath = path.join(CACHE_DIR, `R${relationId}.json`);
  try {
    return {
      polygons: JSON.parse(await readFile(cachePath, "utf8")),
      isFresh: false,
    };
  } catch {
    // not cached yet
  }
  const polygons = await fetchPolygons(relationId);
  await writeFile(cachePath, JSON.stringify(polygons));
  return { polygons, isFresh: true };
}

// --- Fetch -------------------------------------------------------------------
// Returns Polygon[] where each Polygon is Ring[] and each Ring is [lng,lat][].
async function fetchPolygons(relationId) {
  const url =
    `https://nominatim.openstreetmap.org/lookup?osm_ids=R${relationId}` +
    `&format=json&polygon_geojson=1`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Nominatim R${relationId} -> HTTP ${response.status}`);
  }
  const results = await response.json();
  const geometry = results[0]?.geojson;
  if (!geometry) throw new Error(`No geometry for relation ${relationId}`);
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  throw new Error(`Unexpected geometry ${geometry.type} for R${relationId}`);
}

// --- Geometry helpers --------------------------------------------------------
function roundCoord([longitude, latitude]) {
  const factor = 10 ** COORD_DECIMALS;
  return [
    Math.round(longitude * factor) / factor,
    Math.round(latitude * factor) / factor,
  ];
}

// Distance from a point to the INFINITE line through two points (Douglas–Peucker).
function perpendicularDistance(point, lineStart, lineEnd) {
  const [pointX, pointY] = point;
  const [startX, startY] = lineStart;
  const [endX, endY] = lineEnd;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  if (deltaX === 0 && deltaY === 0) {
    return Math.hypot(pointX - startX, pointY - startY);
  }
  const parameter =
    ((pointX - startX) * deltaX + (pointY - startY) * deltaY) /
    (deltaX * deltaX + deltaY * deltaY);
  const projectionX = startX + parameter * deltaX;
  const projectionY = startY + parameter * deltaY;
  return Math.hypot(pointX - projectionX, pointY - projectionY);
}

// Distance from a point to a finite SEGMENT (label-anchor scoring).
function distanceToSegment(point, segmentStart, segmentEnd) {
  const [pointX, pointY] = point;
  const [startX, startY] = segmentStart;
  const [endX, endY] = segmentEnd;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  if (deltaX === 0 && deltaY === 0) {
    return Math.hypot(pointX - startX, pointY - startY);
  }
  let parameter =
    ((pointX - startX) * deltaX + (pointY - startY) * deltaY) /
    (deltaX * deltaX + deltaY * deltaY);
  parameter = Math.max(0, Math.min(1, parameter));
  return Math.hypot(
    pointX - (startX + parameter * deltaX),
    pointY - (startY + parameter * deltaY),
  );
}

function simplifyRing(ring, tolerance) {
  if (ring.length <= 3) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  let maxDistance = 0;
  let farthestIndex = 0;
  for (let index = 1; index < ring.length - 1; index++) {
    const distance = perpendicularDistance(ring[index], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      farthestIndex = index;
    }
  }
  if (maxDistance <= tolerance) return [first, last];
  const left = simplifyRing(ring.slice(0, farthestIndex + 1), tolerance);
  const right = simplifyRing(ring.slice(farthestIndex), tolerance);
  return [...left.slice(0, -1), ...right];
}

// Drop points that collapsed onto their neighbour after rounding; keep closure.
function dedupeClosed(ring) {
  const output = [];
  for (const point of ring) {
    const previous = output[output.length - 1];
    if (!previous || previous[0] !== point[0] || previous[1] !== point[1]) {
      output.push(point);
    }
  }
  const first = output[0];
  const last = output[output.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    output.push([first[0], first[1]]);
  }
  return output;
}

function processPolygons(polygons) {
  return polygons.map((rings) =>
    rings.map((ring) =>
      dedupeClosed(simplifyRing(ring, SIMPLIFY_TOLERANCE).map(roundCoord)),
    ),
  );
}

function ringArea(ring) {
  let area = 0;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    area +=
      (ring[previous][0] + ring[index][0]) *
      (ring[previous][1] - ring[index][1]);
  }
  return Math.abs(area / 2);
}

function ringCentroid(ring) {
  let centroidX = 0;
  let centroidY = 0;
  let signedArea = 0;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const cross =
      ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
    centroidX += (ring[previous][0] + ring[index][0]) * cross;
    centroidY += (ring[previous][1] + ring[index][1]) * cross;
    signedArea += cross;
  }
  signedArea /= 2;
  if (signedArea === 0) return ring[0];
  return [centroidX / (6 * signedArea), centroidY / (6 * signedArea)];
}

// The polygon (outer + holes) with the largest outer-ring area.
function largestPolygon(polygons) {
  let best = polygons[0];
  let bestArea = ringArea(polygons[0][0]);
  for (const polygon of polygons) {
    const area = ringArea(polygon[0]);
    if (area > bestArea) {
      bestArea = area;
      best = polygon;
    }
  }
  return best;
}

function pointInRing(point, ring) {
  const [pointX, pointY] = point;
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [currentX, currentY] = ring[index];
    const [previousX, previousY] = ring[previous];
    const crossesRay =
      currentY > pointY !== previousY > pointY &&
      pointX <
        ((previousX - currentX) * (pointY - currentY)) /
          (previousY - currentY) +
          currentX;
    if (crossesRay) inside = !inside;
  }
  return inside;
}

// Inside the outer ring and outside every hole.
function pointInPolygon(point, rings) {
  if (!pointInRing(point, rings[0])) return false;
  for (let index = 1; index < rings.length; index++) {
    if (pointInRing(point, rings[index])) return false;
  }
  return true;
}

function distanceToEdges(point, rings) {
  let minimum = Infinity;
  for (const ring of rings) {
    for (let index = 1; index < ring.length; index++) {
      const distance = distanceToSegment(point, ring[index - 1], ring[index]);
      if (distance < minimum) minimum = distance;
    }
  }
  return minimum;
}

// Grid-based pole of inaccessibility over the largest polygon: the interior grid
// point farthest from any edge.
function labelPoint(polygons) {
  const rings = largestPolygon(polygons);
  const outer = rings[0];
  let minLongitude = Infinity;
  let minLatitude = Infinity;
  let maxLongitude = -Infinity;
  let maxLatitude = -Infinity;
  for (const [longitude, latitude] of outer) {
    if (longitude < minLongitude) minLongitude = longitude;
    if (latitude < minLatitude) minLatitude = latitude;
    if (longitude > maxLongitude) maxLongitude = longitude;
    if (latitude > maxLatitude) maxLatitude = latitude;
  }
  let best = null;
  let bestDistance = -Infinity;
  for (let column = 0; column <= GRID_STEPS; column++) {
    for (let row = 0; row <= GRID_STEPS; row++) {
      const candidate = [
        minLongitude + ((maxLongitude - minLongitude) * column) / GRID_STEPS,
        minLatitude + ((maxLatitude - minLatitude) * row) / GRID_STEPS,
      ];
      if (!pointInPolygon(candidate, rings)) continue;
      const distance = distanceToEdges(candidate, rings);
      if (distance > bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
  }
  if (!best) best = ringCentroid(outer); // degenerate fallback
  return roundCoord(best);
}

function toGeometry(polygons) {
  return polygons.length === 1
    ? { type: "Polygon", coordinates: polygons[0] }
    : { type: "MultiPolygon", coordinates: polygons };
}

// Under about 5000 m2: boundary specks (traffic islands, exclave scraps) that
// collapse to a point after simplification. The largest part is always kept.
const MINIMUM_PART_AREA = 5e-7; // square degrees

function dropSlivers(polygons) {
  const largest = largestPolygon(polygons);
  return polygons.filter(
    (polygon) =>
      polygon === largest || ringArea(polygon[0]) >= MINIMUM_PART_AREA,
  );
}

// --- Main --------------------------------------------------------------------
async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const existingSource = await readFile(OUTPUT, "utf8");
  // The data file is prettier-formatted TypeScript, so the object literal is
  // evaluated rather than parsed as JSON (it is this project's own file).
  const literalStart = existingSource.indexOf("> = {") + 4;
  const existing = (0, eval)(
    `(${existingSource.slice(literalStart, existingSource.lastIndexOf(";"))})`,
  );
  const lisbonFeatures = existing.features.slice(0, LISBON_PARISH_COUNT);
  if (lisbonFeatures.length !== LISBON_PARISH_COUNT) {
    throw new Error("The data file lost Lisbon's 24 parishes");
  }

  const parishes = disambiguate(
    await enumerateParishes(),
    lisbonFeatures.map((feature) => feature.properties.name),
  );
  console.log(`Enumerated ${parishes.length} parishes`);

  const newFeatures = [];
  for (const parish of parishes) {
    process.stdout.write(`Fetching ${parish.uniqueName}... `);
    const { polygons: rawPolygons, isFresh } = await fetchPolygonsCached(
      parish.relationId,
    );
    const polygons = dropSlivers(processPolygons(rawPolygons));
    const anchor = labelPoint(polygons);
    if (!pointInPolygon(anchor, largestPolygon(polygons))) {
      throw new Error(
        `Label anchor fell outside polygon for ${parish.uniqueName}`,
      );
    }
    newFeatures.push({
      type: "Feature",
      properties: { name: parish.uniqueName, labelPoint: anchor },
      geometry: toGeometry(polygons),
    });
    console.log(`ok [${parish.concelho}] (${polygons.length} part(s))`);
    if (isFresh) await sleep(1100); // Nominatim usage policy: <= 1 request/second
  }

  const collection = {
    type: "FeatureCollection",
    features: [...lisbonFeatures, ...newFeatures],
  };
  const fileContents =
    "// Generated by scratchpad/fetch-freguesias.mjs (Lisbon) and\n" +
    "// scratchpad/fetch-freguesias-greater-lisbon.mjs (Oeiras, Cascais and the\n" +
    "// south bank) from OpenStreetMap admin_level=8 freguesia boundaries (ODbL).\n" +
    "// Geometry fetched pre-assembled from Nominatim, simplified (~11m) and\n" +
    "// rounded to 5 decimals; `labelPoint` is a grid-based pole of\n" +
    "// inaccessibility. Lisbon's 24 parishes come first.\n" +
    'import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";\n\n' +
    "export const FREGUESIAS: FeatureCollection<\n" +
    "  Polygon | MultiPolygon,\n" +
    "  { name: string; labelPoint: [number, number] }\n" +
    `> = ${JSON.stringify(collection)};\n`;
  await writeFile(OUTPUT, fileContents);
  // Prettier is enforced through eslint: run `npx eslint --fix` on the output.
  console.log(
    `\nWrote ${collection.features.length} parishes to ${OUTPUT.pathname}`,
  );
  console.log(
    JSON.stringify(
      parishes.map((parish) => [parish.concelho, parish.uniqueName]),
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
