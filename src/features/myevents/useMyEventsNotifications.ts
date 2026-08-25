import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Notif } from "./myEvents.types";

interface NotificationsDeps {
  notifs: Notif[];
  setNotifs: Dispatch<SetStateAction<Notif[]>>;
  goToEvent: (eventId: string) => void;
}

export interface MyEventsNotifications {
  notifOpen: boolean;
  setNotifOpen: Dispatch<SetStateAction<boolean>>;
  offline: boolean;
  unreadCount: number;
  markAllRead: () => void;
  notifGo: (i: number) => void;
}

/**
 * The bell + "What's changed" panel: open/closed state, the derived unread
 * count, offline awareness (so the panel can explain a stale/empty state),
 * and the two notif actions (mark-all-read, and jump to the event a given
 * notification is about).
 */
export function useMyEventsNotifications({
  notifs,
  setNotifs,
  goToEvent,
}: NotificationsDeps): MyEventsNotifications {
  const [notifOpen, setNotifOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  const unreadCount = useMemo(
    () => notifs.filter((n) => n.unread).length,
    [notifs],
  );

  // offline awareness
  useEffect(() => {
    const upd = () => setOffline(!navigator.onLine);
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    upd();
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);

  const markAllRead = useCallback(
    () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
    [setNotifs],
  );
  const notifGo = useCallback(
    (i: number) => {
      const n = notifs[i];
      if (!n) return;
      setNotifs((ns) =>
        ns.map((x, j) => (j === i ? { ...x, unread: false } : x)),
      );
      setNotifOpen(false);
      goToEvent(n.eventId);
    },
    [notifs, setNotifs, goToEvent],
  );

  return {
    notifOpen,
    setNotifOpen,
    offline,
    unreadCount,
    markAllRead,
    notifGo,
  };
}
