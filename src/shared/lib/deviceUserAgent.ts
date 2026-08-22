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
 * The parts a device label is built from. Both are product names (Chrome,
 * macOS) and are never translated; the SEPARATOR and the unknown-device
 * fallback are the only pieces that need a language, which is why they belong
 * to the caller and not to this module.
 *
 * `label` is the server-provided override, which always wins when present.
 */
export interface DeviceLabelParts {
  label?: string;
  platform?: string;
  browser?: string;
}

/** The structured form of {@link deviceLabelFromUserAgent}. */
export function deviceLabelPartsFromUserAgent(
  userAgent: string,
  deviceLabel?: string | null,
): DeviceLabelParts {
  if (deviceLabel) return { label: deviceLabel };
  return {
    platform: matchFirst(userAgent, PLATFORMS),
    browser: matchFirst(userAgent, BROWSERS),
  };
}

/**
 * Copy the caller owns, so a Portuguese member does not read an English device
 * name on their sessions list. Defaults keep every existing call site working
 * byte-for-byte; pass `t(…)` values to translate.
 *
 * The separator is a middot with hair spaces rather than a plain "·" typed into
 * the markup: it is punctuation between two names, not an icon affordance.
 */
export interface DeviceLabelCopy {
  separator?: string;
  unknown?: string;
}

const DEFAULT_COPY: Required<DeviceLabelCopy> = {
  separator: " \u00b7 ",
  unknown: "Unknown device",
};

/**
 * A human label for a device, from a raw UA string plus an optional
 * server-provided label that always wins when present. Falls back through
 * platform-only → browser-only → the unknown-device copy rather than guessing.
 */
export function deviceLabelFromUserAgent(
  userAgent: string,
  deviceLabel?: string | null,
  copy: DeviceLabelCopy = {},
): string {
  const { separator, unknown } = { ...DEFAULT_COPY, ...copy };
  const parts = deviceLabelPartsFromUserAgent(userAgent, deviceLabel);
  if (parts.label) return parts.label;
  if (parts.platform && parts.browser) {
    return `${parts.platform}${separator}${parts.browser}`;
  }
  return parts.platform ?? parts.browser ?? unknown;
}
