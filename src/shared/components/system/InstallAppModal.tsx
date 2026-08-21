import { Modal, Button } from "../ui";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { useToast } from "../feedback/useToast";
import {
  detectPlatform,
  useInstallPrompt,
  INSTALL_INSTRUCTIONS,
} from "../../hooks";
import styles from "./InstallAppModal.module.css";

/**
 * Compact "Install the app" modal, opened from the account menu (mobile only —
 * see accountMenu.data.ts). Shows steps for the visitor's own device rather
 * than platform tabs like PwaPromptPage, since a phone only needs its own
 * instructions. On Android, once the browser has offered `beforeinstallprompt`,
 * a real Install button triggers that native dialog directly; iOS (and Android
 * before the event fires) falls back to the manual steps only.
 */
export function InstallAppModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { canInstall, promptInstall } = useInstallPrompt();
  const platform = detectPlatform();
  const { titleKey, stepKeys } = INSTALL_INSTRUCTIONS[platform];

  async function install() {
    const accepted = await promptInstall();
    if (accepted) {
      onClose();
      return;
    }
    showToast(t("system:pwaPrompt.toast.installHint"), "info");
  }

  return (
    <Modal
      title={t("shared:installAppModal.title")}
      sub={t("shared:installAppModal.sub")}
      onClose={onClose}
      footer={
        canInstall ? (
          <Button onClick={() => void install()} className={styles.installBtn}>
            {t("system:pwaPrompt.installCta")}
          </Button>
        ) : undefined
      }
    >
      <div className={styles.howto}>
        <h4 className={styles.howtoTitle}>{t(titleKey)}</h4>
        {stepKeys.map((stepKey, i) => (
          <div key={stepKey} className={styles.step}>
            <span className={styles.stepN}>{i + 1}</span>
            <span>
              <Translation
                i18nKey={stepKey}
                components={{ b: <b />, em: <em /> }}
              />
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
