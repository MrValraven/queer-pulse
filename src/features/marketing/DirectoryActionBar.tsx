import { FiHeart, FiNavigation, FiPhone } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved } from "../../app/providers/useSaved";
import { businessPath, routes } from "../../app/routeMap";
import {
  isPlaceGone,
  operatingStateOf,
  type DirectoryPlace,
} from "./directoryPlaces";
import { directionsHref } from "./businessCoords";
import {
  buildDirectoryShareMessage,
  mobileAreaLineText,
} from "./directoryShareMessage";
import {
  hasMeetingPoint,
  listingKindOf,
} from "./listBusiness/listingMobile.data";
import { ShareMenu } from "../messages/share/ShareMenu";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the row is decorative context only. */
  preview?: boolean;
}

/**
 * Primary venue actions (Directions, Call, Share, Save) as one compact row of
 * icon-only buttons sitting to the right of the listing name, at every
 * viewport. Each control carries a tooltip for the sighted reader and its own
 * `aria-label` for everyone else, so the row stays legible without spending a
 * card's worth of the page on four labels. Directions keeps a coral tint so it
 * still reads as first among equals.
 *
 * Share opens the shared `ShareMenu`: a message inside QueerPulse (signed-in
 * members only, since there is no inbox to pick a thread from otherwise),
 * WhatsApp, the device's share sheet where it has one, the composed message
 * (name, category and where, from `buildDirectoryShareMessage`) and the bare
 * link.
 *
 * Operating state gates two of them, on different grounds, and an online-only
 * listing gates one more.
 *
 * Directions goes away for a `permanently_closed` or `moved` business: the
 * address on this page no longer leads anywhere worth going, and routing
 * somebody across the city to a shuttered door is the exact failure this
 * gating exists to prevent. A `temporarily_closed` business keeps Directions,
 * because it is still that place at that address and will open again.
 * Directions also goes away for an online-only business (`place.online`),
 * which has no door at all: it carries no address or pin, so the link could
 * only route somebody to an empty search.
 *
 * Call goes away only for a `permanently_closed` business, where the line is
 * as dead as the door. A moved business kept trading and almost certainly
 * kept its number, so taking the phone away would help nobody.
 *
 * Share and Save survive every state: the page remains a record worth passing
 * on, and stripping Save would strand anybody who had already saved the place.
 * The shared message carries the state too, so a closed or moved business
 * reaches the recipient as one. A signed-out visitor keeps Save, routed to
 * sign-in.
 *
 * Preview handling: the admin moderation drawer reuses this whole page body
 * (`DirectorySpaceView`) to show what a listing looks like live. None of
 * these actions make sense against a not-yet-approved listing (nowhere to
 * navigate to reliably, nothing to save), and the moderator is not their
 * audience anyway. We return `null` outright. An empty slot reads as "these
 * actions do not apply here", while a row of dead buttons would invite
 * clicking.
 */
export function DirectoryActionBar({ place, preview = false }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const { isSaved, toggleSave } = useSaved();

  if (preview) return null;

  // "Gone" = permanently closed or moved: whatever else is still true, the
  // address on this page is no longer where the business is.
  const isGone = isPlaceGone(place);
  const hasPlaceToGo =
    !isGone && (listingKindOf(place) === "place" || hasMeetingPoint(place));
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";
  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);

  const directionsLabel = t("marketing:directory.detail.action.directions");
  const callLabel = t("marketing:directory.detail.action.call");
  const saveLabel = saved
    ? t("marketing:directory.detail.action.saved")
    : t("marketing:directory.detail.action.save");

  function handleSave() {
    toggleSave({
      id: savedId,
      kind: "listing",
      title: place.name,
      href: businessPath(place.slug),
      // The saved list's subline, matching the directory card: an online-only
      // business's hood is the "Elsewhere in" catch-all, which says nothing.
      meta: place.online
        ? t("marketing:directory.card.online")
        : (mobileAreaLineText(place, t) ?? place.hood),
    });
  }

  // `placement="bottom"` throughout: the row sits under the floating navbar,
  // so a bubble above it would land on the nav.
  return (
    <div className={s.actionBar}>
      {hasPlaceToGo && (
        <Tooltip label={directionsLabel} placement="bottom">
          {/* `IconButton` is typed as a <button> only and Directions is an
              external href, so this uses the same `Button variant="icon"` that
              IconButton wraps and states the accessible name itself. */}
          <Button
            variant="icon"
            href={directionsHref(place, demoMode)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={directionsLabel}
          >
            <FiNavigation aria-hidden className={s.actionBarDirectionsIcon} />
          </Button>
        </Tooltip>
      )}
      {!isPermanentlyClosed && place.social.phone && (
        <Tooltip label={callLabel} placement="bottom">
          {/* A `tel:` href is an anchor too, so it takes the same route. */}
          <Button
            variant="icon"
            href={`tel:${place.social.phone.replace(/\s/g, "")}`}
            aria-label={callLabel}
          >
            <FiPhone aria-hidden />
          </Button>
        </Tooltip>
      )}
      <ShareMenu
        content={{
          // The listing's canonical path, the one "Send in a message" always
          // sent, so every item shares the same link whatever URL the page
          // was reached by.
          path: businessPath(place.slug),
          title: place.name,
          kind: "directory",
          text: buildDirectoryShareMessage(place, t),
        }}
        triggerLabel={t("marketing:directory.detail.action.share")}
        tooltipPlacement="bottom"
      />
      {user ? (
        <Tooltip label={saveLabel} placement="bottom">
          <IconButton
            onClick={handleSave}
            aria-pressed={saved}
            aria-label={saveLabel}
          >
            {/* Both branches name a class that sets `fill` to a real value
                ("currentColor" plus the jade tint, or "none"). An undefined
                fill paints a Feather icon solid black, so neither branch may
                fall through. */}
            <FiHeart
              aria-hidden
              className={saved ? s.actionBarHeartFull : s.actionBarHeartHollow}
            />
          </IconButton>
        </Tooltip>
      ) : (
        // Signed-out visitors still see Save. Activating it routes them to
        // sign-in (there is no local session to save into), which keeps both
        // the affordance and the sign-in nudge on the page. A router link
        // again, so `Button variant="icon"` carries the label itself.
        <Tooltip label={saveLabel} placement="bottom">
          <Button
            variant="icon"
            to={routes.signIn}
            aria-label={t("marketing:directory.detail.action.saveSignIn")}
          >
            <FiHeart aria-hidden className={s.actionBarHeartHollow} />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
