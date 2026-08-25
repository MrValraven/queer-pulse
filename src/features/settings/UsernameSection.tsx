import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { normalizeHandle } from "../../shared/handles";
import { useToast } from "../../shared/components/feedback/useToast";
import { useProfileData } from "../../app/providers/useProfile";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { UsernameField } from "./UsernameField";
import { updateUsername } from "./api/handles.api";
import type { HandleAvailability } from "./api/useHandleAvailability";
import styles from "./EditProfilePage.module.css";

/** Read the server's rejection reason off an ApiError for a 409/422 username save. */
function messageForError(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    const reason = (err.data as { reason?: string } | undefined)?.reason;
    if (err.status === 409 || reason === "taken")
      return t("settings:editProfile.username.error.taken");
    if (reason === "reserved")
      return t("settings:editProfile.username.error.reserved");
    if (err.status === 422 || reason === "invalid")
      return t("settings:editProfile.username.error.invalid");
  }
  return t("settings:editProfile.username.error.generic");
}

/**
 * The mandatory `@username` section of the profile editor. The username is the
 * member's handle in the ONE shared namespace (main profiles + subprofiles), so
 * it's checked for availability live and saved on its own via
 * `PATCH /profiles/me/username` — a distinct, sensitive change (it moves your
 * profile's address, with no redirect from the old one). Save stays blocked
 * until the handle is confirmed available.
 */
export function UsernameSection() {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();

  // The committed username. Baseline for "this is your handle" and the
  // unchanged check; updated locally once a save lands (demo persists nothing).
  const [savedName, setSavedName] = useState(profile.slug);
  const [value, setValue] = useState(profile.slug);
  const [availability, setAvailability] = useState<HandleAvailability>({
    status: "available",
    reason: null,
  });
  const [saving, setSaving] = useState(false);

  const normalized = normalizeHandle(value);
  const unchanged = normalized === normalizeHandle(savedName);
  const canSave =
    !unchanged &&
    normalized.length > 0 &&
    availability.status === "available" &&
    !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await updateUsername(normalized);
      }
      setSavedName(normalized);
      showToast(t("settings:editProfile.username.toast.updated"), "success");
    } catch (err) {
      showToast(messageForError(err, t), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.section} id="username">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.username.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        {t("settings:editProfile.username.sub")}
      </p>

      <UsernameField
        value={value}
        onChange={setValue}
        currentName={savedName}
        label={t("settings:editProfile.username.fieldLabel")}
        hint={t("settings:editProfile.username.fieldHint")}
        onStatusChange={setAvailability}
      />

      <div className={styles.usernameActions}>
        <Button
          variant="primary"
          onClick={() => void save()}
          disabled={!canSave}
        >
          {saving
            ? t("settings:editProfile.username.saving")
            : t("settings:editProfile.username.save")}
        </Button>
        <span className={styles.usernamePreview}>
          <Translation
            i18nKey="settings:editProfile.username.previewPrefix"
            components={{ strong: <strong /> }}
            values={{ handle: normalized || "…" }}
          />
        </span>
      </div>
    </div>
  );
}
