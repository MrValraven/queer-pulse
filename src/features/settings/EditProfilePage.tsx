import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { EditProfilePane, type ProfileSection } from "./EditProfilePane";
import { EditProfileSidebar } from "./EditProfileSidebar";
import { SECTION_LABELS } from "./editProfileNav.data";
import styles from "./EditProfilePage.module.css";

export function EditProfilePage() {
  const [changed, setChanged] = useState<Set<ProfileSection>>(new Set());
  const [savedSections, setSavedSections] = useState<ProfileSection[] | null>(
    null,
  );
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unsaved = changed.size > 0;

  function markChanged(section: ProfileSection) {
    setChanged((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
    setSavedSections(null);
  }

  function handleSave() {
    setSavedSections([...changed]);
    setChanged(new Set());
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedSections(null), 6000);
  }

  function handleDiscard() {
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

        <main className={styles.main}>
          <EditProfilePane onChange={markChanged} />
          <div style={{ height: "80px" }} />
        </main>
      </div>

      {savedSections && (
        <div className={styles.savedBar}>
          <span className={styles.savedIcon}>
            <FiCheck />
          </span>
          <span className={styles.savedText}>
            Saved.{" "}
            {savedSections.length > 0 ? (
              <>
                Updated{" "}
                <strong>
                  {savedSections.map((s) => SECTION_LABELS[s] ?? s).join(", ")}
                </strong>
                .
              </>
            ) : (
              "Your profile is up to date."
            )}
          </span>
        </div>
      )}

      {unsaved && (
        <div className={styles.saveBar}>
          <span className={styles.unsavedLabel}>
            Unsaved changes in{" "}
            {[...changed].map((s) => SECTION_LABELS[s] ?? s).join(", ")}
          </span>
          <div className={styles.saveActions}>
            <Button variant="ghost" onClick={handleDiscard}>
              Discard
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save profile
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
