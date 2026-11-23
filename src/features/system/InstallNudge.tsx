import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiDownload, FiPlusSquare } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useConsent } from "../../app/providers/useConsent";
import {
  detectPlatform,
  useInstallPrompt,
  useLocalStorage,
  useMediaQuery,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { Button } from "../../shared/components/ui";
import { InstallAppModal } from "../../shared/components/system/InstallAppModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InstallNudge.module.css";
import { useInstallNudgeInset } from "./useInstallNudgeInset";

/** Matches the 30 days PwaPromptPage's own "maybe later" copy promises. */
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const SNOOZE_STORAGE_KEY = "qp.installNudge.snoozedAt";
/** Long enough that the nudge never competes with a page's first paint. */
const APPEAR_DELAY_MS = 5000;

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

interface InstallNudgeActionsProps {
  canInstall: boolean;
  isMobile: boolean;
  onInstall: () => void;
  onShowSteps: () => void;
  onSnooze: () => void;
}

/**
 * The nudge's action row. With the browser's install event in hand the primary
 * button opens the native dialog in one tap. Without it (iOS, or Chrome before
 * it judges the app installable) the primary button shows the steps: in place
 * on a phone, on PwaPromptPage on desktop, which has the platform tabs for a
 * member installing onto another device. "Not now" snoozes the nudge.
 */
function InstallNudgeActions({
  canInstall,
  isMobile,
  onInstall,
  onShowSteps,
  onSnooze,
}: InstallNudgeActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.actions}>
      {canInstall ? (
        <Button size="sm" onClick={onInstall}>
          <FiDownload aria-hidden />
          {t("system:pwaInstall.nudge.install")}
        </Button>
      ) : isMobile ? (
        <Button size="sm" aria-haspopup="dialog" onClick={onShowSteps}>
          {t("system:pwaInstall.nudge.cta")}
        </Button>
      ) : (
        <Button size="sm" to={routes.pwaPrompt} onClick={onSnooze}>
          {t("system:pwaInstall.nudge.cta")}
        </Button>
      )}
      <Button size="sm" variant="quiet" onClick={onSnooze}>
        {t("system:pwaInstall.nudge.notNow")}
      </Button>
    </div>
  );
}

/**
 * ID-17. A quiet, dismissible offer to install the app, shown where the
 * install actually buys the member something: Chrome/Edge once
 * `beforeinstallprompt` has been captured, and iOS/iPadOS Safari always, since
 * it fires no such event and yet is the one platform where NOT installing
 * costs you every push notification the platform will ever send.
 *
 * Dismissal is a per-viewer convenience, so it lives in localStorage (via
 * `useLocalStorage`, which already swallows the throw in private mode) rather
 * than on the account.
 */
export function InstallNudge() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { isInstalled } = useDisplayMode();
  const { canInstall, requestInstall } = useInstallPrompt();
  const navigate = useNavigate();
  const { status: consentStatus } = useConsent();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [snoozedAt, setSnoozedAt] = useLocalStorage<number>(
    SNOOZE_STORAGE_KEY,
    0,
    isTimestamp,
  );
  const nudgeRef = useInstallNudgeInset();
  const titleId = useId();
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

  // Accepted or dismissed, the member has answered the browser's own dialog,
  // so the nudge steps back either way. An accepted install also flips
  // `isInstalled`, which hides the nudge for good. A prompt that never opened
  // leaves the member unanswered, so they get the manual steps: in place on a
  // phone, on PwaPromptPage on desktop.
  async function installNow() {
    const outcome = await requestInstall();
    if (outcome !== "failed") {
      snooze();
      return;
    }
    if (isMobile) {
      setIsInstructionsOpen(true);
      return;
    }
    void navigate(routes.pwaPrompt);
  }

  // Snoozing on close keeps the nudge (and with it this component, which owns
  // the modal) mounted for as long as the steps are on screen. Someone who has
  // read the steps has had their answer either way.
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
  // who it is talking to. The consent banner is also a fixed bottom decision,
  // and on a phone it fills most of the screen, so the nudge waits its turn
  // until the visitor has chosen (the same idiom as PwaUpdatePrompt).
  const shouldShow =
    loggedIn &&
    !isInstalled &&
    isRevealed &&
    consentStatus !== "unknown" &&
    (canInstall || isIosBrowserTab);

  // The modal sits outside the nudge's own presence: a failed one-tap install
  // clears the browser's offer, which hides the nudge in the same moment the
  // steps open. AnimatePresence lets each play its exit (see useModalExit).
  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <m.aside
            key="install-nudge"
            ref={nudgeRef}
            className={styles.nudge}
            aria-labelledby={titleId}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.icon}>
              <FiPlusSquare aria-hidden />
            </span>
            <div className={styles.body}>
              <p id={titleId} className={styles.title}>
                {t("system:pwaInstall.nudge.title")}
              </p>
              <p className={styles.text}>
                {t(
                  isIosBrowserTab
                    ? "system:pwaInstall.nudge.bodyIos"
                    : "system:pwaInstall.nudge.body",
                )}
              </p>
              <InstallNudgeActions
                canInstall={canInstall}
                isMobile={isMobile}
                onInstall={() => void installNow()}
                onShowSteps={() => setIsInstructionsOpen(true)}
                onSnooze={snooze}
              />
            </div>
          </m.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isInstructionsOpen && <InstallAppModal onClose={closeInstructions} />}
      </AnimatePresence>
    </>
  );
}
