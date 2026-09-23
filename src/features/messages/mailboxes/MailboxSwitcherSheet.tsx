import { useId } from "react";
import { FiCheck, FiSettings } from "react-icons/fi";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { Avatar, ModalSheet } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  MAILBOX_KIND_LABEL_KEYS,
  mailboxDisplayName,
  mailboxInitials,
} from "./mailboxLabels";
import styles from "./MailboxSwitcher.module.css";

function MailboxSwitcherRow({
  mailbox,
  isActive,
  onSelect,
  onOpenSettings,
}: {
  mailbox: MailboxSummary;
  isActive: boolean;
  onSelect: (identityId: string) => void;
  onOpenSettings?: (identityId: string) => void;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const name = mailboxDisplayName(mailbox, t);
  const isProfile = mailbox.kind === "profile";
  const roleKey = mailbox.isOwner
    ? "messages:mailbox.role.owner"
    : "messages:mailbox.role.team";

  return (
    <li className={styles.item}>
      <button
        type="button"
        className={styles.row}
        aria-current={isActive ? "true" : undefined}
        onClick={() => onSelect(mailbox.identityId)}
      >
        <Avatar
          initials={mailboxInitials(name)}
          src={mailbox.avatarUrl ?? undefined}
          size={40}
        />
        <span className={styles.rowText}>
          <span id={nameId} className={styles.rowName}>
            {name}
          </span>
          <span className={styles.rowDetail}>
            <span>{t(MAILBOX_KIND_LABEL_KEYS[mailbox.kind])}</span>
            {!isProfile && <span>{t(roleKey)}</span>}
          </span>
          {(mailbox.isReadOnly || mailbox.unreadCount > 0) && (
            <span className={styles.rowTags}>
              {mailbox.isReadOnly && (
                <span className={styles.readOnlyTag}>
                  {t("messages:mailbox.readOnly.tag")}
                </span>
              )}
              {mailbox.unreadCount > 0 && (
                <span className={styles.unreadCount}>
                  {t("messages:mailbox.switcher.unreadCount", {
                    count: mailbox.unreadCount,
                  })}
                </span>
              )}
            </span>
          )}
        </span>
        {isActive && (
          <span className={styles.current}>
            <FiCheck aria-hidden />
            <span className="visuallyHidden">
              {t("messages:mailbox.switcher.current")}
            </span>
          </span>
        )}
      </button>
      {onOpenSettings && !isProfile && (
        <button
          type="button"
          className={styles.settingsButton}
          aria-label={t("messages:mailbox.switcher.settings")}
          aria-describedby={nameId}
          title={t("messages:mailbox.switcher.settings")}
          onClick={() => onOpenSettings(mailbox.identityId)}
        >
          <FiSettings aria-hidden />
        </button>
      )}
    </li>
  );
}

/** The sheet listing every mailbox the member answers for, profile first. */
export function MailboxSwitcherSheet({
  mailboxes,
  activeIdentityId,
  onSelect,
  onOpenSettings,
  onClose,
}: {
  mailboxes: MailboxSummary[];
  activeIdentityId: string;
  onSelect: (identityId: string) => void;
  onOpenSettings?: (identityId: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("messages:mailbox.switcher.title")}
    >
      <h2 className={styles.title}>{t("messages:mailbox.switcher.title")}</h2>
      <ul className={styles.list}>
        {mailboxes.map((mailbox) => (
          <MailboxSwitcherRow
            key={mailbox.identityId}
            mailbox={mailbox}
            isActive={mailbox.identityId === activeIdentityId}
            onSelect={onSelect}
            onOpenSettings={onOpenSettings}
          />
        ))}
      </ul>
    </ModalSheet>
  );
}
