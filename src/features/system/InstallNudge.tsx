import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { FiArrowRight, FiPlusSquare, FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import {
  detectPlatform,
  useInstallPrompt,
  useLocalStorage,
  useMediaQuery,
  usePrefersReducedMotion,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { InstallAppModal } from "../../shared/components/system/InstallAppModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InstallNudge.module.css";

/** Matches the 30 days PwaPromptPage's own "maybe later" copy promises. */
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const SNOOZE_STORAGE_KEY = "qp.installNudge.snoozedAt";
/** Long enough that the nudge never competes with a page's first paint. */
const APPEAR_DELAY_MS = 5000;

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * ID-17. A quiet, dismissible offer to install the app, shown where the
 * install actually buys the member something: Chrome/Edge once
 * `beforeinstallprompt` has been captured, and iOS/iPadOS Safari always, since
 * it fires no such event and yet is the one platform where NOT installing
 * costs you every push notification the platform will ever send.
 *
 * On a phone the whole card is one tap target and opens `InstallAppModal` in
 * place: a member on the device being installed onto should not lose the page
 * they were reading to see three steps. On desktop it still links to
 * `PwaPromptPage`, which has the platform tabs a member picking a different
 * device than the one in their hand actually needs.
 *
 * Dismissal is a per-viewer convenience, so it lives in localStorage (via
 * `useLocalStorage`, which already swallows the throw in private mode) rather
 * than on the account.
 */
export function InstallNudge() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { isInstalled } = useDisplayMode();
  const { canInstall } = useInstallPrompt();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [snoozedAt, setSnoozedAt] = useLocalStorage<number>(
    SNOOZE_STORAGE_KEY,
    0,
    isTimestamp,
  );
  const [isRevealed, setIsRevealed] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // The snooze window is read here rather than during render: `Date.now()` is
  // impure, and re-reading it on every render is exactly what the purity rule
  // forbids. Re-running on `snoozedAt` also handles the dismiss, which writes a
  // fresh timestamp and so returns early from here forever after.
  useEffect(() => {
    if (Date.now() - snoozedAt < SNOOZE_MS) return;
    const timer = setTimeout(() => setIsRevealed(true), APPEAR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [snoozedAt]);

  function snooze() {
    setIsRevealed(false);
    setSnoozedAt(Date.now());
  }

  // Snoozing on close rather than on open keeps the nudge (and with it this
  // component, which owns the modal) mounted for as long as the steps are on
  // screen. Someone who has read the steps has had their answer either way.
  function closeInstructions() {
    setIsInstructionsOpen(false);
    snooze();
  }

  // iOS and iPadOS Safari never fire `beforeinstallprompt`, so `canInstall`
  // stays false there forever; the platform check is the only signal. iPadOS
  // reports itself as a Mac, which `detectPlatform` already separates out by
  // touch points.
  const isIosBrowserTab = detectPlatform() === "ios" && !isInstalled;

  // Never to someone who already installed, and never before the session knows
  // who it is talking to.
  const shouldShow =
    loggedIn && !isInstalled && isRevealed && (canInstall || isIosBrowserTab);

  if (!shouldShow) return null;

  // Spans throughout, not a div/p/Link stack: on mobile this same content is
  // the content of a `<button>`, which may hold only phrasing content.
  const content = (
    <>
      <span className={styles.icon}>
        <FiPlusSquare aria-hidden />
      </span>
      <span className={styles.body}>
        <span className={styles.title}>
          {t("system:pwaInstall.nudge.title")}
        </span>
        <span className={styles.text}>
          {t(
            isIosBrowserTab
              ? "system:pwaInstall.nudge.bodyIos"
              : "system:pwaInstall.nudge.body",
          )}
        </span>
        <span className={styles.cta}>
          {t("system:pwaInstall.nudge.cta")}
          <FiArrowRight aria-hidden />
        </span>
      </span>
    </>
  );

  return (
    <>
      <m.aside
        className={styles.nudge}
        aria-label={t("system:pwaInstall.nudge.title")}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {isMobile ? (
          <button
            type="button"
            className={styles.trigger}
            onClick={() => setIsInstructionsOpen(true)}
          >
            {content}
          </button>
        ) : (
          <Link
            className={styles.trigger}
            to={routes.pwaPrompt}
            onClick={snooze}
          >
            {content}
          </Link>
        )}
        <button
          type="button"
          className={styles.dismiss}
          aria-label={t("system:pwaInstall.nudge.dismiss")}
          onClick={snooze}
        >
          <FiX aria-hidden />
        </button>
      </m.aside>
      {isInstructionsOpen && <InstallAppModal onClose={closeInstructions} />}
    </>
  );
}
