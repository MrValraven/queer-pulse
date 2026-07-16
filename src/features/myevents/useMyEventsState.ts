import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MyEvent, Notif, Pill, Prefs } from "./myEvents.types";
import type { MyEventsValue, MoreMenuState } from "./MyEventsContext";
import { DEFAULT_PREFS, PILLS } from "./myEvents.data";
import { inPill, parseDate, timeStr } from "./myEvents.helpers";
import { useMyEventsCalendar } from "./useMyEventsCalendar";
import { useMyEventsToolbar } from "./useMyEventsToolbar";
import { useMyEventsSelection } from "./useMyEventsSelection";
import { useMyEventsSafety } from "./useMyEventsSafety";
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
  // GET /events (per cat-bearing filter) + GET /event-invites. Either way the
  // result lands here as a flat list, then every RSVP/bulk/notification
  // action below keeps mutating it locally exactly as before.
  const {
    events: sourceEvents,
    notifs: sourceNotifs,
    loading: dataLoading,
  } = useMyEventsData();
  const [events, setEvents] = useState<MyEvent[]>(sourceEvents);
  const [notifs, setNotifs] = useState<Notif[]>(sourceNotifs);
  useEffect(() => setEvents(sourceEvents), [sourceEvents]);
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
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
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
      setLoading(dataLoading);
      return;
    }
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [demoMode, dataLoading]);
  // Clear the pending soft-remove timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(removeTimer.current);
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
  });

  // notifications + modals + menu
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: "", meta: "" });
  const [details, setDetails] = useState<{
    open: boolean;
    evId: string | null;
  }>({ open: false, evId: null });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scope, setScope] = useState<{
    open: boolean;
    evId: string | null;
    title: string;
  }>({ open: false, evId: null, title: "" });
  const [moreMenu, setMoreMenu] = useState<MoreMenuState>({
    open: false,
    evId: null,
    x: 0,
    y: 0,
  });
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [removingId, setRemovingId] = useState<string | null>(null);
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

  // ── soft remove with undo ─────────────────────────
  const softRemove = useCallback(
    (id: string, msg: string) => {
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      const idx = events.indexOf(ev);
      setRemovingId(id);
      clearTimeout(removeTimer.current);
      removeTimer.current = setTimeout(() => {
        setRemovingId(null);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        toastAction(msg, {
          label: t("myevents:bulk.undoCta"),
          onClick: () => {
            setEvents((prev) => {
              const copy = prev.slice();
              copy.splice(Math.min(idx, copy.length), 0, ev);
              return copy;
            });
            toast(t("myevents:bulk.broughtBackToast"), "info");
          },
        });
      }, 200);
    },
    [events, t, toast, toastAction],
  );

  // ── rsvp lifecycle ────────────────────────────────
  const patch = useCallback((id: string, fn: (e: MyEvent) => MyEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
  }, []);

  const toggleReminder = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (!ev) return;
      const next = !ev.reminder;
      patch(id, (e) => ({ ...e, reminder: next }));
      toast(
        next
          ? t("myevents:toast.reminderSet", { lead: prefs.reminderLead })
          : t("myevents:toast.reminderOff"),
        "info",
      );
    },
    [byId, patch, prefs.reminderLead, t, toast],
  );

  const setMaybe = useCallback(
    (id: string) => {
      patch(id, (e) => ({ ...e, maybe: true }));
      setMoreMenu((m) => ({ ...m, open: false }));
      toast(t("myevents:toast.markedMaybe"), "info");
    },
    [patch, t, toast],
  );
  const setGoing = useCallback(
    (id: string) => {
      patch(id, (e) => ({ ...e, maybe: false }));
      setMoreMenu((m) => ({ ...m, open: false }));
      toast(t("myevents:toast.fullyIn"), "success");
    },
    [patch, t, toast],
  );

  const rsvpSaved = useCallback(
    (id: string) => {
      patch(id, (e) => ({
        ...e,
        cat: "going",
        whoText: `${e.going} going`,
        who: [["YOU", "coral"]],
      }));
      toast(t("myevents:toast.rsvpGoing"), "success");
    },
    [patch, t, toast],
  );

  const acceptInvite = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (!ev) return;
      const dt = parseDate(ev.date);
      setConfirm({
        open: true,
        title: ev.title,
        meta: `${fmt.date(dt, { weekday: "long", day: "numeric", month: "long" })} · ${timeStr(ev)} · ${ev.venue}`,
      });
      patch(id, (e) => ({
        ...e,
        cat: "going",
        whoText: `${e.going} going`,
        who: [["YOU", "coral"]],
      }));
    },
    [byId, fmt, patch],
  );
  const closeConfirm = useCallback(
    () => setConfirm((c) => ({ ...c, open: false })),
    [],
  );
  const declineInvite = useCallback(
    (id: string) => softRemove(id, t("myevents:toast.invitationDeclined")),
    [softRemove, t],
  );

  const cantGo = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (ev?.series) {
        setScope({ open: true, evId: id, title: ev.title });
        return;
      }
      softRemove(id, t("myevents:toast.placeReleased"));
    },
    [byId, softRemove, t],
  );
  const leaveWaitlist = useCallback(
    (id: string) => softRemove(id, t("myevents:toast.leftWaitlist")),
    [softRemove, t],
  );
  const closeScope = useCallback(
    () => setScope((s) => ({ ...s, open: false })),
    [],
  );
  const scopeChoice = useCallback(
    (which: "one" | "all") => {
      const id = scope.evId;
      setScope((s) => ({ ...s, open: false }));
      if (!id) return;
      if (which === "one")
        softRemove(id, t("myevents:toast.skippedThisOne"));
      else softRemove(id, t("myevents:toast.leftWholeSeries"));
    },
    [scope.evId, softRemove, t],
  );

  // ── notifications ─────────────────────────────────
  const markAllRead = useCallback(
    () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
    [],
  );
  const goToEvent = useCallback(
    (evId: string) => {
      const ev = byId(evId);
      if (!ev) return;
      const dt = parseDate(ev.date);
      setViewY(dt.getFullYear());
      setViewM(dt.getMonth());
      setCalViewRaw("month");
      setPillState(
        ev.cat === "past"
          ? "past"
          : ev.cat === "saved" || ev.cat === "invite" || ev.cat === "sent"
            ? "saved"
            : ev.cat === "waitlisted"
              ? "waitlisted"
              : "upcoming",
      );
      clearSecondary();
      setSelectedDate(ev.date);
      if (typeof window !== "undefined" && window.innerWidth <= 700)
        setMobileView("list");
      // Flag the target card so it can scroll into view + flash, then clear.
      setFocusId(evId);
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
      goToEvent(n.evId);
    },
    [notifs, goToEvent],
  );

  // ── details + settings ────────────────────────────
  const openDetails = useCallback(
    (id: string) => setDetails({ open: true, evId: id }),
    [],
  );
  const closeDetails = useCallback(
    () => setDetails((d) => ({ ...d, open: false })),
    [],
  );
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const setPref = useCallback(
    (key: keyof Prefs, value: Prefs[keyof Prefs]) =>
      setPrefs((p) => ({ ...p, [key]: value })),
    [],
  );
  const saveSettings = useCallback(
    (next: Partial<Prefs>) => {
      setPrefs((p) => ({ ...p, ...next }));
      setSettingsOpen(false);
      toast(t("myevents:toast.preferencesSaved"), "success");
    },
    [t, toast],
  );

  // ── more menu ─────────────────────────────────────
  const openMore = useCallback(
    (evId: string, x: number, y: number) =>
      setMoreMenu({ open: true, evId, x, y }),
    [],
  );
  const closeMore = useCallback(
    () => setMoreMenu((m) => ({ ...m, open: false })),
    [],
  );

  // ── safety flows (report + block live in a focused sub-hook) ──
  const safety = useMyEventsSafety({ byId, toast, closeMore });

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
    toggleReminder,
    setMaybe,
    setGoing,
    rsvpSaved,
    acceptInvite,
    declineInvite,
    cantGo,
    leaveWaitlist,
    softRemove,
    removingId,
    markAllRead,
    notifGo,
    notifOpen,
    setNotifOpen,
    confirm,
    closeConfirm,
    details,
    openDetails,
    closeDetails,
    settingsOpen,
    openSettings,
    closeSettings,
    scope,
    closeScope,
    scopeChoice,
    prefs,
    setPref,
    saveSettings,
    moreMenu,
    openMore,
    closeMore,
    ...safety,
    focusId,
    offline,
    toast,
  };
}
