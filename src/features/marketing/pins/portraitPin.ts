import {
  categoryIconMarkup,
  createChromeRenderer,
  thumbnailUrl,
  verifiedBadgeMarkup,
} from "./pinChrome";
import { escapeHtml } from "./pinIcons";
import type { PinRenderer, VenueMarkerData } from "./pinRenderer";
import s from "./portraitPin.module.css";

// The directory map's pin: the place's own face on the map. A round photo
// inside a category ring and a cream rim, a short tail pointing at the ground
// dot, a category chip at the lower right and the verified mark at the upper
// right. A place without a photo, or whose photo fails, shows a serif
// monogram of its name on the category colour instead, so every pin still
// reads as a face. Beside the disc floats the place's name over its category,
// set straight onto the map the way a street map labels its points of
// interest; which of those labels show depends on the zoom band and the
// manager's collision pass, all handled in portraitPin.module.css. The housing
// map keeps the older teardrop pin, whose points stand for neighbourhoods.

// CSS-module class access is `string | undefined` (noUncheckedIndexedAccess);
// resolve every name once to a plain string.
const CLASS = {
  pin: s.pin ?? "",
  body: s.body ?? "",
  shape: s.shape ?? "",
  tail: s.tail ?? "",
  frame: s.frame ?? "",
  monogram: s.monogram ?? "",
  photo: s.photo ?? "",
  chip: s.chip ?? "",
  verified: s.verified ?? "",
  label: s.label ?? "",
  nameRow: s.nameRow ?? "",
  name: s.name ?? "",
  category: s.category ?? "",
};

// The photo circle is 44px across, so 96px covers a 2x screen and keeps each
// pin's image to a few kilobytes. The callout thumbnail asks for the same
// size, so the browser fetches one image for both. thumbnailUrl can only
// shrink Unsplash and Google-hosted photos; a live upload on any other host
// passes through at full size until uploads are served through a resizing
// endpoint.
const PHOTO_REQUEST_PX = 96;
const PHOTO_BOX_PX = 44;

// Pins closer than this many screen pixels merge into a cluster. The disc is
// 54px across (the 44px photo plus a 3px category ring and a 2px cream rim on
// each side) and the chip reaches two pixels past it. At 64px apart, two
// single pins keep a clear gap between their discs even while one of them is
// hovered and grown, and the label collision pass in the manager decides
// which names fit between them.
const PORTRAIT_CLUSTER_RADIUS_PX = 64;

// The button is 64px tall and anchored at its bottom centre, the coordinate.
// The disc's centre sits 27px below the button's top (half of the 54px
// disc), so 37px above the coordinate. The manager clusters from there, where
// the eye sees the pin. At the city zoom band the body shrinks to 0.75 from
// its bottom edge, which moves that centre to about 29px above the
// coordinate; the resting value is the one reported.
const PORTRAIT_VISUAL_CENTER_OFFSET_PX = -37;

// A grapheme whose first character is a letter or a digit in any script.
const LETTER_OR_DIGIT = /^[\p{L}\p{N}]/u;

// Splits a name into user-perceived characters, so a letter with combining
// marks, or a cluster in an Indic script, stays whole. Created once and
// reused; absent in an engine without Intl.Segmenter, which then splits by
// code point.
const graphemeSegmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function graphemesOf(text: string): Iterable<string> {
  if (!graphemeSegmenter) return Array.from(text);
  return Array.from(
    graphemeSegmenter.segment(text),
    (graphemeSegment) => graphemeSegment.segment,
  );
}

/** The name's first letter or digit, uppercased; empty when the name has
 *  none (empty, or only punctuation and emoji). Raw text: escape it before
 *  it reaches markup. */
function monogramLetter(name: string): string {
  for (const grapheme of graphemesOf(name.normalize("NFC"))) {
    if (LETTER_OR_DIGIT.test(grapheme)) return grapheme.toLocaleUpperCase();
  }
  return "";
}

/** The fallback face: the monogram letter, or the category icon in cream when
 *  the name offers no letter to show. */
function monogramMarkup(venue: VenueMarkerData): string {
  const letter = monogramLetter(venue.name);
  const faceMarkup = letter
    ? escapeHtml(letter)
    : categoryIconMarkup(venue.type);
  return `<span class="${CLASS.monogram}">${faceMarkup}</span>`;
}

function photoMarkup(photo: string | undefined): string {
  if (!photo) return "";
  return (
    `<img class="${CLASS.photo}" src="${escapeHtml(thumbnailUrl(photo, PHOTO_REQUEST_PX))}"` +
    ` width="${PHOTO_BOX_PX}" height="${PHOTO_BOX_PX}" alt="" decoding="async"` +
    ` draggable="false" referrerpolicy="no-referrer">`
  );
}

