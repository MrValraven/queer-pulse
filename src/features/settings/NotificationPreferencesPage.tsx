import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { MATRIX_ROWS } from "./notificationPreferences.data";
import { SaveButton } from "./SaveButton";
import {
  NotificationSidebar,
  DigestSection,
  ChannelMatrix,
  QuietHoursSection,
  AlwaysOnSection,
} from "./NotificationPreferencesSections";
import styles from "./NotificationPreferencesPage.module.css";

export function NotificationPreferencesPage() {
  const { showToast } = useToast();
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [matrix, setMatrix] = useState(MATRIX_ROWS.map((r) => ({ ...r })));

  function toggleMatrix(rowIdx: number, col: "app" | "email" | "push") {
    setMatrix((prev) =>
      prev.map((r, i) => (i === rowIdx ? { ...r, [col]: !r[col] } : r)),
    );
  }

  return (
    <AppShell>
      <div className={styles.settingsPage}>
        <NotificationSidebar />

        <main className={styles.main}>
          <h1 className={styles.paneTitle}>
            Notification <em>preferences</em>
          </h1>
          <p className={styles.paneSub}>
            Control exactly what QueerPulse sends you, and when. We default to
            less — you can always turn more on.
          </p>

          <DigestSection />
          <ChannelMatrix matrix={matrix} toggleMatrix={toggleMatrix} />
          <QuietHoursSection
            quietEnabled={quietEnabled}
            setQuietEnabled={setQuietEnabled}
          />
          <AlwaysOnSection />

          <div className={styles.saveBar}>
            <p className={styles.saveBarNote}>
              Changes are saved automatically.
            </p>
            <SaveButton
              label="Save preferences"
              onSave={() =>
                showToast("Notification preferences saved.", "success")
              }
            />
          </div>
        </main>
      </div>
    </AppShell>
  );
}
