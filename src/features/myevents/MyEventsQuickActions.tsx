import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { NotifPanel } from "./NotifPanel";

/**
 * The dashboard's two icon actions — event settings and the notifications bell
 * with its panel. They used to sit beside a full "Your events" hero; that hero
 * is gone (the page is named once, by `EventsHeader`), so this cluster now
 * rides in the shared header's action row and the agenda starts near the top
 * of the page. Reads `useMyEvents`, so it must render inside `MyEventsProvider`
 * — `EventsPage` wraps the header along with the body on the "My events" tab
 * for exactly that reason.
 */
export function MyEventsQuickActions() {
  const { t } = useTranslation();
  const {
    openSettings,
    notifOpen,
    setNotifOpen,
    unreadCount,
    notificationsEnabled,
  } = useMyEvents();

  return (
    <div className={sx("ev-head-actions")}>
      <button
        type="button"
        className={sx("gear-btn")}
        aria-label={t("myevents:header.settingsAria")}
        onClick={openSettings}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <circle cx="10" cy="10" r="2.6" />
          <path
            d="M10 1.8v2M10 16.2v2M3.2 3.2l1.4 1.4M15.4 15.4l1.4 1.4M1.8 10h2M16.2 10h2M3.2 16.8l1.4-1.4M15.4 4.6l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {/* Notifications bell + panel now render in both modes:
          `notificationsEnabled` is always on since event-change
          notifications exist end-to-end (P2-7). The guard stays so the
          affordance can still be centrally switched off if needed. */}
      {notificationsEnabled && (
        <button
          type="button"
          className={sx("notif-btn")}
          aria-label={t("myevents:header.notifAria")}
          aria-haspopup="true"
          aria-expanded={notifOpen}
          onClick={() => setNotifOpen(!notifOpen)}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path
              d="M5 8a5 5 0 0 1 10 0c0 3.5 1.3 4.8 1.3 4.8H3.7S5 11.5 5 8Z"
              strokeLinejoin="round"
            />
            <path d="M8 16a2 2 0 0 0 4 0" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 && (
            <span className={sx("notif-count")}>{unreadCount}</span>
          )}
        </button>
      )}
      {notificationsEnabled && notifOpen && <NotifPanel />}
    </div>
  );
}