function chipMarkup(type: string): string {
  const icon = categoryIconMarkup(type);
  // An unknown type has no icon, and an empty coloured dot would only repeat
  // the ring, so the chip is left out.
  return icon ? `<span class="${CLASS.chip}">${icon}</span>` : "";
}

/**
 * The part that lifts and grows: the shape (tail and ringed frame, which
 * carry the drop shadow together), then the chip and the verified mark
 * painted over the rim. The monogram always renders under the photo, so a pin
 * whose photo is still loading, or has failed, shows the letter.
 */
function portraitBodyMarkup(venue: VenueMarkerData): string {
  return (
    `<span class="${CLASS.body}" aria-hidden="true">` +
    `<span class="${CLASS.shape}">` +
    `<span class="${CLASS.tail}"></span>` +
    `<span class="${CLASS.frame}">` +
    monogramMarkup(venue) +
    photoMarkup(venue.photo) +
    `</span>` +
    `</span>` +
    chipMarkup(venue.type) +
    (venue.isVerified
      ? `<span class="${CLASS.verified}">${verifiedBadgeMarkup()}</span>`
      : "") +
    `</span>`
  );
}

/**
 * The floating label beside the disc: the name (with the verified mark
 * when it applies) over the category line. A sibling of the body, so it
 * follows the lift and stays out of the body's scale, which keeps its text
 * crisp. It sits inside the button, so a click on a shown name selects the
 * place just as a click on the disc does, and it repeats the button's
 * aria-label, so it is hidden from assistive tech.
 */
function labelMarkup(venue: VenueMarkerData): string {
  const verifiedMarkup = venue.isVerified ? verifiedBadgeMarkup() : "";
  const categoryMarkup = venue.categoryLabel
    ? `<span class="${CLASS.category}">${escapeHtml(venue.categoryLabel)}</span>`
    : "";
  return (
    `<span class="${CLASS.label}" aria-hidden="true">` +
    `<span class="${CLASS.nameRow}">` +
    `<span class="${CLASS.name}">${escapeHtml(venue.name)}</span>` +
    verifiedMarkup +
    `</span>` +
    categoryMarkup +
    `</span>`
  );
}

function portraitPinMarkup(venue: VenueMarkerData): string {
  return portraitBodyMarkup(venue) + labelMarkup(venue);
}

// Photos already given their load and error listeners, so a refresh that
// keeps the same markup never stacks a second pair.
const watchedPhotos = new WeakSet<HTMLImageElement>();

/**
 * Settle a pin's photo once the browser knows its fate. A loaded photo marks
 * its frame ready, which hides the monogram behind it (a logo with
 * transparent areas then sits on the category colour). A photo that fails is
 * removed, which uncovers the monogram. Listeners are attached here, after
 * the chrome paints, so the markup carries no inline handlers.
 */
function watchPhoto(button: HTMLElement): void {
  if (!CLASS.photo) return;
  const photo = button.getElementsByClassName(CLASS.photo)[0];
  if (!(photo instanceof HTMLImageElement) || watchedPhotos.has(photo)) return;
  watchedPhotos.add(photo);
  const frame = photo.parentElement;
  const markReady = () => {
    if (frame) frame.dataset.photo = "ready";
  };
  const dropPhoto = () => {
    photo.remove();
  };
  // A photo already in the memory cache can finish before the listeners
  // exist, so read its state first.
  if (photo.complete) {
    if (photo.naturalWidth > 0) markReady();
    else dropPhoto();
    return;
  }
  photo.addEventListener("load", markReady, { once: true });
  photo.addEventListener("error", dropPhoto, { once: true });
}

const chromeRenderer = createChromeRenderer({
  pinClass: CLASS.pin,
  bodyMarkup: portraitPinMarkup,
  clusterRadiusPx: PORTRAIT_CLUSTER_RADIUS_PX,
  pinAnchor: "bottom",
});

export const portraitPinRenderer: PinRenderer = {
  ...chromeRenderer,
  visualCenterOffsetPx: PORTRAIT_VISUAL_CENTER_OFFSET_PX,
  // The manager measures these to cull labels that collide. The frame is the
  // round disc itself; the body box also takes in the tail below it.
  labelClass: CLASS.label,
  bodyClass: CLASS.frame,
  buildPin(button, venue) {
    chromeRenderer.buildPin(button, venue);
    watchPhoto(button);
  },
  // The chrome repaints only when something visible changed; a repaint makes
  // a fresh img, which the WeakSet has not seen, so it gets its listeners.
  refreshPin(button, venue) {
    chromeRenderer.refreshPin(button, venue);
    watchPhoto(button);
  },
};
