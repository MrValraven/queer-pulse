import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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

        <div className={styles.main}>
          <h1 className={styles.paneTitle}>
            <Translation
              i18nKey="settings:notifPrefs.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.paneSub}>{t("settings:notifPrefs.sub")}</p>

          <DigestSection />
          <ChannelMatrix matrix={matrix} toggleMatrix={toggleMatrix} />
          <QuietHoursSection
            quietEnabled={quietEnabled}
            setQuietEnabled={setQuietEnabled}
          />
          <AlwaysOnSection />

          <div className={styles.saveBar}>
            <p className={styles.saveBarNote}>
              {t("settings:notifPrefs.saveBar.note")}
            </p>
            <SaveButton
              label={t("settings:notifPrefs.saveBar.label")}
              onSave={() =>
                showToast(t("settings:notifPrefs.toast.saved"), "success")
              }
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
