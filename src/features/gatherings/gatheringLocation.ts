/**
 * Where a gathering sits on a map, and the link that takes somebody there.
 *
 * PRIVACY. The street address is never pinned and never geocoded. A pin is
 * drawn at a linked directory listing, which is a public place with public
 * coordinates; every other gathering gets a soft blob over its neighbourhood,
 * the same fact the page already prints in words. The address only reaches
 * Google Maps as a directions destination for a viewer who already holds it.
 */
import { neighbourhoodCentroid } from "../economy/housingNeighbourhoods";
import type { GatheringDetail } from "./data";

export interface GatheringMapPoint {
  latitude: number;
  longitude: number;
  precision: "exact" | "area";
}

/** The city every gathering on the platform happens in. `GatheringDetail`
 *  carries no city of its own, so the search link names it here. */
const GATHERING_CITY = "Lisboa";

/**
 * Well-known Lisbon bairros that are not official freguesias, so
 * `neighbourhoodCentroid` (the 24 parishes) does not know them. Each point is
 * the bairro's centre, at the precision an area blob needs: its main square,
 * garden or crossroads. The tail holds the places the demo registry uses as a
 * neighbourhood, so every demo gathering lands somewhere.
 */
const LISBON_BAIRRO_CENTRES: Record<
  string,
  { latitude: number; longitude: number }
> = {
  Graça: { latitude: 38.7167, longitude: -9.131 },
  "Bairro Alto": { latitude: 38.7127, longitude: -9.1449 },
  "Cais do Sodré": { latitude: 38.7066, longitude: -9.1445 },
  "Príncipe Real": { latitude: 38.7163, longitude: -9.1484 },
  Chiado: { latitude: 38.7106, longitude: -9.1422 },
  Intendente: { latitude: 38.7213, longitude: -9.1357 },
  Mouraria: { latitude: 38.7158, longitude: -9.1352 },
  Alfama: { latitude: 38.7114, longitude: -9.13 },
  Anjos: { latitude: 38.7258, longitude: -9.1348 },
  Bica: { latitude: 38.7088, longitude: -9.147 },
  Santos: { latitude: 38.7072, longitude: -9.1557 },
  Lapa: { latitude: 38.7098, longitude: -9.1615 },
  Castelo: { latitude: 38.7134, longitude: -9.133 },
  Baixa: { latitude: 38.711, longitude: -9.1375 },
  "Martim Moniz": { latitude: 38.7166, longitude: -9.1362 },
  Rato: { latitude: 38.7203, longitude: -9.1543 },
  Saldanha: { latitude: 38.7347, longitude: -9.1452 },
  Madragoa: { latitude: 38.7085, longitude: -9.1588 },
  Sé: { latitude: 38.7098, longitude: -9.1335 },
  Rossio: { latitude: 38.7139, longitude: -9.1394 },
  "São Bento": { latitude: 38.7115, longitude: -9.154 },
  "Avenida da Liberdade": { latitude: 38.7197, longitude: -9.1453 },
  "Jardim da Estrela": { latitude: 38.7136, longitude: -9.1598 },
  "Largo do Carmo": { latitude: 38.7121, longitude: -9.1407 },
  "Santa Apolónia": { latitude: 38.714, longitude: -9.1235 },
  "LX Factory": { latitude: 38.7036, longitude: -9.1784 },
  // The demo run club's "Tejo path": the riverside walk at Ribeira das Naus.
  "Tejo path": { latitude: 38.7067, longitude: -9.1395 },
};

// Accent- and case-insensitive key, the same folding housingNeighbourhoods.ts
// applies, so "principe real" finds "Príncipe Real".
function foldName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const BAIRRO_CENTRE_BY_KEY = new Map(
  Object.entries(LISBON_BAIRRO_CENTRES).map(([name, centre]) => [
    foldName(name),
    centre,
  ]),
);

// Values that name no place inside the city: the city itself, and the
// wizard's "Other in Lisbon" catch-all. A search for them finds nothing useful.
const PLACELESS_KEYS = new Set(["lisboa", "lisbon", "other in lisbon"]);

function centreFor(
  name: string,
): { latitude: number; longitude: number } | null {
  if (name === "") return null;
  return (
    neighbourhoodCentroid(name) ??
    BAIRRO_CENTRE_BY_KEY.get(foldName(name)) ??
    null
  );
}

/**
 * The centre of a neighbourhood as a host or the demo registry wrote it. The
 * whole string is tried first, then each comma-separated part from the left,
 * so "LX Factory, Alcântara" and "Piscina Municipal, Anjos" both resolve.
 */
export function neighbourhoodCentre(
  name: string,
): { latitude: number; longitude: number } | null {
  const candidates = [name, ...name.split(",")].map((part) => part.trim());
  for (const candidate of candidates) {
    const centre = centreFor(candidate);
    if (centre) return centre;
  }
  return null;
}

/** The public venue name and neighbourhood, read the way the Where panel
 *  reads them, so the map, the link and the rows all name the same place. */
export function gatheringPlaceParts(gathering: GatheringDetail): {
  venueName: string;
  neighbourhood: string;
} {
  const venueName = (
    gathering.venueListing?.name ??
    gathering.venue ??
    ""
  ).trim();
  const neighbourhood = gathering.neighbourhood?.trim() ?? gathering.hood;
  return { venueName, neighbourhood: neighbourhood.trim() };
}

// The demo registry has no `isOnline`; its online gatherings carry the
// canonical "Online" neighbourhood instead.
function isOnlineGathering(gathering: GatheringDetail): boolean {
  return gathering.isOnline === true || foldName(gathering.hood) === "online";
}

/** Where to draw the gathering: the listing's exact point when the venue is a
 *  linked directory listing with coordinates, otherwise the neighbourhood's
 *  centre as an area. Null for an online gathering or an unknown area. */
export function gatheringMapPoint(
  gathering: GatheringDetail,
): GatheringMapPoint | null {
  if (isOnlineGathering(gathering)) return null;
  const latitude = gathering.venueListing?.latitude;
  const longitude = gathering.venueListing?.longitude;
  if (typeof latitude === "number" && typeof longitude === "number") {
    return { latitude, longitude, precision: "exact" };
  }
  const { neighbourhood } = gatheringPlaceParts(gathering);
  const centre = neighbourhoodCentre(neighbourhood);
  return centre ? { ...centre, precision: "area" } : null;
}

/**
 * The Google Maps link behind "Take me there", first that applies: directions
 * to the linked listing's coordinates, directions to the address the viewer
 * holds, then a search for the public venue and neighbourhood. Null for an
 * online gathering, or when there is nothing to look for.
 */
export function gatheringDirectionsHref(
  gathering: GatheringDetail,
): string | null {
  if (isOnlineGathering(gathering)) return null;
  const latitude = gathering.venueListing?.latitude;
  const longitude = gathering.venueListing?.longitude;
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  const address = gathering.address?.trim() ?? "";
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }
  const { venueName, neighbourhood } = gatheringPlaceParts(gathering);
  // A neighbourhood that only repeats the venue, or names no place,
  // adds nothing to the search.
  const searchParts = [venueName, neighbourhood].filter(
    (part, index, parts) =>
      part !== "" &&
      !PLACELESS_KEYS.has(foldName(part)) &&
      parts.findIndex((other) => foldName(other) === foldName(part)) === index,
  );
  if (searchParts.length === 0) return null;
  const query = [...searchParts, GATHERING_CITY].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
