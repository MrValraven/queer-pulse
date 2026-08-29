import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Pill } from "./myEvents.types";
import type { MyEventsValue } from "./MyEventsContext";
import { PILLS } from "./myEvents.data";
import { inPill } from "./myEvents.helpers";
import { useMyEventsCalendar } from "./useMyEventsCalendar";
import { useMyEventsToolbar } from "./useMyEventsToolbar";
import { useMyEventsSelection } from "./useMyEventsSelection";
import { useMyEventsSafety } from "./useMyEventsSafety";
import { useMyEventsModals } from "./useMyEventsModals";
import { useMyEventsRsvp } from "./useMyEventsRsvp";
import { useMyEventsData } from "./api/useMyEventsData";
import { useMyEventsSync } from "./useMyEventsSync";

/** Central state + actions for the My Events dashboard. */
export function useMyEventsState(): MyEventsValue {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const toast = useCallback(
    (msg: string, type: "success" | "info" | "error" = "info") =>
      showToast(msg, type),
    [showToast],
  );
  const toastAction = useCallback(
    (msg: string, action: ToastAction) => showToast(msg, "info", 6000, action),
    [showToast],
  );

  // Demo mode returns the page's own mock registry; live mode fetches from
  // GET /events (per category-bearing filter) + GET /event-invites. The
  // dirty-tracked local mirror (so RSVP/bulk actions can keep mutating it
  // optimistically without a background refetch clobbering in-flight edits)
  // lives in `useMyEventsSync`.
  const {
    events: sourceEvents,
    loading: dataLoading,
    hasError,
    retry,
  } = useMyEventsData();
  const { events, setEvents, byId } = useMyEventsSync({ sourceEvents });

  const [pill, setPillState] = useState<Pill>("upcoming");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pastShown, setPastShown] = useState(5);
  const [loading, setLoading] = useState(true);
  const loadTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  // calendar + toolbar (state + actions live in focused sub-hooks)
  const cal = useMyEventsCalendar();
  const tb = useMyEventsToolbar();
  const { setMobileView } = tb;

  // select + bulk (state + actions live in a focused sub-hook)
  const selection = useMyEventsSelection({
    events,
    setEvents,
    toast,
    toastAction,
    t,
  });

  // derived
  const counts = useMemo(() => {
    const c = {} as Record<Pill, number>;
    PILLS.forEach((p) => {
      c[p] = events.filter((e) => inPill(e, p)).length;
    });
    return c;
  }, [events]);

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

  // modals + more-menu (focused sub-hook)
  const modals = useMyEventsModals();
  const { closeMore } = modals;

  // rsvp lifecycle + confirm/scope modals (focused sub-hook)
  const rsvp = useMyEventsRsvp({
    events,
    setEvents,
    byId,
    toast,
    toastAction,
    t,
    fmt,
    closeMore,
  });

  // ── safety flows (report + block live in a focused sub-hook) ──
  const safety = useMyEventsSafety({ byId, toast, closeMore, t });

  return {
    events,
    counts,
    byId,
    hasError,
    retry,
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
    ...modals,
    ...safety,
    toast,
  };
}
