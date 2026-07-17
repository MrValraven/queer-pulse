import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ALWAYS_ON, type MatrixRow } from "./notificationPreferences.data";
import styles from "./NotificationPreferencesPage.module.css";

export function NotificationSidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarHead}>
          {t("settings:notifPrefs.sidebar.account")}
        </div>
        <Link to={routes.editProfile} className={styles.navItem}>
          <svg className={styles.navIcon} viewBox="0 0 16 16">
            <circle cx="8" cy="6" r="3" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
          {t("settings:notifPrefs.sidebar.editProfile")}
        </Link>
        <button
          type="button"
          className={`${styles.navItem} ${styles.navItemActive}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 16 16">
            <path d="M8 2a6 6 0 0 1 6 6c0 3.3-6 8-6 8S2 11.3 2 8a6 6 0 0 1 6-6z" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          </svg>
          {t("settings:notifPrefs.sidebar.notifications")}
        </button>
        <button type="button" className={styles.navItem}>
          <svg className={styles.navIcon} viewBox="0 0 16 16">
            <rect x="2" y="11" width="12" height="3" rx="1" />
            <path d="M5 8h6M5 5h4" />
          </svg>
          {t("settings:notifPrefs.sidebar.privacy")}
        </button>
        <div className={styles.sidebarHead}>
          {t("settings:notifPrefs.sidebar.dangerZone")}
        </div>
        <Link
          to={routes.deleteAccount}
          className={`${styles.navItem} ${styles.navItemDanger}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 16 16">
            <polyline points="3,4 13,4" />
            <path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4l.5 9h5l.5-9" />
          </svg>
          {t("settings:notifPrefs.sidebar.deactivateAccount")}
        </Link>
      </div>
    </aside>
  );
}

// Cosmetic, uncontrolled <select>s — stable `value` ids so the translated
// <option> labels never have to double as the match target for `defaultValue`.
const FREQUENCY_OPTIONS = [
  { id: "never", labelKey: "settings:notifPrefs.digest.freq.never" },
  { id: "daily", labelKey: "settings:notifPrefs.digest.freq.daily" },
  {
    id: "weeklyMonday",
    labelKey: "settings:notifPrefs.digest.freq.weeklyMonday",
  },
  {
    id: "fortnightly",
    labelKey: "settings:notifPrefs.digest.freq.fortnightly",
  },
] as const;

const INCLUDES_OPTIONS = [
  {
    id: "forumEvents",
    labelKey: "settings:notifPrefs.digest.includes.forumEvents",
  },
  {
    id: "everything",
    labelKey: "settings:notifPrefs.digest.includes.everything",
  },
  {
    id: "eventsOnly",
    labelKey: "settings:notifPrefs.digest.includes.eventsOnly",
  },
  {
    id: "forumOnly",
    labelKey: "settings:notifPrefs.digest.includes.forumOnly",
  },
] as const;

export function DigestSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {t("settings:notifPrefs.digest.sectionLabel")}
      </div>
      <div className={styles.freqCard}>
        <div>
          <div className={styles.freqLabel}>
            {t("settings:notifPrefs.digest.frequencyLabel")}
          </div>
          <div className={styles.freqSub}>
            {t("settings:notifPrefs.digest.frequencySub")}
          </div>
        </div>
        <select className={styles.select} defaultValue="weeklyMonday">
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.freqCard}>
        <div>
          <div className={styles.freqLabel}>
            {t("settings:notifPrefs.digest.includesLabel")}
          </div>
          <div className={styles.freqSub}>
            {t("settings:notifPrefs.digest.includesSub")}
          </div>
        </div>
        <select className={styles.select} defaultValue="forumEvents">
          {INCLUDES_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ChannelMatrix({
  matrix,
  toggleMatrix,
}: {
  matrix: MatrixRow[];
  toggleMatrix: (rowIdx: number, col: "app" | "email" | "push") => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {t("settings:notifPrefs.matrix.sectionLabel")}
      </div>
      <div className={styles.channelMatrix}>
        <div className={styles.cmHeader}>
          <div className={styles.cmColHead}>
            {t("settings:notifPrefs.matrix.colEvent")}
          </div>
          <div className={styles.cmColHead}>
            {t("settings:notifPrefs.matrix.colInApp")}
          </div>
          <div className={styles.cmColHead}>
            {t("settings:notifPrefs.matrix.colEmail")}
          </div>
          <div className={styles.cmColHead}>
            {t("settings:notifPrefs.matrix.colPush")}
          </div>
        </div>
        {matrix.map((row, i) => (
          <div key={row.id} className={styles.cmRow}>
            <div>
              <div className={styles.cmRowLabel}>{t(row.labelKey)}</div>
              <div className={styles.cmRowSub}>{t(row.subKey)}</div>
            </div>
            {(["app", "email", "push"] as const).map((col) => (
              <div key={col} className={styles.cmCheck}>
                <input
                  type="checkbox"
                  className={styles.cmCheckbox}
                  checked={row[col]}
                  onChange={() => toggleMatrix(i, col)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuietHoursSection({
  quietEnabled,
  setQuietEnabled,
}: {
  quietEnabled: boolean;
  setQuietEnabled: (fn: (v: boolean) => boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {t("settings:notifPrefs.quietHours.sectionLabel")}
      </div>
      <div className={styles.toggleList}>
        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            <div className={styles.toggleTitle}>
              {t("settings:notifPrefs.quietHours.enableTitle")}
            </div>
            <div className={styles.toggleDesc}>
              {t("settings:notifPrefs.quietHours.enableDesc")}
            </div>
          </div>
          <label className={styles.toggleSw}>
            <input
              type="checkbox"
              checked={quietEnabled}
              onChange={() => setQuietEnabled((v) => !v)}
            />
            <span className={styles.toggleTrack} />
            <span className={styles.toggleThumb} />
          </label>
        </div>
      </div>
      <div
        className={styles.quietRow}
        style={
          quietEnabled ? undefined : { opacity: 0.4, pointerEvents: "none" }
        }
      >
        <div className={styles.timeField}>
          <span className={styles.timeLabel}>
            {t("settings:notifPrefs.quietHours.from")}
          </span>
          <input
            type="time"
            className={styles.timeInput}
            defaultValue="22:00"
          />
        </div>
        <div className={styles.timeField}>
          <span className={styles.timeLabel}>
            {t("settings:notifPrefs.quietHours.until")}
          </span>
          <input
            type="time"
            className={styles.timeInput}
            defaultValue="08:00"
          />
        </div>
      </div>
    </div>
  );
}

export function AlwaysOnSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {t("settings:notifPrefs.alwaysOn.sectionLabel")}
      </div>
      <div className={styles.toggleList}>
        {ALWAYS_ON.map(({ id, titleKey, descKey }) => (
          <div
            key={id}
            className={`${styles.toggleRow} ${styles.toggleRowDisabled}`}
          >
            <div className={styles.toggleLabel}>
              <div className={styles.toggleTitle}>{t(titleKey)}</div>
              <div className={styles.toggleDesc}>{t(descKey)}</div>
            </div>
            <label className={styles.toggleSw}>
              <input type="checkbox" defaultChecked readOnly />
              <span className={styles.toggleTrack} />
              <span className={styles.toggleThumb} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
