import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import { LocalBusinessCardBody } from "../marketing/LocalBusinessCardBody";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import dirStyles from "../marketing/DirectoryPage.module.css";
import styles from "./PlaceLinkCardBody.module.css";

/**
 * The directory place card rendered where a shared QueerPulse place link
 * would otherwise show the generic unfurl of the SPA shell: the exact card
 * the `/local/directory` grid renders (`LocalBusinessCardBody`), sized to a
 * chat surface and linking straight to the listing via a router `<Link>`
 * (internal navigation, so no `linkSafetyGuard`/external-link chrome, same
 * reasoning `LocalBusinessCard.tsx`'s own grid card already relies on).
 *
 * Renders on its own, with no coloured `.bubble`/preview-panel frame around
 * it, since it already carries its own `--paper` surface, border, radius and
 * shadow; `PlaceShareBubble` (the chat bubble) and `ShareToChatPreview` (the
 * "Send in a message" preview) each place it above a separate caption
 * bubble/line, the same way a photo sits above its caption.
 *
 * Lazy-loaded by `MessageLinkCard`: this file, and the directory feature it
 * pulls in (`LocalBusinessCardBody`, `DirectoryPage.module.css` and their own
 * imports), only load once a message actually carries a place link, so an
 * ordinary link-only bubble never pays for the directory chunk's weight.
 *
 * A plain `<Link>` without the grid's `FadeIn` wrapper: a bubble remounts as
 * the thread scrolls, and no other bubble content replays an entrance.
 *
 * `shouldShowSave` is off: there is nothing on a chat bubble to save the
 * place FROM, and the card is otherwise identical (photo, rating, category,
 * hours, host) to the one the grid renders. Solid `--paper`, so it reads as
 * its own surface on a plum (sent) or paper (received) bubble alike, and
 * flips correctly in dark mode since `--paper` is a flipping token.
 */
export function PlaceLinkCardBody({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  return (
    <Link
      to={businessPath(place.slug)}
      className={`${dirStyles.card} ${styles.wrap}`}
      aria-label={t("messages:linkPreview.placeAria", { name: place.name })}
    >
      <LocalBusinessCardBody place={place} shouldShowSave={false} />
    </Link>
  );
}
