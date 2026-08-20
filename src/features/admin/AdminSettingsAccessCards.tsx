import { useId, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminCheckLine, AdminToggle } from "./ui";
import type {
  PlatformSettingsDTO,
  UpdatePlatformSettingsInput,
} from "./api/platformSettings.api";
import {
  CLOSED_PRESETS,
  LOCKDOWN_PRESETS,
  type MessagePreset,
} from "./adminSettings.data";
import { datetimeLocalValueToIso } from "./adminDateTimeLocal";
import { AdminAnnouncementCard } from "./AdminAnnouncementCard";
import { AdminSettingsConfirm } from "./AdminSettingsConfirm";
import styles from "./AdminSettingsPage.module.css";

/**
 * A message textarea with its preset row. Selecting a preset FILLS the box and
 * nothing more — it never saves on its own, and the text stays fully editable,
 * so a preset is a starting point rather than a value the admin is locked into.
 */
function MessageField({
  label,
  placeholder,
  value,
  presets,
  onChange,
  onCommit,
}: {
  label: string;
  placeholder: string;
  value: string;
  presets: MessagePreset[];
  onChange: (next: string) => void;
  onCommit: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.presetRow}>
        <span className={styles.presetHint}>
          {t("admin:settings.presets.label")}
        </span>
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.presetBtn}
            onClick={() => onChange(t(p.bodyKey))}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>
      <textarea
        id={fieldId}
        className={styles.textarea}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        rows={3}
      />
      <p className={styles.fieldHint}>{t("admin:settings.presets.hint")}</p>
    </div>
  );
}

/**
 * The presentational body of {@link AdminSettingsAccess}: the two kill-switch
 * cards plus the lockdown confirmation modal. All state lives in the container;
 * this component only renders it and forwards edits back up through `save`.
 */
export function AdminSettingsAccessCards({
  settings,
  save,
  closedMessage,
  setClosedMessage,
  lockdownMessage,
  setLockdownMessage,
  announcementMessage,
  setAnnouncementMessage,
  announcementExpiresAt,
  setAnnouncementExpiresAt,
  note,
  setNote,
  confirming,
  setConfirming,
}: {
  settings: PlatformSettingsDTO;
  save: (input: UpdatePlatformSettingsInput) => void;
  closedMessage: string;
  setClosedMessage: Dispatch<SetStateAction<string>>;
  lockdownMessage: string;
  setLockdownMessage: Dispatch<SetStateAction<string>>;
  announcementMessage: string;
  setAnnouncementMessage: Dispatch<SetStateAction<string>>;
  /** `datetime-local` value, never ISO — see `adminDateTimeLocal.ts`. */
  announcementExpiresAt: string;
  setAnnouncementExpiresAt: Dispatch<SetStateAction<string>>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  confirming: "enable" | "disable" | null;
  setConfirming: Dispatch<SetStateAction<"enable" | "disable" | null>>;
}) {
  const { t } = useTranslation();
  const noteFieldId = useId();
  return (
    <div className={styles.access}>
      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={noteFieldId}>
            {t("admin:settings.note.label")}
          </label>
          <textarea
            id={noteFieldId}
            className={styles.textarea}
            value={note}
            placeholder={t("admin:settings.note.placeholder")}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <p className={styles.fieldHint}>{t("admin:settings.note.hint")}</p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <h2>{t("admin:settings.registration.title")}</h2>
            <p>{t("admin:settings.registration.sub")}</p>
          </div>
          <AdminToggle
            checked={settings.registrationEnabled}
            label={t("admin:settings.registration.title")}
            onChange={(next) => save({ registrationEnabled: next })}
          />
        </div>

        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <h2>{t("admin:settings.joinRequests.title")}</h2>
            <p>{t("admin:settings.joinRequests.sub")}</p>
          </div>
          <AdminToggle
            checked={settings.joinRequestsEnabled}
            label={t("admin:settings.joinRequests.title")}
            onChange={(next) => save({ joinRequestsEnabled: next })}
          />
        </div>

        <MessageField
          label={t("admin:settings.closedMessage.label")}
          placeholder={t("admin:settings.closedMessage.placeholder")}
          value={closedMessage}
          presets={CLOSED_PRESETS}
          onChange={setClosedMessage}
          onCommit={() => {
            if (closedMessage === (settings.registrationClosedMessage ?? ""))
              return;
            save({ registrationClosedMessage: closedMessage || null });
          }}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <h2>{t("admin:settings.lockdown.title")}</h2>
            <p>{t("admin:settings.lockdown.sub")}</p>
          </div>
          <AdminToggle
            checked={settings.lockdownEnabled}
            label={t("admin:settings.lockdown.title")}
            onChange={(next) => setConfirming(next ? "enable" : "disable")}
          />
        </div>

        <AdminCheckLine
          checked={settings.lockdownAllowsModerators}
          onChange={(next) => save({ lockdownAllowsModerators: next })}
          title={t("admin:settings.lockdown.allowMods")}
          sub={t("admin:settings.lockdown.allowModsSub")}
        />

        <MessageField
          label={t("admin:settings.lockdown.message.label")}
          placeholder={t("admin:settings.lockdown.message.placeholder")}
          value={lockdownMessage}
          presets={LOCKDOWN_PRESETS}
          onChange={setLockdownMessage}
          onCommit={() => {
            if (lockdownMessage === (settings.lockdownMessage ?? "")) return;
            save({ lockdownMessage: lockdownMessage || null });
          }}
        />
      </section>

      <AdminAnnouncementCard
        settings={settings}
        save={save}
        message={announcementMessage}
        setMessage={setAnnouncementMessage}
        onCommitMessage={() => {
          if (announcementMessage === (settings.announcementMessage ?? ""))
            return;
          save({ announcementMessage: announcementMessage || null });
        }}
        expiresAt={announcementExpiresAt}
        setExpiresAt={setAnnouncementExpiresAt}
        onCommitExpiresAt={() => {
          const nextIso = datetimeLocalValueToIso(announcementExpiresAt);
          if (nextIso === (settings.announcementExpiresAt ?? null)) return;
          save({ announcementExpiresAt: nextIso });
        }}
      />

      {confirming && (
        <AdminSettingsConfirm
          mode={confirming}
          message={lockdownMessage || t("system:maintenance.body")}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const enabling = confirming === "enable";
            setConfirming(null);
            // Commit any unsaved message edit in the same request, so the
            // message the admin just reviewed in the modal is the one members
            // actually see.
            save({
              lockdownEnabled: enabling,
              ...(enabling &&
              lockdownMessage !== (settings.lockdownMessage ?? "")
                ? { lockdownMessage: lockdownMessage || null }
                : {}),
            });
          }}
        />
      )}
    </div>
  );
}
