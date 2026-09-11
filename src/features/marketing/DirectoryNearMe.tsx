import { useState } from "react";
import { FiAlertCircle, FiCrosshair, FiLock } from "react-icons/fi";
import type { MyLocation } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocationHelpModal } from "./LocationHelpModal";
import { LocationPermissionElement } from "./LocationPermissionElement";
import s from "./DirectoryPage.module.css";

/** The catalog key explaining each state the browser can leave us in. `idle`
 *  and `asking` say nothing: the control's own label is already the message. */
const STATUS_MESSAGE_KEYS: Record<string, string> = {
  granted: "marketing:local.nearMe.onNote",
  denied: "marketing:local.nearMe.denied",
  timeout: "marketing:local.nearMe.timeout",
  unavailable: "marketing:local.nearMe.unavailable",
};

/**
 * "Sort by what is closest to me", offered once and reversible at any moment.
 *
 * The whole feature is one press and one promise. The press asks the browser
 * for a position; the promise, stated on screen rather than buried in a policy,
 * is that the position stays on the device. It is held in React state by
 * `useMyLocation`, used for haversine distances over coordinates the page has
 * already loaded, and forgotten when the tab closes. Nothing is sent, stored or
 * counted, so turning it on costs no request and leaves no trace.
 *
 * Every state the browser can answer with gets its own calm line: a timeout
 * invites another go, and a device that cannot answer says so. None of them
 * re-ask on their own.
 *
 * A blocked site is the one state a page cannot undo by asking, so it gets a
 * way out. Where the browser has the `<geolocation>` element, that element
 * takes our button's place, since its press can re-open the prompt. Everywhere
 * (including there, for a device-wide block) the note links to steps for the
 * member's own browser and device.
 */
export function DirectoryNearMe({
  location,
  layout = "stack",
}: {
  location: MyLocation;
  /** `"stack"` keeps the button and its note in their own column, for the
   *  results header. `"inline"` dissolves the wrapper so both become items of
   *  the search row's grid: the button sits on the field's line, the note drops
   *  to a second line of its own and so can't stretch the field. */
  layout?: "stack" | "inline";
}) {
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  // Nothing to offer on a browser without the API, or outside a secure
  // context, where the control could only ever fail.
  if (!location.isSupported) return null;

  const isOn = location.status === "granted";
  const isAsking = location.status === "asking";
  const isDenied = location.status === "denied";
  const shouldOfferBrowserButton = isDenied && location.hasInPageRecovery;
  const messageKey = shouldOfferBrowserButton
    ? "marketing:local.nearMe.deniedRecoverable"
    : STATUS_MESSAGE_KEYS[location.status];
  const isRefused =
    isDenied ||
    location.status === "timeout" ||
    location.status === "unavailable";

  const label = isOn
    ? t("marketing:local.nearMe.off")
    : isAsking
      ? t("marketing:local.nearMe.asking")
      : t("marketing:local.nearMe.on");

  const tryAgainFromHelp = () => {
    setIsHelpOpen(false);
    location.request();
  };

  return (
    <div className={layout === "inline" ? s.nearMeInline : s.nearMe}>
      {shouldOfferBrowserButton ? (
        <LocationPermissionElement location={location} />
      ) : (
        <button
          type="button"
          className={[s.nearMeButton, isOn && s.nearMeButtonOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={isOn}
          disabled={isAsking}
          onClick={() => (isOn ? location.clear() : location.request())}
        >
          <FiCrosshair aria-hidden />
          {label}
        </button>
      )}
      {/* The promise stays on screen while the feature is on, rather than
          appearing only at the moment of asking: the reassurance matters most
          once a position actually exists. A state the browser refused gets an
          explanation in its place, marked as the different kind of news it is. */}
      <p className={s.nearMeNote} role="status">
        {isRefused ? <FiAlertCircle aria-hidden /> : <FiLock aria-hidden />}
        <span>
          {t(messageKey ?? "marketing:local.nearMe.privacy")}
          {isDenied && (
            <>
              {" "}
              <button
                type="button"
                className={s.nearMeHelpLink}
                onClick={() => setIsHelpOpen(true)}
              >
                {t(
                  shouldOfferBrowserButton
                    ? "marketing:local.nearMe.help.stillOff"
                    : "marketing:local.nearMe.help.open",
                )}
              </button>
            </>
          )}
        </span>
      </p>
      {isHelpOpen && (
        <LocationHelpModal
          onClose={() => setIsHelpOpen(false)}
          onTryAgain={tryAgainFromHelp}
        />
      )}
    </div>
  );
}
