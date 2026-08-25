import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CalView, MobileView, MyEvent, Pill } from "./myEvents.types";
import { parseDate } from "./myEvents.helpers";

interface FocusDeps {
  byId: (id: string) => MyEvent | undefined;
  setViewY: Dispatch<SetStateAction<number>>;
  setViewM: Dispatch<SetStateAction<number>>;
  setCalViewRaw: Dispatch<SetStateAction<CalView>>;
  clearSecondary: () => void;
  setMobileView: Dispatch<SetStateAction<MobileView>>;
  setPillState: Dispatch<SetStateAction<Pill>>;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
}

export interface MyEventsFocus {
  focusId: string | null;
  /** Jump the calendar/pill/selected-day view to an event, then flash its card. */
  goToEvent: (eventId: string) => void;
}

/**
 * Deep-link focus: given an event id (from a notification, say), jumps the
 * calendar month/pill/selected-day to it, then flags the target card
 * (`focusId`) so it can scroll into view + flash before clearing itself.
 */
export function useMyEventsFocus({
  byId,
  setViewY,
  setViewM,
  setCalViewRaw,
  clearSecondary,
  setMobileView,
  setPillState,
  setSelectedDate,
}: FocusDeps): MyEventsFocus {
  const [focusId, setFocusId] = useState<string | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear the pending focus timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(focusTimer.current);
    },
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
          : ev.category === "saved" ||
              ev.category === "invite" ||
              ev.category === "sent"
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
    [
      byId,
      clearSecondary,
      setViewY,
      setViewM,
      setCalViewRaw,
      setMobileView,
      setPillState,
      setSelectedDate,
    ],
  );

  return { focusId, goToEvent };
}
