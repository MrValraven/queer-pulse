import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mailboxDisplayName, mailboxInitials } from "./mailboxLabels";
import { MailboxSwitcherSheet } from "./MailboxSwitcherSheet";
import styles from "./MailboxSwitcher.module.css";

/**
 * The header control that names the active mailbox and opens the sheet of
 * every mailbox the member answers for. It sits in the header lead after the
 * wordmark link, as its own button. A member with one mailbox sees nothing.
 *
 * On mobile the trigger shows the mailbox's initials in place of its name,
 * so the wordmark and the compose buttons keep their room.
 *
 * The accent dot tells a sighted member that another mailbox has unread
 * threads; the button's label says the same to a screen reader.
 */
export function MailboxSwitcher({
  mailboxes,
  active,
  onSelect,
  onOpenSettings,
}: {
  mailboxes: MailboxSummary[];
  active: MailboxSummary | null;
  onSelect: (identityId: string) => void;
  /** Opens the settings of a business, persona or company mailbox. */
  onOpenSettings?: (identityId: string) => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Focus goes back to the trigger once the sheet has unmounted, whichever
  // way it closed (a choice, Escape, the scrim or the close button).
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  if (!active || mailboxes.length < 2) return null;

  const activeName = mailboxDisplayName(active, t);
  const hasUnreadElsewhere = mailboxes.some(
    (mailbox) =>
      mailbox.identityId !== active.identityId && mailbox.unreadCount > 0,
  );
  const buttonLabel = t(
    hasUnreadElsewhere
      ? "messages:mailbox.switcher.buttonAriaWithUnread"
      : "messages:mailbox.switcher.buttonAria",
    { name: activeName },
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={buttonLabel}
        onClick={() => setIsOpen(true)}
      >
        <span className={styles.triggerName}>{activeName}</span>
        <span className={styles.triggerInitials}>
          {mailboxInitials(activeName)}
        </span>
        {hasUnreadElsewhere && (
          <span className={styles.unreadDot} aria-hidden />
        )}
        <FiChevronDown className={styles.triggerChevron} aria-hidden />
      </button>
      {isOpen && (
        <MailboxSwitcherSheet
          mailboxes={mailboxes}
          activeIdentityId={active.identityId}
          onSelect={(identityId) => {
            setIsOpen(false);
            if (identityId !== active.identityId) onSelect(identityId);
          }}
          onOpenSettings={
            onOpenSettings
              ? (identityId) => {
                  setIsOpen(false);
                  onOpenSettings(identityId);
                }
              : undefined
          }
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
