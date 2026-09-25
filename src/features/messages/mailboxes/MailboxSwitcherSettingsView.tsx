import { useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mailboxDisplayName } from "./mailboxLabels";
import { MailboxSettingsPanel } from "./MailboxSettingsPanel";
import styles from "./MailboxSwitcher.module.css";

/**
 * The switcher sheet's settings view: a back button and the mailbox's
 * heading above its attribution settings. Focus lands on the back button
 * when the view opens, so a keyboard member can return in one press.
 */
export function MailboxSwitcherSettingsView({
  mailbox,
  memberFirstName,
  onBack,
}: {
  mailbox: MailboxSummary;
  memberFirstName?: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const backLabel = t("messages:mailbox.switcher.back");

  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  return (
    <div className={styles.view}>
      <div className={styles.settingsHead}>
        <button
          ref={backButtonRef}
          type="button"
          className={styles.backButton}
          aria-label={backLabel}
          title={backLabel}
          onClick={onBack}
        >
          <FiArrowLeft aria-hidden />
        </button>
        <h2 className={styles.title}>
          {t("messages:mailbox.settings.title", {
            name: mailboxDisplayName(mailbox, t),
          })}
        </h2>
      </div>
      <MailboxSettingsPanel
        mailbox={mailbox}
        memberFirstName={memberFirstName}
      />
    </div>
  );
}
