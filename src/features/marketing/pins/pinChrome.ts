import { resolveAvatarSrc } from "../../../shared/lib/avatarUrl";
import { LOCAL_CATEGORIES } from "../localCategories";
import { HOUSING_PIN_TYPE } from "../map.data";
import { CHECK_ICON_SVG, ICON_SVG, escapeHtml } from "./pinIcons";
import {
  clusterSizeOf,
  type PinRenderer,
  type VenueMarkerData,
} from "./pinRenderer";
import s from "./pinChrome.module.css";

// The chrome the local directory's Portrait pin (portraitPin.ts) is built on:
// the ground a pin stands on, the ripple a selection sends out, the callout
// card that names a selected place, the verified badge, and the
// category-ring cluster. Each helper returns an HTML string (markers are plain
// DOM, see venueMarker.ts) whose classes come from pinChrome.module.css, so
// the pin gets them by concatenating markup into its own body. The housing
// map's teardrop (teardropPin.ts) keeps its own styling in
// venueMarker.module.css and uses none of this.
//
// The state contract these rely on is set by the manager on every button:
// `data-selected="true"` and `data-hovered="true"` while they apply, and
// nothing otherwise. A cluster carries `data-selected="true"` while it holds
// the selected place. A pin painted here also carries
// `data-category="<type>"` and the inline `--pin-color` every piece reads.

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve every name once to a plain string.
export const PIN_CHROME_CLASS = {
  /** Base for a pin button: resets, focus ring, bottom-centre origin. */
  pin: s.pin ?? "",
  /** The zero-size point at the coordinate that ground + ripple hang off. */
  ground: s.ground ?? "",
  /** Modifier: the ground sits at the button's centre (a centred anchor). */
  groundCentered: s.groundCentered ?? "",
  groundShadow: s.groundShadow ?? "",
  groundDot: s.groundDot ?? "",
  ripple: s.ripple ?? "",
  callout: s.callout ?? "",
  calloutThumb: s.calloutThumb ?? "",
  calloutThumbIcon: s.calloutThumbIcon ?? "",
  calloutText: s.calloutText ?? "",
  calloutNameRow: s.calloutNameRow ?? "",
  calloutName: s.calloutName ?? "",
  calloutMeta: s.calloutMeta ?? "",
  calloutDot: s.calloutDot ?? "",
  calloutMetaText: s.calloutMetaText ?? "",
  calloutTail: s.calloutTail ?? "",
  verifiedBadge: s.verifiedBadge ?? "",
  cluster: s.cluster ?? "",
  clusterRing: s.clusterRing ?? "",
  clusterCount: s.clusterCount ?? "",
  /** The one-shot drop-in; hand it to the manager as `classes.pinEnter`. */
  enter: s.enter ?? "",
};

// Only these ever reach a `var(--cat-…)` name. Anything else is data the
// directory does not know, and it gets plum, a colour that always resolves.
const KNOWN_CATEGORIES: ReadonlySet<string> = new Set(LOCAL_CATEGORIES);

/** The colour a pin of this type is painted in, as a CSS value. */
export function pinColorValue(type: string): string {
  // --accent-deep is a fixed brand coral that carries the cream icon at 5.38:1,
  // the same fill the teardrop style gives housing pins.
  if (type === HOUSING_PIN_TYPE) return "var(--accent-deep)";
  if (KNOWN_CATEGORIES.has(type)) return `var(--cat-${type})`;
  return "var(--plum)";
}

/** Point `--pin-color` at the type's fill, writing only when it changed. */
export function applyPinColor(element: HTMLElement, type: string): void {
  const nextColor = pinColorValue(type);
  if (element.style.getPropertyValue("--pin-color") !== nextColor) {
    element.style.setProperty("--pin-color", nextColor);
  }
}

/**
 * Ask an image host for a small render of a photo, so a 40px thumbnail never
 * downloads the 1200px hero. Unsplash takes its width in `w` (and quality in
 * `q`); a height, when present, scales with it so the crop keeps its shape.
 * Google-hosted photos take a size directive, which resolveAvatarSrc writes.
 * Any other host passes through untouched.
 */
