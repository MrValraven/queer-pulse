import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import type {
  PlatformSettingsDTO,
  UpdatePlatformSettingsInput,
} from "./api/platformSettings.api";
import styles from "./AdminSettingsPage.module.css";

/**
 * The sitewide announcement banner (ADM-25) — an informational notice shown
 * to every visitor, signed in or not, independent of the kill switches in
 * the other cards on this tab. Its own card (rather than folded into
 * `AdminSettingsAccessCards`) so that component stays under the 200-line
 * limit.
 *
 * The message textarea commits on blur, matching the other message fields on
 * this page. The expiry input is a plain `datetime-local`, converted to/from
 * ISO 8601 at the boundary (the DTO field is ISO, matching
 * `PlatformSettings.announcementExpiresAt`'s `timestamptz` column) — it also
 * commits on blur so a member browsing while an admin is mid-edit never sees
 * a half-typed date sent as a change.
 */
export function AdminAnnouncementCard({
  settings,
  save,
  message,
  setMessage,
  onCommitMessage,
  expiresAt,
  setExpiresAt,
  onCommitExpiresAt,
}: {
  settings: PlatformSettingsDTO;
  save: (input: UpdatePlatformSettingsInput) => void;
  message: string;
  setMessage: (next: string) => void;
  onCommitMessage: () => void;
  /** `datetime-local` value (local time, no timezone), never ISO. */
  expiresAt: string;
  setExpiresAt: (next: string) => void;
  onCommitExpiresAt: () => void;
}) {
  const { t } = useTranslation();
  const messageFieldId = useId();
  const expiresFieldId = useId();

  return (
    <section className={styles.card}>
      <div className={styles.switchRow}>
        <div className={styles.switchText}>
          <h2>{t("admin:settings.announcement.title")}</h2>
          <p>{t("admin:settings.announcement.sub")}</p>
        </div>
        <AdminToggle
          checked={settings.announcementEnabled}
          label={t("admin:settings.announcement.title")}
          onChange={(next) => save({ announcementEnabled: next })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={messageFieldId}>
          {t("admin:settings.announcement.message.label")}
        </label>
        <textarea
          id={messageFieldId}
          className={styles.textarea}
          value={message}
          placeholder={t("admin:settings.announcement.message.placeholder")}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={onCommitMessage}
          rows={2}
        />
        <p className={styles.fieldHint}>
          {t("admin:settings.announcement.message.hint")}
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={expiresFieldId}>
          {t("admin:settings.announcement.expiresAt.label")}
        </label>
        <input
          id={expiresFieldId}
          type="datetime-local"
          className={[styles.textarea, styles.dateInput].join(" ")}
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          onBlur={onCommitExpiresAt}
        />
        <p className={styles.fieldHint}>
          {t("admin:settings.announcement.expiresAt.hint")}
        </p>
      </div>
    </section>
  );
}
