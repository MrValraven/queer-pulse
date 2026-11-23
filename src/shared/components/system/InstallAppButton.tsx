import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiDownload } from "react-icons/fi";
import { useDisplayMode } from "../../../app/providers/displayModeContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { detectPlatform, useInstallPrompt } from "../../hooks";
import { useTranslation } from "../../i18n/useTranslation";
import { Button, type ButtonSize, type ButtonVariant } from "../ui/Button";
import { InstallAppModal } from "./InstallAppModal";

/** Shared-namespace copy, so the button reads right on any route. */
const DEFAULT_LABEL_KEY = "shared:installAppModal.title";

export interface InstallAppButtonProps {
  /** Catalog key for the label. Defaults to the shared "Install the app". */
  labelKey?: string;
  /** Show only on iOS and Android, where installing is one or two taps away. */
  isMobileDeviceOnly?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Lands on the animated wrapper, so the caller owns the row's layout. */
  className?: string;
}

/**
 * The quickest install the browser allows, from one button.
 *
 * Chromium on Android hands over `beforeinstallprompt`, so the tap opens the
 * native install dialog directly. Everywhere else (iOS Safari, Android before
 * the event has fired, or a native prompt that failed to open) the tap opens
 * `InstallAppModal` with the steps for this device. The button stays out of
 * the way once the app is installed.
 */
export function InstallAppButton({
  labelKey = DEFAULT_LABEL_KEY,
  isMobileDeviceOnly = true,
  variant = "quiet",
  size = "md",
  className,
}: InstallAppButtonProps) {
  const { t } = useTranslation();
  const { isInstalled } = useDisplayMode();
  const { canInstall, requestInstall } = useInstallPrompt();
  const { reducedMotion } = useMotionPrefs();
  // The user agent does not change during a visit, so it is read once.
  const [isMobileDevice] = useState(() => detectPlatform() !== "desktop");
  const [hasAcceptedInstall, setHasAcceptedInstall] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const isVisible =
    !isInstalled &&
    !hasAcceptedInstall &&
    (isMobileDevice || !isMobileDeviceOnly);

  // `requestInstall` runs synchronously up to its first await, so the native
  // dialog opens inside this click's user activation. A dismissal leaves the
  // button where it is for a later try; a prompt that never opened falls back
  // to the manual steps.
  async function handleInstallClick() {
    if (!canInstall) {
      setIsInstructionsOpen(true);
      return;
    }
    const outcome = await requestInstall();
    if (outcome === "accepted") setHasAcceptedInstall(true);
    if (outcome === "failed") setIsInstructionsOpen(true);
  }

  return (
    <>
      <AnimatePresence initial={!reducedMotion}>
        {isVisible && (
          <m.div
            key="install-app-button"
            className={className}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 0.68, 0.16, 1] }}
          >
            <Button
              variant={variant}
              size={size}
              aria-haspopup={canInstall ? undefined : "dialog"}
              onClick={() => void handleInstallClick()}
            >
              <FiDownload aria-hidden />
              {t(labelKey)}
            </Button>
          </m.div>
        )}
      </AnimatePresence>
      {/* AnimatePresence lets the modal play its exit (see useModalExit). */}
      <AnimatePresence>
        {isInstructionsOpen && (
          <InstallAppModal onClose={() => setIsInstructionsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
