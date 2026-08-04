import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditProfilePane, type ProfileSection } from "./EditProfilePane";
import { EditProfileSidebar } from "./EditProfileSidebar";
import { SECTION_LABEL_KEYS } from "./editProfileNav.data";
import styles from "./EditProfilePage.module.css";

export function EditProfilePage() {
  const { t } = useTranslation();
  const [changed, setChanged] = useState<Set<ProfileSection>>(new Set());
  const [savedSections, setSavedSections] = useState<ProfileSection[] | null>(
    null,
  );
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { save, isSaving, saveError, cancelEditing } = useProfileEdit();

  const unsaved = changed.size > 0;

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
          <EditProfilePane onChange={markChanged} />
          <div style={{ height: "80px" }} />
        </div>
      </div>

      {savedSections && (
        <div className={styles.savedBar}>
          <span className={styles.savedIcon}>
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

      {unsaved && (
        <div className={styles.saveBar}>
          <span className={styles.unsavedLabel}>
            {t("settings:editProfile.saveBar.unsavedLabel", {
              sections: [...changed]
                .map((section) => t(SECTION_LABEL_KEYS[section] ?? section))
                .join(", "),
            })}
          </span>
          <div className={styles.saveActions}>
            {saveError && <span className={styles.saveError}>{saveError}</span>}
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
