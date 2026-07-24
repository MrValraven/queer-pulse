import { FiX } from "react-icons/fi";
import type { SocialLinkDTO } from "../members/api/members.api";
import { Avatar, Button } from "../../shared/components/ui";
import { initialsOf } from "../../shared/api/refs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminBotEditor.module.css";

export interface BotFormState {
  firstName: string;
  lastName: string;
  username: string;
  pronouns: string;
  tagline: string;
  location: string;
  bio: string;
  /** Storage key from a fresh avatar upload, or null when unchanged. */
  avatarKey: string | null;
  socials: SocialLinkDTO[];
}

interface Props {
  form: BotFormState;
  setForm: (next: (prev: BotFormState) => BotFormState) => void;
  /** Instantly-previewable avatar URL, if the admin just picked one. */
  avatarPreview: string | null;
  uploading: boolean;
  onPickAvatar: (file: File) => void;
  usernameError: string | null;
}

/** One labelled single-line text field, bound to a `BotFormState` key. */
function TextRow({
  labelKey,
  value,
  onChange,
  error,
}: {
  labelKey: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <label className={styles.row}>
      <span className={styles.label}>{t(labelKey)}</span>
      <input
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

/**
 * Pure form fields for the bot editor — no data fetching, so the drawer that
 * hosts it stays under the 200-line component limit.
 */
export function AdminBotEditorFields({
  form,
  setForm,
  avatarPreview,
  uploading,
  onPickAvatar,
  usernameError,
}: Props) {
  const { t } = useTranslation();

  function set<Key extends keyof BotFormState>(
    key: Key,
    value: BotFormState[Key],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function setSocial(index: number, patch: Partial<SocialLinkDTO>) {
    setForm((previous) => ({
      ...previous,
      socials: previous.socials.map((social, socialIndex) =>
        socialIndex === index ? { ...social, ...patch } : social,
      ),
    }));
  }

  function removeSocial(index: number) {
    setForm((previous) => ({
      ...previous,
      socials: previous.socials.filter(
        (_social, socialIndex) => socialIndex !== index,
      ),
    }));
  }

  function addSocial() {
    setForm((previous) => ({
      ...previous,
      socials: [...previous.socials, { platform: "", urlOrHandle: "" }],
    }));
  }

  const displayName = `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className={styles.form}>
      <div className={styles.avatarRow}>
        <Avatar
          size={56}
          src={avatarPreview ?? undefined}
          initials={initialsOf(form.firstName, form.lastName)}
          alt={displayName || t("admin:bots.field.avatar")}
        />
        <label className={styles.avatarPicker}>
          {uploading
            ? t("admin:bots.avatar.uploading")
            : t("admin:bots.avatar.change")}
          <input
            type="file"
            accept="image/*"
            className={styles.avatarInput}
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onPickAvatar(file);
            }}
            aria-label={t("admin:bots.field.avatar")}
          />
        </label>
      </div>

      <TextRow
        labelKey="admin:bots.field.firstName"
        value={form.firstName}
        onChange={(value) => set("firstName", value)}
      />
      <TextRow
        labelKey="admin:bots.field.lastName"
        value={form.lastName}
        onChange={(value) => set("lastName", value)}
      />
      <TextRow
        labelKey="admin:bots.field.username"
        value={form.username}
        onChange={(value) => set("username", value)}
        error={usernameError}
      />
      <TextRow
        labelKey="admin:bots.field.pronouns"
        value={form.pronouns}
        onChange={(value) => set("pronouns", value)}
      />
      <TextRow
        labelKey="admin:bots.field.tagline"
        value={form.tagline}
        onChange={(value) => set("tagline", value)}
      />
      <TextRow
        labelKey="admin:bots.field.location"
        value={form.location}
        onChange={(value) => set("location", value)}
      />

      <label className={styles.row}>
        <span className={styles.label}>{t("admin:bots.field.bio")}</span>
        <textarea
          className={styles.textarea}
          value={form.bio}
          onChange={(event) => set("bio", event.target.value)}
        />
      </label>

      <div className={styles.row}>
        <span className={styles.label}>{t("admin:bots.field.socials")}</span>
        {form.socials.map((social, index) => (
          <div className={styles.socialRow} key={index}>
            <input
              className={styles.input}
              value={social.platform}
              placeholder={t("admin:bots.socials.platform")}
              aria-label={t("admin:bots.socials.platform")}
              onChange={(event) =>
                setSocial(index, { platform: event.target.value })
              }
            />
            <input
              className={styles.input}
              value={social.urlOrHandle}
              placeholder={t("admin:bots.socials.handle")}
              aria-label={t("admin:bots.socials.handle")}
              onChange={(event) =>
                setSocial(index, { urlOrHandle: event.target.value })
              }
            />
            <button
              type="button"
              className={styles.rowRemove}
              aria-label={t("admin:bots.socials.remove")}
              onClick={() => removeSocial(index)}
            >
              <FiX size={15} />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="md" onClick={addSocial}>
          {t("admin:bots.socials.add")}
        </Button>
      </div>
    </div>
  );
}
