import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./NewMessageModal.module.css";

interface GroupAvatarFieldProps {
  /**
   * The group's currently-saved photo as a resolved, fetchable URL (what the
   * server sends back on the conversation DTO) — shown as the fallback until
   * the owner/admin picks a new one. `undefined` → the initials placeholder.
   */
  currentAvatarUrl?: string;
  /** The group name, used as the placeholder label on the empty slot. */
  groupName: string;
  /**
   * Called with the value to persist under `avatarUrl` whenever the owner/admin
   * picks a new photo (the storage key) or removes it (`""`). Not called until
   * the member actually changes the photo, so an untouched panel saves nothing.
   */
  onChange: (avatarUrl: string) => void;
}

/**
 * The group photo editor in the group info/rename panel (feature #17). Composes
 * the repo's existing {@link ImageUploadField} — the same presign→upload→key
 * pipeline used for profile and subprofile avatars — so a group owner/admin
 * picks a file, sees an instant preview + uploading/error states, and the
 * persistable storage key flows up via `onChange`. Rendering is gated by the
 * caller on the server-authoritative `canRename` flag; the PATCH is re-checked
 * for owner/admin server-side. In demo mode the underlying `useUploadImage`
 * hook stays local (object URL, no network), mirroring the other demo editors.
 */
export function GroupAvatarField({
  currentAvatarUrl,
  groupName,
  onChange,
}: GroupAvatarFieldProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.avatarField}>
      <span className={styles.avatarFieldLabel}>
        {t("messages:group.avatarLabel")}
      </span>
      <ImageUploadField
        value={currentAvatarUrl ?? ""}
        onChange={onChange}
        kind="group-avatar"
        circle
        size={88}
        placeholder={groupName}
      />
    </div>
  );
}
