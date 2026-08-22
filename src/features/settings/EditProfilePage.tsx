import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useProfileEdit } from "../../app/providers/useProfile";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditProfilePane, type ProfileSection } from "./EditProfilePane";
import { EditProfileSidebar } from "./EditProfileSidebar";
import { EditProfileMobileNav } from "./EditProfileMobileNav";
import { SECTION_LABEL_KEYS } from "./editProfileNav.data";
import styles from "./EditProfilePage.module.css";

export function EditProfilePage() {
  const { t } = useTranslation();
  const [changed, setChanged] = useState<Set<ProfileSection>>(new Set());
  const [savedSections, setSavedSections] = useState<ProfileSection[] | null>(
    null,
  );
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { save, isSaving, saveError, cancelEditing, startEditing, isEditing } =
    useProfileEdit();
  const cancelEditingRef = useRef(cancelEditing);
  // Tracks that this page is the one that opened the edit session.
  const openedRef = useRef(false);

  const hasUnsavedChanges = changed.size > 0;

  // Keep the ref current after every render (outside render, so this is safe),
  // so the unmount-only cleanup below always calls the latest cancelEditing
  // without depending on it (its identity changes on every save).
  useEffect(() => {
    cancelEditingRef.current = cancelEditing;
  });

  // Hold an edit session open for as long as this page is mounted. Without one,
  // ProfileProvider's re-seed effect is free to replace the draft mid-typing the
  // moment /auth/me or the own-profile query resolves, and `isDirty` (which is
  // `isEditing && ...`) never becomes true. Re-runs after a successful save,
  // which closes the session provider-side, so the next edit is protected too.
  useEffect(() => {
    if (isEditing) return;
    startEditing();
    openedRef.current = true;
  }, [isEditing, startEditing]);

  // Leaving the page drops a session WE opened, mirroring Discard. One opened
  // elsewhere (the members profile inline editor) is left intact.
  useEffect(
    () => () => {
      if (openedRef.current) cancelEditingRef.current();
    },
    [],
  );

  // Nothing else warns before a dirty editor is abandoned: the save bar was the
  // only signal, and any nav link silently threw the edits away.
  useUnsavedChangesGuard({
    active: hasUnsavedChanges,
    confirmMessage: t("settings:editProfile.leaveConfirm"),
    onConfirmLeave: () => {
      cancelEditing();
      setChanged(new Set());
      setSavedSections(null);
    },
  });

  function markChanged(section: ProfileSection) {
    setChanged((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
    setSavedSections(null);
  }

  async function handleSave() {
    const sections = [...changed];
    const ok = await save();
    if (!ok) return; // provider.saveError surfaces in the save bar
    setSavedSections(sections);
    setChanged(new Set());
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedSections(null), 6000);
  }

  function handleDiscard() {
    cancelEditing();
    setChanged(new Set());
    setSavedSections(null);
  }

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  return (
    <AppShell>
      <div className={styles.page}>
        <EditProfileSidebar />

        <div className={styles.main}>
          <EditProfileMobileNav />
          <EditProfilePane onChange={markChanged} />
        </div>
      </div>

      {savedSections && (
        <div className={styles.savedBar} role="status" aria-live="polite">
          <span className={styles.savedIcon} aria-hidden>
            <FiCheck />
          </span>
          <span className={styles.savedText}>
            {savedSections.length > 0 ? (
              <Translation
                i18nKey="settings:editProfile.savedBar.updated"
                components={{ strong: <strong /> }}
                values={{
                  sections: savedSections
                    .map((section) => t(SECTION_LABEL_KEYS[section] ?? section))
                    .join(", "),
                }}
              />
            ) : (
              t("settings:editProfile.savedBar.upToDate")
            )}
          </span>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className={styles.saveBar}>
          <span className={styles.unsavedLabel}>
            {t("settings:editProfile.saveBar.unsavedLabel", {
              sections: [...changed]
                .map((section) => t(SECTION_LABEL_KEYS[section] ?? section))
                .join(", "),
            })}
          </span>
          <div className={styles.saveActions}>
            {saveError && (
              <span className={styles.saveError} role="alert">
                {saveError}
              </span>
            )}
            <Button variant="ghost" onClick={handleDiscard} disabled={isSaving}>
              {t("settings:editProfile.saveBar.discard")}
            </Button>
            <Button variant="primary" onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving
                ? t("settings:editProfile.saveBar.saving")
                : t("settings:editProfile.saveBar.save")}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
