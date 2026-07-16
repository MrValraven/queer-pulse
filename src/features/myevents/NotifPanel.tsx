import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** The notifications dropdown list. */
export function NotifPanel() {
  const { notifs, unreadCount, markAllRead, notifGo } = useMyEvents();
  return (
    <div className={sx("notif-panel")} role="dialog" aria-label="Notifications">
      <div className={sx("notif-head")}>
        <span className={sx("notif-h-title")}>What’s changed</span>
        {unreadCount > 0 && (
          <button
            type="button"
            className={sx("notif-clear")}
            onClick={markAllRead}
          >
            Mark all read
          </button>
        )}
      </div>
      <div className={sx("notif-list")}>
        {notifs.length === 0 ? (
          <div className={sx("notif-empty")}>You’re all caught up.</div>
        ) : (
          notifs.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className={sx(`notif-item${n.unread ? " unread" : ""}`)}
              onClick={() => notifGo(i)}
            >
              <span className={sx("ni-dot")} />
              <span className={sx("ni-body")}>
                <span className={sx("ni-text")}>
                  {n.lead}
                  <strong>{n.bold}</strong>
                  {n.tail}
                </span>
                <span className={sx("ni-time")}>{n.time}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
