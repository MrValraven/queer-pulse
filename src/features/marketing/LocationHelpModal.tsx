import { FiLock } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { detectPlatform } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LOCATION_HELP_BROWSER_STEPS,
  LOCATION_HELP_SYSTEM_KEYS,
  type LocationHelpBrowser,
  type LocationHelpSystem,
} from "./locationHelp.data";
import styles from "./LocationHelpModal.module.css";

/**
 * Which browser's steps to show. Only picks copy, never gates behaviour: a
 * wrong guess costs the member some wrong menu names, and the device-wide line
 * below the steps still points somewhere real.
 */
function detectLocationHelpBrowser(): LocationHelpBrowser {
  const platform = detectPlatform();
  if (platform === "ios" || platform === "android") return platform;
  if (typeof navigator === "undefined") return "other";
  const userAgent = navigator.userAgent;
  if (/Firefox\//.test(userAgent)) return "firefox";
  // Edge, Brave, Opera and Arc all report Chrome and share its site controls.
  if (/Chrome\/|Chromium\//.test(userAgent)) return "chromium";
  if (/Safari\//.test(userAgent) && /Macintosh/.test(userAgent)) {
    return "safari";
  }
  return "other";
}

function detectLocationHelpSystem(): LocationHelpSystem {
  const platform = detectPlatform();
  if (platform === "ios" || platform === "android") return platform;
  if (typeof navigator === "undefined") return "other";
  if (/Macintosh/.test(navigator.userAgent)) return "mac";
  if (/Windows/.test(navigator.userAgent)) return "windows";
  return "other";
}

const STEP_TAGS = { b: <b /> };

/**
 * Where the location setting lives, for a member whose browser has this site
 * blocked.
 *
 * A page cannot flip that setting for them, so the useful thing it can do is
 * point at the exact switch: steps for the browser they are in, then the
 * device-wide switch that refuses location in exactly the same way while the
 * site setting reads "allowed". "Try again" asks once more. `useMyLocation`
 * also notices by itself when the setting changes, so coming back is enough.
 */
export function LocationHelpModal({
  onClose,
  onTryAgain,
}: {
  onClose: () => void;
  onTryAgain: () => void;
}) {
  const { t } = useTranslation();
  const { titleKey, stepKeys } =
    LOCATION_HELP_BROWSER_STEPS[detectLocationHelpBrowser()];
  const systemKey = LOCATION_HELP_SYSTEM_KEYS[detectLocationHelpSystem()];

  return (
    <Modal
      title={t("marketing:local.nearMe.help.title")}
      sub={t("marketing:local.nearMe.help.sub")}
      onClose={onClose}
      footer={
        <Button onClick={onTryAgain} className={styles.tryAgain}>
          {t("marketing:local.nearMe.help.tryAgain")}
        </Button>
      }
    >
      <div className={styles.howto}>
        <h4 className={styles.sectionTitle}>{t(titleKey)}</h4>
        <ol className={styles.steps}>
          {stepKeys.map((stepKey, index) => (
            <li key={stepKey} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden>
                {index + 1}
              </span>
              <span>
                <Translation i18nKey={stepKey} components={STEP_TAGS} />
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.system}>
        <h4 className={styles.sectionTitle}>
          {t("marketing:local.nearMe.help.systemTitle")}
        </h4>
        <p className={styles.systemBody}>
          <Translation i18nKey={systemKey} components={STEP_TAGS} />
        </p>
      </div>
      <p className={styles.privacy}>
        <FiLock aria-hidden />
        {t("marketing:local.nearMe.privacy")}
      </p>
    </Modal>
  );
}
