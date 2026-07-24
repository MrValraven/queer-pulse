// scratchpad/fetch-freguesias.mjs
// Regenerates src/features/marketing/freguesias.data.ts with all 24 civil
// parishes (freguesias) of the Lisbon municipality.
//
// Source: OpenStreetMap admin_level=8 boundary relations (ODbL). Geometry is
// fetched pre-assembled from Nominatim (polygon_geojson=1), simplified, and
// rounded. A label anchor (grid-based pole of inaccessibility) is computed per
// parish so labels sit inside irregular shapes rather than on a centroid that
// can land in the Tejo.
//
// Run:  node scratchpad/fetch-freguesias.mjs   (from the queerpulse/ dir)
// Requires Node 18+ (global fetch). No npm dependencies.

import { writeFile } from "node:fs/promises";

const USER_AGENT = "queerpulse-map-dev/1.0 (akatiago@gmail.com)";
const OUTPUT = new URL(
  "../src/features/marketing/freguesias.data.ts",
  import.meta.url,
);
const SIMPLIFY_TOLERANCE = 0.0001; // degrees, ~11m
const COORD_DECIMALS = 5;
const GRID_STEPS = 48; // resolution of the label-anchor search grid

// The 24 Lisbon-concelho freguesias and their OSM relation ids, enumerated from
// Overpass (admin_level=8 relations inside the admin_level=7 "Lisboa" concelho).
const PARISHES = [
  { name: "Ajuda", relationId: 6427486 },
  { name: "Alcântara", relationId: 6427487 },
  { name: "Alvalade", relationId: 6384162 },
  { name: "Areeiro", relationId: 6384163 },
  { name: "Arroios", relationId: 6384187 },
  { name: "Avenidas Novas", relationId: 6384159 },
  { name: "Beato", relationId: 6427488 },
  { name: "Belém", relationId: 6427489 },
  { name: "Benfica", relationId: 6385130 },
  { name: "Campo de Ourique", relationId: 6427490 },
  { name: "Campolide", relationId: 6384172 },
  { name: "Carnide", relationId: 6384154 },
  { name: "Estrela", relationId: 6427491 },
  { name: "Lumiar", relationId: 6384124 },
  { name: "Marvila", relationId: 6427492 },
  { name: "Misericórdia", relationId: 6427493 },
  { name: "Olivais", relationId: 6384135 },
  { name: "Parque das Nações", relationId: 6427494 },
  { name: "Penha de França", relationId: 6427495 },
  { name: "Santa Clara", relationId: 6384111 },
  { name: "Santa Maria Maior", relationId: 6427496 },
  { name: "Santo António", relationId: 6427497 },
  { name: "São Domingos de Benfica", relationId: 6384173 },
  { name: "São Vicente", relationId: 6427498 },
];

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    area += (ring[previous][0] + ring[index][0]) * (ring[previous][1] - ring[index][1]);
  }
  return Math.abs(area / 2);
}

function ringCentroid(ring) {
  let centroidX = 0;
  let centroidY = 0;
  let signedArea = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const cross = ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
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
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [currentX, currentY] = ring[index];
    const [previousX, previousY] = ring[previous];
    const crossesRay =
      currentY > pointY !== previousY > pointY &&
      pointX <
        ((previousX - currentX) * (pointY - currentY)) / (previousY - currentY) +
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

// --- Main --------------------------------------------------------------------
async function main() {
  const features = [];
  for (const parish of PARISHES) {
    process.stdout.write(`Fetching ${parish.name}... `);
    const rawPolygons = await fetchPolygons(parish.relationId);
    const polygons = processPolygons(rawPolygons);
    const anchor = labelPoint(polygons);
    if (!pointInPolygon(anchor, largestPolygon(polygons))) {
      throw new Error(`Label anchor fell outside polygon for ${parish.name}`);
    }
    features.push({
      type: "Feature",
      properties: { name: parish.name, labelPoint: anchor },
      geometry: toGeometry(polygons),
    });
    console.log(`ok (${polygons.length} part(s), anchor ${anchor.join(",")})`);
    await sleep(1100); // Nominatim usage policy: <= 1 request/second
  }
  if (features.length !== 24) {
    throw new Error(`Expected 24 parishes, generated ${features.length}`);
  }
  const collection = { type: "FeatureCollection", features };
  const fileContents =
    "// Generated by scratchpad/fetch-freguesias.mjs from OpenStreetMap\n" +
    "// admin_level=8 freguesia boundaries (ODbL). Geometry fetched pre-assembled\n" +
    "// from Nominatim, simplified (~11m) and rounded to 5 decimals; `labelPoint`\n" +
    "// is a grid-based pole of inaccessibility. Regenerate with the same script.\n" +
    'import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";\n\n' +
    "export const FREGUESIAS: FeatureCollection<\n" +
    "  Polygon | MultiPolygon,\n" +
    "  { name: string; labelPoint: [number, number] }\n" +
    `> = ${JSON.stringify(collection)};\n`;
  await writeFile(OUTPUT, fileContents);
  console.log(`\nWrote ${features.length} parishes to ${OUTPUT.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
