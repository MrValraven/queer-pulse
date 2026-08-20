/**
 * Coarse User-Agent parsing shared by every "list of my devices" surface
 * (`SessionsPage.tsx`'s active sessions, `PushDevicesPage.tsx`'s push
 * subscriptions). Enough to pick a friendly "platform · browser" label and
 * the phone-vs-desktop glyph — nothing more, and never a hard guarantee
 * (User-Agent strings are self-reported and increasingly frozen/reduced by
 * browsers, so a wrong or missing match is expected, not a bug).
 */

export type DeviceKind = "desktop" | "mobile";

/** Coarse UA sniff — enough to pick the phone vs. desktop glyph, nothing more. */
const MOBILE_RE = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i;

/** Ordered longest-match-first so "Edg" doesn't lose to "Chrome", etc. */
const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const PLATFORMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

function matchFirst(
  userAgent: string,
  table: ReadonlyArray<readonly [RegExp, string]>,
): string | undefined {
  for (const [pattern, label] of table) {
    if (pattern.test(userAgent)) return label;
  }
  return undefined;
}

export function deviceKindFromUserAgent(userAgent: string): DeviceKind {
  return MOBILE_RE.test(userAgent) ? "mobile" : "desktop";
}

/**
 * A human label for a device, from a raw UA string plus an optional
 * server-provided label that always wins when present. Falls back through
 * platform-only → browser-only → "Unknown device" rather than guessing.
 */
export function deviceLabelFromUserAgent(
  userAgent: string,
  deviceLabel?: string | null,
): string {
  if (deviceLabel) return deviceLabel;
  const platform = matchFirst(userAgent, PLATFORMS);
  const browser = matchFirst(userAgent, BROWSERS);
  if (platform && browser) return `${platform} · ${browser}`;
  return platform ?? browser ?? "Unknown device";
}