export function thumbnailUrl(url: string, widthPx: number): string {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }
  const width = Math.max(1, Math.round(widthPx));
  if (parsedUrl.hostname === "images.unsplash.com") {
    const originalWidth = Number(parsedUrl.searchParams.get("w"));
    const originalHeight = Number(parsedUrl.searchParams.get("h"));
    if (originalWidth > 0 && originalHeight > 0) {
      parsedUrl.searchParams.set(
        "h",
        String(Math.round((originalHeight * width) / originalWidth)),
      );
    }
    parsedUrl.searchParams.set("w", String(width));
    parsedUrl.searchParams.set("q", "70");
    return parsedUrl.toString();
  }
  if (/googleusercontent\.com$|ggpht\.com$/.test(parsedUrl.hostname)) {
    return resolveAvatarSrc(url, width) ?? url;
  }
  return url;
}

/**
 * The contact shadow and the exact-coordinate dot. The ground hangs off the
 * button's bottom centre, which is the coordinate under `pinAnchor: "bottom"`;
 * pass "center" for a centred anchor. It stays put while the pin lifts, so
 * lift the pin's body on hover or selection and leave the button still: the
 * ground is the button's child and travels with any transform on it.
 */
export function groundMarkup(anchor: "bottom" | "center" = "bottom"): string {
  const groundClass =
    anchor === "center"
      ? `${PIN_CHROME_CLASS.ground} ${PIN_CHROME_CLASS.groundCentered}`
      : PIN_CHROME_CLASS.ground;
  return (
    `<span class="${groundClass}" aria-hidden="true">` +
    `<span class="${PIN_CHROME_CLASS.groundShadow}"></span>` +
    `<span class="${PIN_CHROME_CLASS.groundDot}"></span>` +
    `</span>`
  );
}

/**
 * One expanding ring from the ground point, played each time the button gains
 * `data-selected="true"`. Same anchor rule as groundMarkup. A repaint keeps
 * this element (see paintChromePin), so a selected pin whose text changes
 * does not play it again.
 */
export function rippleMarkup(anchor: "bottom" | "center" = "bottom"): string {
  const groundClass =
    anchor === "center"
      ? `${PIN_CHROME_CLASS.ground} ${PIN_CHROME_CLASS.groundCentered}`
      : PIN_CHROME_CLASS.ground;
  return (
    `<span class="${groundClass}" aria-hidden="true">` +
    `<span class="${PIN_CHROME_CLASS.ripple}"></span>` +
    `</span>`
  );
}

/**
 * The small jade verified mark. Decorative: the pin's aria-label is the
 * accessible name and carries the place's details for assistive tech.
 */
export function verifiedBadgeMarkup(): string {
  return (
    `<span class="${PIN_CHROME_CLASS.verifiedBadge}" aria-hidden="true">` +
    CHECK_ICON_SVG +
    `</span>`
  );
}

// The callout thumbnail is 40px. 96px covers a 2x screen and is the width the
// Portrait pin asks for its own photo, so the two share one cached download.
const CALLOUT_THUMB_REQUEST_PX = 96;

