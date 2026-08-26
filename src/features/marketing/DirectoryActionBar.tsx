import { useState } from "react";
import { FiHeart, FiNavigation, FiPhone, FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useShareLink } from "../../shared/hooks";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved } from "../../app/providers/useSaved";
import { businessPath, routes } from "../../app/routeMap";
import {
  isPlaceGone,
  operatingStateOf,
  type DirectoryPlace,
} from "./directoryPlaces";
import { placeCoordinates } from "./businessCoords";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the bar is decorative context only, not actionable. */
  preview?: boolean;
}

/** Same coords fallback order the map card and the nearby strip use. */
function directionsHref(place: DirectoryPlace, demoMode: boolean): string {
  const coords = placeCoordinates(place, demoMode);
  return coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
}

/**
 * Primary venue actions — Directions, Call, Share, Save — the things a top
 * business page leads with. Sits above the map card in the aside column and
 * collapses to a sticky bottom bar on mobile for one-handed reach.
 *
 * Operating state gates two of them, on different grounds.
 *
 * Directions goes away for a `permanently_closed` or `moved` business: the
 * address on this page no longer leads anywhere worth going, and routing
 * somebody across the city to a shuttered door is the exact failure this
 * gating exists to prevent. A `temporarily_closed` business keeps Directions,
 * because it is still that place at that address and will open again.
 *
 * Call goes away only for a `permanently_closed` business, where the line is
 * as dead as the door. A moved business kept trading and almost certainly
 * kept its number, so taking the phone away would help nobody.
 *
 * Share and Save survive every state: the page remains a record worth passing
 * on, and stripping Save would strand anybody who had already saved the place.
 *
 * Preview handling: the admin moderation drawer reuses this whole page body
 * (`DirectorySpaceView`) to show what a listing looks like live. None of
 * these actions make sense against a not-yet-approved listing (nowhere to
 * navigate to reliably, nothing to save), and — same as the aside's own
 * "back to directory" CTA — the moderator isn't the audience for them. We
 * return `null` outright rather than rendering disabled buttons: an empty
 * slot reads as "this bar doesn't apply here", while a row of dead buttons
 * would invite clicking.
 */
export function DirectoryActionBar({ place, preview = false }: Props) {
  const { t } = useTranslation();
  const shareLink = useShareLink({
    copied: t("marketing:directory.detail.action.linkCopied"),
    failed: t("marketing:directory.detail.action.shareError"),
  });
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const { isSaved, toggleSave } = useSaved();
  const [sharing, setSharing] = useState(false);

  if (preview) return null;

  // "Gone" = permanently closed or moved: whatever else is still true, the
  // address on this page is no longer where the business is.
  const isGone = isPlaceGone(place);
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";
  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);

  async function handleShare() {
    if (typeof navigator === "undefined") return;
    const url = window.location.href;
    // Prefer the OS share sheet where available; fall back to the shared
    // copy-link + toast helper (which owns the clipboard write and success/
    // failure toasts) everywhere else.
    if (navigator.share) {
      try {
        setSharing(true);
        await navigator.share({ title: place.name, url });
        return;
      } catch (error) {
        // User-cancelled share sheets throw AbortError — not a failure, stay
        // silent. Any other native-share failure falls through to copy.
        if (error instanceof Error && error.name === "AbortError") return;
      } finally {
        setSharing(false);
      }
    }
    await shareLink.share(url);
  }

  function handleSave() {
    toggleSave({
      id: savedId,
      kind: "listing",
      title: place.name,
      href: businessPath(place.slug),
      meta: place.hood,
    });
  }

  return (
    <div className={s.actionBar}>
      {!isGone && (
        <Button
          variant="primary"
          className={s.actionBarBtn}
          href={directionsHref(place, demoMode)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiNavigation aria-hidden />
          {t("marketing:directory.detail.action.directions")}
        </Button>
      )}
      {!isPermanentlyClosed && place.social.phone && (
        <Button
          variant="ghost"
          className={s.actionBarBtn}
          href={`tel:${place.social.phone.replace(/\s/g, "")}`}
        >
          <FiPhone aria-hidden />
          {t("marketing:directory.detail.action.call")}
        </Button>
      )}
      <Button
        variant="ghost"
        className={s.actionBarBtn}
        onClick={() => void handleShare()}
        disabled={sharing}
      >
        <FiShare2 aria-hidden />
        {t("marketing:directory.detail.action.share")}
      </Button>
      {user ? (
        <Button
          variant={saved ? "jade" : "ghost"}
          className={s.actionBarBtn}
          onClick={handleSave}
          aria-pressed={saved}
          aria-label={
            saved
              ? t("marketing:directory.detail.action.saved")
              : t("marketing:directory.detail.action.save")
          }
        >
          <FiHeart
            aria-hidden
            style={{ fill: saved ? "currentColor" : "none" }}
          />
          {saved
            ? t("marketing:directory.detail.action.saved")
            : t("marketing:directory.detail.action.save")}
        </Button>
      ) : (
        // Logged-out visitors still see Save — clicking routes them to sign-in
        // (there's no local session to save into) rather than hiding the
        // affordance and the sign-in nudge entirely.
        <Button
          variant="ghost"
          className={s.actionBarBtn}
          to={routes.signIn}
          aria-label={t("marketing:directory.detail.action.saveSignIn")}
        >
          <FiHeart aria-hidden style={{ fill: "none" }} />
          {t("marketing:directory.detail.action.save")}
        </Button>
      )}
    </div>
  );
}
