import { useState } from "react";
import { FiHeart, FiNavigation, FiPhone, FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useSaved } from "../../app/providers/useSaved";
import { businessPath, routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import { BUSINESS_COORDS } from "./businessCoords";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the bar is decorative context only, not actionable. */
  preview?: boolean;
}

/** Same coords fallback order DirectorySpaceAside uses for its map card. */
function directionsHref(place: DirectoryPlace): string {
  const coords =
    place.latitude != null && place.longitude != null
      ? { latitude: place.latitude, longitude: place.longitude }
      : BUSINESS_COORDS[place.slug];
  return coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
}

/**
 * Primary venue actions — Directions, Call, Share, Save — the things a top
 * business page leads with. Sits above the map card in the aside column and
 * collapses to a sticky bottom bar on mobile for one-handed reach.
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
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSaved();
  const [sharing, setSharing] = useState(false);

  if (preview) return null;

  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);

  async function handleShare() {
    if (typeof navigator === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        setSharing(true);
        await navigator.share({ title: place.name, url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast(
          t("marketing:directory.detail.action.linkCopied"),
          "success",
        );
      }
    } catch (error) {
      // User-cancelled share sheets throw AbortError — not a failure, stay
      // silent. Anything else (clipboard rejected, insecure context, no
      // permission) gets a toast so the user isn't left guessing.
      if (error instanceof Error && error.name === "AbortError") return;
      showToast(t("marketing:directory.detail.action.shareError"), "info");
    } finally {
      setSharing(false);
    }
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
      <Button
        variant="primary"
        className={s.actionBarBtn}
        href={directionsHref(place)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiNavigation aria-hidden />
        {t("marketing:directory.detail.action.directions")}
      </Button>
      {place.social.phone && (
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
          <FiHeart aria-hidden style={{ fill: saved ? "currentColor" : "none" }} />
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