function calloutThumbMarkup(venue: VenueMarkerData): string {
  // The icon tile always renders, and the photo covers it. A photo that fails
  // to load leaves an empty `alt=""` box, so the tile shows through in place
  // of a broken-image glyph. The photo stays `display: none` until the pin is
  // selected, which is what lets `loading="lazy"` hold the download back: an
  // image hidden by opacity alone still loads.
  const photoMarkup = venue.photo
    ? `<img src="${escapeHtml(thumbnailUrl(venue.photo, CALLOUT_THUMB_REQUEST_PX))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : "";
  return (
    `<span class="${PIN_CHROME_CLASS.calloutThumb}">` +
    `<span class="${PIN_CHROME_CLASS.calloutThumbIcon}">${ICON_SVG[venue.type] ?? ""}</span>` +
    photoMarkup +
    `</span>`
  );
}

/**
 * The selected-state card above the pin: photo or icon tile, the name (with
 * the verified mark when it applies), and a category + neighbourhood line.
 * Hidden until the button carries `data-selected="true"`. It repeats the
 * aria-label's content, so it is hidden from assistive tech.
 */
export function calloutMarkup(venue: VenueMarkerData): string {
  const metaParts = [venue.categoryLabel, venue.address].filter(
    (part): part is string => Boolean(part),
  );
  const metaText = metaParts.map(escapeHtml).join(" · ");
  return (
    `<span class="${PIN_CHROME_CLASS.callout}" aria-hidden="true">` +
    calloutThumbMarkup(venue) +
    `<span class="${PIN_CHROME_CLASS.calloutText}">` +
    `<span class="${PIN_CHROME_CLASS.calloutNameRow}">` +
    `<span class="${PIN_CHROME_CLASS.calloutName}">${escapeHtml(venue.name)}</span>` +
    (venue.isVerified ? verifiedBadgeMarkup() : "") +
    `</span>` +
    `<span class="${PIN_CHROME_CLASS.calloutMeta}">` +
    `<span class="${PIN_CHROME_CLASS.calloutDot}"></span>` +
    `<span class="${PIN_CHROME_CLASS.calloutMetaText}">${metaText}</span>` +
    `</span>` +
    `</span>` +
    `<span class="${PIN_CHROME_CLASS.calloutTail}"></span>` +
    `</span>`
  );
}

// Degrees of cream left between two ring segments, so neighbouring
// categories read as separate arcs.
const CLUSTER_SEGMENT_GAP_DEG = 2;
// The fixed cream the disc is made of. Written from the channel token
// because --cream itself flips to near-black in dark mode.
const FIXED_CREAM = "rgba(var(--cream-rgb), 1)";

function roundDegrees(degrees: number): string {
  return `${Math.round(degrees * 100) / 100}deg`;
}

/** The conic-gradient for a cluster's category ring: one arc per category,
 *  sized by its share of the members, largest first. */
export function clusterRingGradient(members: VenueMarkerData[]): string {
  const countByType = new Map<string, number>();
  for (const member of members) {
    countByType.set(member.type, (countByType.get(member.type) ?? 0) + 1);
  }
  const segments = [...countByType.entries()].sort(
    (first, second) => second[1] - first[1],
  );
  const total = members.length || 1;
  const hasGaps = segments.length > 1;
  const stops: string[] = [];
  let cursorDegrees = 0;
  for (const [type, count] of segments) {
    const endDegrees = cursorDegrees + (count / total) * 360;
    const colorEnd = hasGaps
      ? endDegrees - CLUSTER_SEGMENT_GAP_DEG
      : endDegrees;
    stops.push(
      `${pinColorValue(type)} ${roundDegrees(cursorDegrees)} ${roundDegrees(colorEnd)}`,
    );
    if (hasGaps) {
      stops.push(
        `${FIXED_CREAM} ${roundDegrees(colorEnd)} ${roundDegrees(endDegrees)}`,
      );
    }
    cursorDegrees = endDegrees;
  }
  return `conic-gradient(${stops.join(", ")})`;
}

/** The inside of a cluster button: the category ring and the count. */
export function clusterMarkup(members: VenueMarkerData[]): string {
  return (
    `<span class="${PIN_CHROME_CLASS.clusterRing}" aria-hidden="true" style="--cluster-ring: ${clusterRingGradient(members)}"></span>` +
    `<span class="${PIN_CHROME_CLASS.clusterCount}" aria-hidden="true">${members.length}</span>`
  );
}

/** Fill a cluster button with the chrome cluster. */
export function buildChromeCluster(
  button: HTMLButtonElement,
  members: VenueMarkerData[],
): void {
  button.className = PIN_CHROME_CLASS.cluster;
  button.dataset.size = clusterSizeOf(members.length);
  button.innerHTML = clusterMarkup(members);
}

// What a chrome pin last rendered, per button, so a refresh rebuilds only
// when something visible changed.
const renderedSignatures = new WeakMap<HTMLElement, string>();

function signatureOf(venue: VenueMarkerData): string {
  return [
    venue.type,
    venue.name,
    venue.address,
    venue.photo ?? "",
    venue.categoryLabel ?? "",
    venue.secondaryLabel ?? "",
    venue.isVerified ? "verified" : "",
  ].join("\u0000");
}

/** Record what a pin now shows. True when that differs from last time. */
export function updatePinSignature(
  button: HTMLElement,
  venue: VenueMarkerData,
): boolean {
  const nextSignature = signatureOf(venue);
  if (renderedSignatures.get(button) === nextSignature) return false;
  renderedSignatures.set(button, nextSignature);
  return true;
}

/**
 * The ripple layer a pin already holds, when its markup came from
 * paintChromePin: the button's second child, holding the ripple ring.
 */
function existingRippleLayer(button: HTMLElement): Element | null {
  const rippleLayer = button.children[1];
  if (!rippleLayer || !PIN_CHROME_CLASS.ripple) return null;
  const hasRipple =
    rippleLayer.firstElementChild?.classList.contains(
      PIN_CHROME_CLASS.ripple,
    ) ?? false;
  return hasRipple ? rippleLayer : null;
}

/** Everything a chrome pin paints from its venue: category, colour, markup. */
function paintChromePin(
  button: HTMLElement,
  venue: VenueMarkerData,
  bodyMarkup: (venue: VenueMarkerData) => string,
  anchor: "bottom" | "center",
): void {
  button.dataset.category = venue.type;
  applyPinColor(button, venue.type);
  // Ground and ripple first, so the body paints over them; the callout last,
  // so it paints over the body.
  const contentMarkup = bodyMarkup(venue) + calloutMarkup(venue);
  // Ground and ripple depend on the anchor alone, which a pin keeps for life,
  // so a repaint swaps only what follows them. The ripple element survives,
  // its animation already spent, and a selected pin repainted by a language
  // switch stays still.
  const rippleLayer = existingRippleLayer(button);
  if (rippleLayer) {
    while (rippleLayer.nextSibling) rippleLayer.nextSibling.remove();
    rippleLayer.insertAdjacentHTML("afterend", contentMarkup);
    return;
  }
  button.innerHTML =
    groundMarkup(anchor) + rippleMarkup(anchor) + contentMarkup;
}

export interface ChromeRendererOptions {
  /** The style's own pin class, added after the chrome base class. */
  pinClass: string;
  /** The pin's visible body (the part that lifts), as an HTML string. */
  bodyMarkup: (venue: VenueMarkerData) => string;
  /** Defaults to 44, today's value. */
  clusterRadiusPx?: number;
  /** Defaults to "bottom". */
  pinAnchor?: "bottom" | "center";
  /** Passed through as PinRenderer.visualCenterOffsetPx. */
  visualCenterOffsetPx?: number;
  /** Passed through as PinRenderer.labelClass. */
  labelClass?: string;
  /** Passed through as PinRenderer.bodyClass. */
  bodyClass?: string;
}

/**
 * A complete renderer built from the chrome: ground, ripple, the style's body
 * and the callout in each pin, and the category-ring cluster. State styling
 * rides on the manager's data attributes, so the state classes handed back
 * are empty. A style that needs its own cluster or refresh logic can spread
 * the result and override those members.
 */
export function createChromeRenderer({
  pinClass,
  bodyMarkup,
  clusterRadiusPx = 44,
  pinAnchor = "bottom",
  visualCenterOffsetPx,
  labelClass,
  bodyClass,
}: ChromeRendererOptions): PinRenderer {
  return {
    visualCenterOffsetPx,
    labelClass,
    bodyClass,
    classes: {
      pin: `${PIN_CHROME_CLASS.pin} ${pinClass}`.trim(),
      pinSelected: "",
      pinHovered: "",
      pinEnter: PIN_CHROME_CLASS.enter,
      cluster: PIN_CHROME_CLASS.cluster,
      clusterHovered: "",
    },
    clusterRadiusPx,
    pinAnchor,
    buildPin(button, venue) {
      button.className = `${PIN_CHROME_CLASS.pin} ${pinClass}`.trim();
      updatePinSignature(button, venue);
      paintChromePin(button, venue, bodyMarkup, pinAnchor);
    },
    refreshPin(button, venue) {
      if (!updatePinSignature(button, venue)) return;
      paintChromePin(button, venue, bodyMarkup, pinAnchor);
    },
    buildCluster: buildChromeCluster,
  };
}

/** The category icon as markup, for a style's body. Empty for an unknown
 *  type, which then shows its plain fill. */
export function categoryIconMarkup(type: string): string {
  return ICON_SVG[type] ?? "";
}
