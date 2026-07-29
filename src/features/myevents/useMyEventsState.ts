import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MyEvent, Notif, Pill } from "./myEvents.types";
import type { MyEventsValue } from "./MyEventsContext";
import { PILLS } from "./myEvents.data";
import { inPill, parseDate } from "./myEvents.helpers";
import { useMyEventsCalendar } from "./useMyEventsCalendar";
import { useMyEventsToolbar } from "./useMyEventsToolbar";
import { useMyEventsSelection } from "./useMyEventsSelection";
import { useMyEventsSafety } from "./useMyEventsSafety";
import { useMyEventsModals } from "./useMyEventsModals";
import { useMyEventsRsvp } from "./useMyEventsRsvp";
import { useMyEventsData } from "./api/useMyEventsData";

/** Central state + actions for the My Events dashboard. */
export function useMyEventsState(): MyEventsValue {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const toast = useCallback(
    (msg: string, type: "success" | "info" = "info") => showToast(msg, type),
    [showToast],
  );
  const toastAction = useCallback(
    (msg: string, action: ToastAction) => showToast(msg, "info", 6000, action),
    [showToast],
  );

  // Demo mode returns the page's own mock registry; live mode fetches from
  // GET /events (per category-bearing filter) + GET /event-invites. Either way the
  // result lands here as a flat list, then every RSVP/bulk/notification
  // action below keeps mutating it locally exactly as before.
  const {
    events: sourceEvents,
    notifs: sourceNotifs,
    loading: dataLoading,
  } = useMyEventsData();
  const [events, setEvents] = useState<MyEvent[]>(sourceEvents);
  const [notifs, setNotifs] = useState<Notif[]>(sourceNotifs);
  // Syncs to the data hook's source (live GET /events refetch resyncs to server).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setEvents(sourceEvents), [sourceEvents]);
  // Syncs to the data hook's source (live GET /event-invites refetch resyncs).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNotifs(sourceNotifs), [sourceNotifs]);
  const byId = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events],
  );

  const [pill, setPillState] = useState<Pill>("upcoming");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pastShown, setPastShown] = useState(5);
  const [loading, setLoading] = useState(true);
  const loadTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startLoad = useCallback((delay: number) => {
    setLoading(true);
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => setLoading(false), delay);
  }, []);
  // Initial load-in: skeleton (loading starts true), then reveal after a
  // simulated beat in demo mode, or once the live GET /events fetch resolves.
  useEffect(() => {
    if (!demoMode) {
      // Mirrors the live GET /events fetch's loading flag.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(dataLoading);
      return;
    }
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [demoMode, dataLoading]);
  // Clear the pending focus timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(focusTimer.current);
    },
    [],
  );

  // calendar + toolbar (state + actions live in focused sub-hooks)
  const cal = useMyEventsCalendar();
  const { setViewY, setViewM, setCalViewRaw } = cal;
  const tb = useMyEventsToolbar();
  const { clearSecondary, setMobileView } = tb;

  // select + bulk (state + actions live in a focused sub-hook)
  const selection = useMyEventsSelection({
    events,
    setEvents,
    toast,
    toastAction,
    t,
  });

  // notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  // deep-link focus
  const [focusId, setFocusId] = useState<string | null>(null);

  // derived
  const counts = useMemo(() => {
    const c = {} as Record<Pill, number>;
    PILLS.forEach((p) => {
      c[p] = events.filter((e) => inPill(e, p)).length;
    });
    return c;
  }, [events]);
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

  // ── primary view ──────────────────────────────────
  const setPill = useCallback(
    (p: Pill) => {
      setPillState(p);
      setSelectedDate(null);
      setPastShown(5);
      startLoad(320);
    },
    [startLoad],
  );

  const selectDay = useCallback(
    (ds: string) => {
      setSelectedDate((cur) => (cur === ds ? null : ds));
      if (typeof window !== "undefined" && window.innerWidth <= 700)
        setMobileView("list");
    },
    [setMobileView],
  );
  const clearDay = useCallback(() => setSelectedDate(null), []);
  const loadMorePast = useCallback(() => setPastShown((n) => n + 5), []);

  // modals + preferences + more-menu (focused sub-hook)
  const modals = useMyEventsModals({ toast, t });
  const { closeMore, prefs } = modals;

  // rsvp lifecycle + confirm/scope modals (focused sub-hook)
  const rsvp = useMyEventsRsvp({
    events,
    setEvents,
    byId,
    toast,
    toastAction,
    t,
    fmt,
    reminderLead: prefs.reminderLead,
    closeMore,
  });

  // ── notifications ─────────────────────────────────
  const markAllRead = useCallback(
    () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
    [],
  );
  const goToEvent = useCallback(
    (eventId: string) => {
      const ev = byId(eventId);
      if (!ev) return;
      const dt = parseDate(ev.date);
      setViewY(dt.getFullYear());
      setViewM(dt.getMonth());
      setCalViewRaw("month");
      setPillState(
        ev.category === "past"
          ? "past"
          : ev.category === "saved" || ev.category === "invite" || ev.category === "sent"
            ? "saved"
            : ev.category === "waitlisted"
              ? "waitlisted"
              : "upcoming",
      );
      clearSecondary();
      setSelectedDate(ev.date);
      if (typeof window !== "undefined" && window.innerWidth <= 700)
        setMobileView("list");
      // Flag the target card so it can scroll into view + flash, then clear.
      setFocusId(eventId);
      clearTimeout(focusTimer.current);
      focusTimer.current = setTimeout(() => setFocusId(null), 1800);
    },
    [byId, clearSecondary, setViewY, setViewM, setCalViewRaw, setMobileView],
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
    [notifs, goToEvent],
  );

  // ── safety flows (report + block live in a focused sub-hook) ──
  const safety = useMyEventsSafety({ byId, toast, closeMore, t });

  return {
    events,
    notifs,
    unreadCount,
    counts,
    byId,
    pill,
    selectedDate,
    loading,
    setPill,
    selectDay,
    clearDay,
    loadMorePast,
    pastShown,
    ...cal,
    ...tb,
    ...selection,
    ...rsvp,
    markAllRead,
    notifGo,
    notifOpen,
    setNotifOpen,
    ...modals,
    ...safety,
    focusId,
    offline,
    toast,
  };
}
