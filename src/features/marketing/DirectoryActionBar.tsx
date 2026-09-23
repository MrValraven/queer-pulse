import { useState } from "react";
import {
  FiHeart,
  FiMessageSquare,
  FiNavigation,
  FiPhone,
  FiShare2,
} from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
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
import { useShareToChat } from "../messages/share/useShareToChat";
import { ShareToChatModal } from "../messages/share/ShareToChatModal";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the row is decorative context only. */
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
 * Primary venue actions (Directions, Call, Share, Send in a message, Save) as
 * one compact row of icon-only buttons sitting to the right of the listing
 * name, at every viewport. Each control carries a tooltip for the sighted
 * reader and its own `aria-label` for everyone else, so the row stays legible
 * without spending a card's worth of the page on five labels. Directions keeps
 * a coral tint so it still reads as first among equals.
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
 * A signed-out visitor keeps Save too, routed to sign-in. "Send in a message"
 * is the one action hidden outright when signed out, since there is no inbox
 * to pick a thread from.
 *
 * Preview handling: the admin moderation drawer reuses this whole page body
 * (`DirectorySpaceView`) to show what a listing looks like live. None of
 * these actions make sense against a not-yet-approved listing (nowhere to
 * navigate to reliably, nothing to save), and the moderator is not their
 * audience anyway, same as the aside's own "back to directory" CTA. We return
 * `null` outright. An empty slot reads as "these actions do not apply here",
 * while a row of dead buttons would invite clicking.
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
  const [isSharing, setIsSharing] = useState(false);
  // `ShareToChatAction` is deliberately not used here: its own JSDoc points a
  // surface with bespoke action markup at this pair instead, so the trigger
  // matches the row's idiom, in place of an ordinary pill button.
  const shareToChat = useShareToChat();

  if (preview) return null;

  // "Gone" = permanently closed or moved: whatever else is still true, the
  // address on this page is no longer where the business is.
  const isGone = isPlaceGone(place);
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";
  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);

  const directionsLabel = t("marketing:directory.detail.action.directions");
  const callLabel = t("marketing:directory.detail.action.call");
  const shareLabel = t("marketing:directory.detail.action.share");
  const saveLabel = saved
    ? t("marketing:directory.detail.action.saved")
    : t("marketing:directory.detail.action.save");

  async function handleShare() {
    if (typeof navigator === "undefined") return;
    const url = window.location.href;
    // Prefer the OS share sheet where available; fall back to the shared
    // copy-link + toast helper (which owns the clipboard write and success/
    // failure toasts) everywhere else.
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({ title: place.name, url });
        return;
      } catch (error) {
        // User-cancelled share sheets throw AbortError, which is not a
        // failure, so stay silent. Any other native-share failure falls
        // through to copy.
        if (error instanceof Error && error.name === "AbortError") return;
      } finally {
        setIsSharing(false);
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

  // `placement="bottom"` throughout: the row sits under the floating navbar,
  // so a bubble above it would land on the nav.
  return (
    <div className={s.actionBar}>
      {!isGone && (
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
      <Tooltip label={shareLabel} placement="bottom">
        <IconButton
          aria-label={shareLabel}
          onClick={() => void handleShare()}
          disabled={isSharing}
        >
          <FiShare2 aria-hidden />
        </IconButton>
      </Tooltip>
      {shareToChat.canShare && (
        <Tooltip label={t("messages:share.cta")} placement="bottom">
          <IconButton
            aria-label={t("messages:share.ariaLabel", { title: place.name })}
            onClick={shareToChat.open}
          >
            {/* A message bubble, where the labelled share-to-chat triggers
                elsewhere (`ShareToChatAction`, `ArticleToolbar`) use FiSend.
                Two reasons to diverge here. FiSend and the FiNavigation arrow
                on Directions are both angular shapes pointing up and right,
                which read as the same glyph at 44px in one row. And this row
                is icon-only, so each glyph carries its whole meaning, while a
                paper plane beside the words "Send in a message" has the label
                to lean on. FiMessageSquare is also what the navbar, the
                sidebar and the admin nav already use for messaging. */}
            <FiMessageSquare aria-hidden />
          </IconButton>
        </Tooltip>
      )}
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
      {shareToChat.isOpen && (
        <ShareToChatModal
          url={businessPath(place.slug)}
          title={place.name}
          kind="directory"
          onClose={shareToChat.close}
        />
      )}
    </div>
  );
}
