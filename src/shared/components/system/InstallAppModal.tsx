import { useState } from "react";
import { FiLink } from "react-icons/fi";
import { Modal, Button, Collapse } from "../ui";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { useToast } from "../feedback/useToast";
import {
  detectInAppBrowser,
  detectPlatform,
  getInstallStepKeys,
  useInstallPrompt,
  INSTALL_INSTRUCTIONS,
} from "../../hooks";
import styles from "./InstallAppModal.module.css";

/**
 * Copies the current page's address so a member stuck in a social app's
 * built-in browser can paste it into Safari or Chrome. Each failure names its
 * cause: some in-app browsers expose no clipboard at all, and others expose it
 * and then refuse the write.
 */
function useCopyPageLink(): () => Promise<void> {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return async function copyPageLink() {
    if (typeof navigator.clipboard?.writeText !== "function") {
      showToast(t("shared:installAppModal.copyLinkUnsupported"), "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t("shared:installAppModal.linkCopied"), "success");
    } catch {
      showToast(t("shared:installAppModal.copyLinkBlocked"), "error");
    }
  };
}

/**
 * Compact "Install the app" modal, opened from the mobile account sheet, the
 * install nudge and the homepage. Shows the steps for the visitor's own device
 * alone, since a phone only needs its own instructions (PwaPromptPage carries
 * the platform tabs). Once the browser has offered `beforeinstallprompt`, a real
 * Install button triggers that native dialog directly; iOS (and Android before
 * the event fires) gets the manual steps only.
 *
 * Inside a social app's built-in browser (Instagram, Facebook, TikTok and the
 * like) nothing can be installed, so the list opens with a step that moves the
 * page into the phone's own browser, and the footer offers to copy the link.
 */
export function InstallAppModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { canInstall, requestInstall } = useInstallPrompt();
  // Set when the browser had an install offer and then failed to open its
  // dialog; the manual steps below are the way forward from there.
  const [hasInstallFailed, setHasInstallFailed] = useState(false);
  const copyPageLink = useCopyPageLink();
  const platform = detectPlatform();
  const isInAppBrowser = detectInAppBrowser() && platform !== "desktop";
  const { titleKey } = INSTALL_INSTRUCTIONS[platform];
  const stepKeys = getInstallStepKeys(platform, isInAppBrowser);

  // Accepted closes the modal. Dismissed leaves it as it is: the member has
  // just said no to the browser's own dialog. Failed hides the Install button
  // and names why, with the manual steps still on screen.
  async function install() {
    const outcome = await requestInstall();
    if (outcome === "accepted") onClose();
    else if (outcome === "failed") setHasInstallFailed(true);
  }

  function renderFooter() {
    if (canInstall && !hasInstallFailed) {
      return (
        <Button onClick={() => void install()} className={styles.footerButton}>
          {t("system:pwaPrompt.installCta")}
        </Button>
      );
    }
    if (isInAppBrowser) {
      return (
        <Button
          variant="ghost"
          onClick={() => void copyPageLink()}
          className={styles.footerButton}
        >
          <FiLink aria-hidden />
          {t("shared:installAppModal.copyLink")}
        </Button>
      );
    }
    return undefined;
  }

  return (
    <Modal
      title={t("shared:installAppModal.title")}
      sub={t("shared:installAppModal.sub")}
      onClose={onClose}
      footer={renderFooter()}
    >
      <Collapse isOpen={hasInstallFailed}>
        <p className={styles.note}>
          {t("shared:installAppModal.installFailed")}
        </p>
      </Collapse>
      {isInAppBrowser && (
        <p className={styles.note}>{t("shared:installAppModal.inAppNote")}</p>
      )}
      <div className={styles.howto}>
        <h4 className={styles.howtoTitle}>{t(titleKey)}</h4>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style none drops the list role in Safari */}
        <ol className={styles.steps} role="list">
          {stepKeys.map((stepKey, stepIndex) => (
            <li key={stepKey} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden>
                {stepIndex + 1}
              </span>
              <span>
                <Translation
                  i18nKey={stepKey}
                  components={{ b: <b />, em: <em /> }}
                />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
