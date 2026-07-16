import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { normalizeHandle } from "../../shared/handles";
import { useToast } from "../../shared/components/feedback/useToast";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { UsernameField } from "./UsernameField";
import { updateUsername } from "./api/handles.api";
import type { HandleAvailability } from "./api/useHandleAvailability";
import styles from "./EditProfilePage.module.css";

/** Read the server's rejection reason off an ApiError for a 409/422 username save. */
function messageForError(err: unknown): string {
  if (err instanceof ApiError) {
    const reason = (err.data as { reason?: string } | undefined)?.reason;
    if (err.status === 409 || reason === "taken")
      return "Someone already goes by that — try another one.";
    if (reason === "reserved")
      return "That word's kept for the platform — try another.";
    if (err.status === 422 || reason === "invalid")
      return "That username isn't allowed — check the format and try again.";
  }
  return "We couldn't update your username just now — try again.";
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
  const { profile } = useProfile();
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
      showToast("Username updated.", "success");
    } catch (err) {
      showToast(messageForError(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.section} id="username">
      <h2 className={styles.sectionTitle}>
        Your <em>username</em>
      </h2>
      <p className={styles.sectionSub}>
        This is your handle across QueerPulse — how people find your profile.
        Choose one that's yours; you can change it later, though old links won't
        point here anymore.
      </p>

      <UsernameField
        value={value}
        onChange={setValue}
        currentName={savedName}
        label="Username"
        hint="Lowercase letters, numbers and hyphens — 3 to 30 characters."
        onStatusChange={setAvailability}
      />

      <div className={styles.usernameActions}>
        <Button variant="primary" onClick={save} disabled={!canSave}>
          {saving ? "Saving…" : "Save username"}
        </Button>
        <span className={styles.usernamePreview}>
          Your profile lives at <strong>/members/{normalized || "…"}</strong>
        </span>
      </div>
    </div>
  );
}
