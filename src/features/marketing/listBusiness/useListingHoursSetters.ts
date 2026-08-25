import { useCallback, type Dispatch, type SetStateAction } from "react";
import {
  DAYS,
  defaultInterval,
  type DayHours,
  type HoursInterval,
  type ListingDraft,
} from "./listBusiness.data";

/** Patch one day's hours, leaving every other day untouched. */
function patchDay(
  hours: Record<string, DayHours>,
  dayId: string,
  patch: Partial<DayHours>,
): Record<string, DayHours> {
  return {
    ...hours,
    [dayId]: { ...hours[dayId]!, ...patch },
  };
}

/**
 * The weekly opening-hours grid's setters (item #6), kept out of
 * `useListingForm` for the same reason the dated exceptions and the
 * accessibility block are: a self-contained sub-editor whose state rules
 * belong next to each other.
 *
 * A day is closed, or open across one or two intervals. Every setter keeps
 * that invariant intact: opening a day with no intervals seeds one, and a
 * day always keeps at least one interval once it has any.
 */
export function useListingHoursSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  /** Toggle a day open/closed. Opening a day with no intervals seeds one. */
  const setDayOpen = useCallback(
    (dayId: string, open: boolean) => {
      setDraft((d) => {
        const current = d.hours[dayId]!;
        const intervals = current.intervals.length
          ? current.intervals
          : [defaultInterval()];
        return { ...d, hours: patchDay(d.hours, dayId, { open, intervals }) };
      });
    },
    [setDraft],
  );

  /** Patch one interval's `from`/`to` on a day. */
  const setInterval = useCallback(
    (dayId: string, index: number, patch: Partial<HoursInterval>) => {
      setDraft((d) => {
        const current = d.hours[dayId]!;
        const intervals = current.intervals.map((interval, position) =>
          position === index ? { ...interval, ...patch } : interval,
        );
        return { ...d, hours: patchDay(d.hours, dayId, { intervals }) };
      });
    },
    [setDraft],
  );

  /** Add a second interval to a day (max 2 — e.g. a lunch-break closure). */
  const addInterval = useCallback(
    (dayId: string) => {
      setDraft((d) => {
        const current = d.hours[dayId]!;
        if (current.intervals.length >= 2) return d;
        const previous = current.intervals[current.intervals.length - 1];
        // Seed the second window to start where the first ended, so the common
        // "morning · evening" split needs minimal editing.
        const next: HoursInterval = {
          from: previous?.to ?? "19:00",
          to: "23:00",
        };
        return {
          ...d,
          hours: patchDay(d.hours, dayId, {
            open: true,
            intervals: [...current.intervals, next],
          }),
        };
      });
    },
    [setDraft],
  );

  /** Remove an interval from a day; a day always keeps at least one. */
  const removeInterval = useCallback(
    (dayId: string, index: number) => {
      setDraft((d) => {
        const current = d.hours[dayId]!;
        if (current.intervals.length <= 1) return d;
        const intervals = current.intervals.filter(
          (_, position) => position !== index,
        );
        return { ...d, hours: patchDay(d.hours, dayId, { intervals }) };
      });
    },
    [setDraft],
  );

  const copyMonToAll = useCallback(() => {
    setDraft((d) => {
      const monday = d.hours.Mon!;
      const hours: Record<string, DayHours> = {};
      DAYS.forEach((day) => {
        // Deep-copy intervals so later edits to one day don't mutate another.
        hours[day.id] = {
          open: monday.open,
          intervals: monday.intervals.map((interval) => ({ ...interval })),
        };
      });
      return { ...d, hours };
    });
  }, [setDraft]);

  const clearHours = useCallback(() => {
    setDraft((d) => {
      const hours: Record<string, DayHours> = {};
      DAYS.forEach((day) => {
        hours[day.id] = { ...d.hours[day.id]!, open: false };
      });
      return { ...d, hours };
    });
  }, [setDraft]);

  return {
    setDayOpen,
    setInterval,
    addInterval,
    removeInterval,
    copyMonToAll,
    clearHours,
  };
}
