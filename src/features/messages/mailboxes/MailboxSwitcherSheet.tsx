import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiSettings } from "react-icons/fi";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { useMeasuredContentHeight } from "../../../shared/components/layout/useMeasuredContentHeight";
import { Avatar, ModalSheet } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  MAILBOX_KIND_LABEL_KEYS,
  mailboxDisplayName,
  mailboxInitials,
} from "./mailboxLabels";
import { MailboxSwitcherSettingsView } from "./MailboxSwitcherSettingsView";
import styles from "./MailboxSwitcher.module.css";

function MailboxSwitcherRow({
  mailbox,
  isActive,
  onSelect,
  onShowSettings,
}: {
  mailbox: MailboxSummary;
  isActive: boolean;
  onSelect: (identityId: string) => void;
  onShowSettings: (identityId: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
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
                  <Translation
                    i18nKey="messages:mailbox.switcher.unreadCount"
                    values={{ count: mailbox.unreadCount }}
                    slots={{
                      count: (
                        <RollingNumber
                          value={fmt.number(mailbox.unreadCount)}
                          numericValue={mailbox.unreadCount}
                        />
                      ),
                    }}
                  />
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
      {!isProfile && (
        <button
          type="button"
          className={styles.settingsButton}
          aria-label={t("messages:mailbox.switcher.settings")}
          aria-describedby={nameId}
          title={t("messages:mailbox.switcher.settings")}
          data-identity-id={mailbox.identityId}
          onClick={() => onShowSettings(mailbox.identityId)}
        >
          <FiSettings aria-hidden />
        </button>
      )}
    </li>
  );
}

/**
 * The sheet listing every mailbox the member answers for, profile first. A
 * row's gear swaps the list for that mailbox's settings inside the same
 * sheet; back returns to the list with focus on the gear that opened them.
 */
export function MailboxSwitcherSheet({
  mailboxes,
  activeIdentityId,
  onSelect,
  onClose,
}: {
  mailboxes: MailboxSummary[];
  activeIdentityId: string;
  onSelect: (identityId: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [settingsIdentityId, setSettingsIdentityId] = useState<string | null>(
    null,
  );
  // The list only plays the entrance once it comes back from settings, so
  // the first open rides the sheet's own rise alone.
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  // The frame carries the views' measured height, so swapping between the
  // list and a taller or shorter settings view eases the sheet to its new size.
  const { contentRef, contentHeight, isTransitionEnabled } =
    useMeasuredContentHeight<HTMLDivElement>();
  const returnFocusIdentityIdRef = useRef<string | null>(null);
  const settingsMailbox =
    mailboxes.find(
      (mailbox) =>
        mailbox.identityId === settingsIdentityId && mailbox.kind !== "profile",
    ) ?? null;
  const isSettingsView = settingsMailbox !== null;
  // The member's first name, from their personal mailbox, the same word the
  // server signs their replies with.
  const memberFirstName = mailboxes
    .find((mailbox) => mailbox.kind === "profile")
    ?.displayName?.trim()
    .split(/\s+/)[0];

  // Back to the list: focus the gear that opened the settings.
  useEffect(() => {
    const identityId = returnFocusIdentityIdRef.current;
    if (isSettingsView || !identityId) return;
    returnFocusIdentityIdRef.current = null;
    const gearButtons =
      listRef.current?.querySelectorAll<HTMLElement>("[data-identity-id]") ??
      [];
    Array.from(gearButtons)
      .find((gearButton) => gearButton.dataset.identityId === identityId)
      ?.focus();
  }, [isSettingsView]);

  const listTitle = t("messages:mailbox.switcher.title");
  const sheetLabel = settingsMailbox
    ? t("messages:mailbox.settings.title", {
        name: mailboxDisplayName(settingsMailbox, t),
      })
    : listTitle;

  return (
    <ModalSheet onClose={onClose} ariaLabel={sheetLabel}>
      <div
        className={[
          styles.sizeFrame,
          isTransitionEnabled && styles.sizeFrameSized,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          isTransitionEnabled && contentHeight !== null
            ? { height: contentHeight }
            : undefined
        }
      >
        <div ref={contentRef} className={styles.sizeContent}>
          {settingsMailbox ? (
            <MailboxSwitcherSettingsView
              mailbox={settingsMailbox}
              memberFirstName={memberFirstName}
              onBack={() => {
                returnFocusIdentityIdRef.current = settingsMailbox.identityId;
                setSettingsIdentityId(null);
              }}
            />
          ) : (
            <div className={hasOpenedSettings ? styles.view : undefined}>
              <h2 className={styles.title}>{listTitle}</h2>
              <ul ref={listRef} className={styles.list}>
                {mailboxes.map((mailbox) => (
                  <MailboxSwitcherRow
                    key={mailbox.identityId}
                    mailbox={mailbox}
                    isActive={mailbox.identityId === activeIdentityId}
                    onSelect={onSelect}
                    onShowSettings={(identityId) => {
                      setHasOpenedSettings(true);
                      setSettingsIdentityId(identityId);
                    }}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ModalSheet>
  );
}
