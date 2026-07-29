// NOTE: keep these patterns in sync with the backend copy at
// queerpulse-backend/src/geocode/google-maps-link.ts

const SHORT_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl']);

function parseHost(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isShortMapsLink(rawUrl: string): boolean {
  const host = parseHost(rawUrl);
  return host !== null && SHORT_HOSTS.has(host);
}

function inRange(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function extractPlaceName(rawUrl: string): string | undefined {
  const match = rawUrl.match(/\/maps\/place\/([^/@]+)/);
  const placeSegment = match?.[1];
  if (placeSegment === undefined) return undefined;
  try {
    return decodeURIComponent(placeSegment.replace(/\+/g, " ")).trim() || undefined;
  } catch {
    return undefined;
  }
}

export function parseGoogleMapsUrl(
  rawUrl: string,
): { latitude: number; longitude: number; placeName?: string } | null {
  if (typeof rawUrl !== 'string' || parseHost(rawUrl) === null) return null;

  const pin = rawUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const query = rawUrl.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const at = rawUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

  const source = pin ?? query ?? at;
  if (!source) return null;

  const latitude = Number(source[1]);
  const longitude = Number(source[2]);
  if (!inRange(latitude, longitude)) return null;

  const placeName = extractPlaceName(rawUrl);
  return placeName ? { latitude, longitude, placeName } : { latitude, longitude };
}
