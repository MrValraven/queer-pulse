import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** The notifications panel, opened from the header bell. Built on the shared
 *  `Modal` so it gets scroll-lock, focus-trap, Escape and scrim-dismiss for
 *  free (mounted only while open by the header). */
export function NotifPanel() {
  const { t } = useTranslation();
  const { notifs, unreadCount, markAllRead, notifGo, setNotifOpen } =
    useMyEvents();
  return (
    <Modal
      title={t("myevents:notif.title")}
      onClose={() => setNotifOpen(false)}
      footer={
        unreadCount > 0 ? (
          <Button variant="ghost" onClick={markAllRead}>
            {t("myevents:notif.markAllRead")}
          </Button>
        ) : undefined
      }
    >
      <div className={sx("notif-list")}>
        {notifs.length === 0 ? (
          <div className={sx("notif-empty")}>{t("myevents:notif.empty")}</div>
        ) : (
          notifs.map((n, i) => (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label -- accessible name comes from the dynamic lead/bold/tail/time children the linter can't read statically.
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
    </Modal>
  );
}
