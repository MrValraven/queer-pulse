import { useId, useState } from "react";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { LoadErrorState, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMailboxAttribution } from "../api/useMailboxAttribution";
import { mailboxDisplayName } from "./mailboxLabels";
import styles from "./MailboxSettingsPanel.module.css";

/**
 * One switch with its title, help line and, when locked, the reason. The
 * lock is a disabled fieldset around the shared `Toggle`, so the switch is
 * natively disabled: it leaves the tab order and reads as dimmed. While its
 * own change saves, the switch ignores presses and keeps focus.
 */
function MailboxSettingRow({
  title,
  description,
  isChecked,
  isLocked,
  isSaving,
  lockedNote,
  onChange,
}: {
  title: string;
  description: string;
  isChecked: boolean;
  isLocked: boolean;
  isSaving: boolean;
  lockedNote?: string;
  onChange: (value: boolean) => void;
}) {
  const noteId = useId();
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <div className={styles.rowTitle}>{title}</div>
        <div className={styles.rowDescription}>{description}</div>
        {isLocked && lockedNote && (
          <div id={noteId} className={styles.rowNote}>
            {lockedNote}
          </div>
        )}
      </div>
      <fieldset
        className={styles.control}
        disabled={isLocked}
        aria-busy={isSaving || undefined}
        aria-describedby={isLocked && lockedNote ? noteId : undefined}
      >
        <Toggle
          tone="coral"
          checked={isChecked}
          onChange={(value) => {
            if (!isSaving) onChange(value);
          }}
          label={title}
        />
      </fieldset>
    </div>
  );
}

/**
 * A business, persona or company mailbox's attribution settings, shown inside
 * the switcher sheet in place of the mailbox list. The sheet owns the heading
 * and the way back. The owner decides whether customers see the first name of
 * whoever replied ("Ana from Café Lisboa"); each staff member may keep their
 * own name out. Only the owner's switch is owner-only, and an ownerless
 * listing keeps it locked for everyone. A persona moderation removed shows
 * both switches locked. The help line's example is signed with the member's
 * own first name when the sheet knows it.
 */
export function MailboxSettingsPanel({
  mailbox,
  memberFirstName,
}: {
  mailbox: MailboxSummary;
  memberFirstName?: string;
}) {
  const { t } = useTranslation();
  const name = mailboxDisplayName(mailbox, t);
  const {
    attribution,
    isError,
    refetch,
    setShowStaffNames,
    setAllowMyName,
    isSaving,
  } = useMailboxAttribution(mailbox);
  const isReadOnly = mailbox.isReadOnly;
  // `isSaving` follows the latest write, so it belongs to the switch
  // pressed last.
  const [savingSwitch, setSavingSwitch] = useState<
    "showStaffNames" | "allowMyName" | null
  >(null);

  return (
    <>
      {isError && !attribution && (
        <LoadErrorState
          compact
          description={t("messages:mailbox.settings.loadError")}
          onRetry={() => void refetch()}
        />
      )}
      {attribution && (
        <>
          {isReadOnly && (
            <p className={styles.readOnlyNote}>
              {t("messages:mailbox.settings.readOnly", { name })}
            </p>
          )}
          <div className={styles.list}>
            <MailboxSettingRow
              title={t("messages:mailbox.settings.showStaffNames")}
              description={t("messages:mailbox.settings.showStaffNamesHelp", {
                name,
                firstName:
                  memberFirstName ||
                  t("messages:mailbox.settings.exampleFirstName"),
              })}
              isChecked={attribution.shouldShowStaffNames}
              isLocked={isReadOnly || !attribution.isOwner}
              isSaving={isSaving && savingSwitch === "showStaffNames"}
              lockedNote={
                isReadOnly
                  ? undefined
                  : t("messages:mailbox.settings.ownerOnly")
              }
              onChange={(value) => {
                setSavingSwitch("showStaffNames");
                setShowStaffNames(value);
              }}
            />
            <MailboxSettingRow
              title={t("messages:mailbox.settings.allowMyName")}
              description={t("messages:mailbox.settings.allowMyNameHelp")}
              isChecked={attribution.shouldAllowMyName}
              isLocked={isReadOnly}
              isSaving={isSaving && savingSwitch === "allowMyName"}
              onChange={(value) => {
                setSavingSwitch("allowMyName");
                setAllowMyName(value);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
