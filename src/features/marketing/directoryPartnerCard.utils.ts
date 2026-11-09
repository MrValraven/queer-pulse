import { type FocusEvent } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  hasMeetingPoint,
  listingKindOf,
  mobileCardAreaLine,
  normalizeMobileDetails,
} from "./listBusiness/listingMobile.data";

/* Shared by every partner card design in the "Businesses we partner with"
   rail. */

type Translate = ReturnType<typeof useTranslation>["t"];

/**
 * Where the business is, the way the directory card's meta row says it: an
 * online-only business reads "Online" or "Online · {city}", an out-and-about
 * one its meeting point or the area it works, and a place its neighbourhood.
 */
export function partnerAreaOf(t: Translate, place: DirectoryPlace): string {
  const kind = listingKindOf(place);
  if (kind === "online") {
    const city = place.city?.trim() ?? "";
    return city
      ? t("marketing:directory.card.onlineIn", { city })
      : t("marketing:directory.card.online");
  }
  if (kind === "mobile") {
    const areaLine = mobileCardAreaLine({
      hood: place.hood,
      isAtMeetingPoint: hasMeetingPoint(place),
      details: normalizeMobileDetails(place.mobileDetails),
    });
    return t(areaLine.key, areaLine.values);
  }
  return place.hood.trim();
}

/**
 * Brings a partner card fully into view when the keyboard lands on it, the
 * way LocalBusinessCard does: the browser treats a card cut by the rail's
 * edge as already visible and leaves it half hidden. Only the card's own
 * keyboard focus counts.
 */
export function handleKeyboardFocus(event: FocusEvent<HTMLElement>) {
  const card = event.currentTarget;
  const isCardItself = event.target === card;
  if (!isCardItself || !card.matches(":focus-visible")) return;
  // One frame later: WebKit drops a scroll asked for inside the focus event
  // itself, while it is still revealing the focused element.
  requestAnimationFrame(() => {
    card.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
  });
}
