import { useCallback, type Dispatch, type SetStateAction } from "react";
import {
  MAX_HOURS_EXCEPTIONS,
  defaultInterval,
  newHoursException,
  type HoursException,
  type HoursInterval,
  type ListingDraft,
} from "./listBusiness.data";

/**
 * Every setter for the draft's dated hours exceptions, kept out of
 * `useListingForm` so that hook stays about the listing as a whole.
 *
 * Each one rebuilds the array so the draft remains a plain serialisable value,
 * and each one keeps `open` and `intervals` consistent with what the backend
 * will accept: a closed date carries NO opening windows, an open date carries
 * one or two. Getting that wrong is a 400 on save rather than a visible
 * mistake, so the invariant is enforced by the setters instead of being left to
 * whoever calls them.
 */
export function useHoursExceptionSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const mapExceptions = useCallback(
    (project: (entries: HoursException[]) => HoursException[]) => {
      setDraft((current) => ({
        ...current,
        hoursExceptions: project(current.hoursExceptions ?? []),
      }));
    },
    [setDraft],
  );

  const patchException = useCallback(
    (index: number, patch: Partial<HoursException>) => {
      mapExceptions((entries) =>
        entries.map((entry, position) =>
          position === index ? { ...entry, ...patch } : entry,
        ),
      );
    },
    [mapExceptions],
  );

  const addHoursException = useCallback(() => {
    mapExceptions((entries) =>
      entries.length >= MAX_HOURS_EXCEPTIONS
        ? entries
        : [...entries, newHoursException()],
    );
  }, [mapExceptions]);

  const removeHoursException = useCallback(
    (index: number) => {
      mapExceptions((entries) =>
        entries.filter((_, position) => position !== index),
      );
    },
    [mapExceptions],
  );

  /** Drop every dated override already behind us. Only ever called from an
   *  explicit button: a past exception is still the owner's own record of what
   *  happened, so nothing here removes one on its own. */
  const removePastHoursExceptions = useCallback(
    (today: string) => {
      mapExceptions((entries) =>
        entries.filter((entry) => !entry.date || entry.date >= today),
      );
    },
    [mapExceptions],
  );

  const setHoursExceptionDate = useCallback(
    (index: number, date: string) => patchException(index, { date }),
    [patchException],
  );

  const setHoursExceptionNote = useCallback(
    (index: number, note: string) => patchException(index, { note }),
    [patchException],
  );

  /** Opening a date seeds one window; closing it drops every window, because a
   *  closed date carrying opening times is a contradiction the backend
   *  refuses to store. */
  const setHoursExceptionOpen = useCallback(
    (index: number, open: boolean) => {
      mapExceptions((entries) =>
        entries.map((entry, position) => {
          if (position !== index) return entry;
          if (!open) return { ...entry, open: false, intervals: [] };
          return {
            ...entry,
            open: true,
            intervals: entry.intervals.length
              ? entry.intervals
              : [defaultInterval()],
          };
        }),
      );
    },
    [mapExceptions],
  );

  const setHoursExceptionInterval = useCallback(
    (index: number, intervalIndex: number, patch: Partial<HoursInterval>) => {
      mapExceptions((entries) =>
        entries.map((entry, position) =>
          position === index
            ? {
                ...entry,
                intervals: entry.intervals.map((interval, at) =>
                  at === intervalIndex ? { ...interval, ...patch } : interval,
                ),
              }
            : entry,
        ),
      );
    },
    [mapExceptions],
  );

  /** A second window models a midday closure. Seeded to start where the first
   *  ended, matching the weekly grid's own behaviour. */
  const addHoursExceptionInterval = useCallback(
    (index: number) => {
      mapExceptions((entries) =>
        entries.map((entry, position) => {
          if (position !== index || entry.intervals.length >= 2) return entry;
          const previous = entry.intervals[entry.intervals.length - 1];
          return {
            ...entry,
            open: true,
            intervals: [
              ...entry.intervals,
              { from: previous?.to ?? "19:00", to: "23:00" },
            ],
          };
        }),
      );
    },
    [mapExceptions],
  );

  const removeHoursExceptionInterval = useCallback(
    (index: number, intervalIndex: number) => {
      mapExceptions((entries) =>
        entries.map((entry, position) =>
          position === index && entry.intervals.length > 1
            ? {
                ...entry,
                intervals: entry.intervals.filter(
                  (_, at) => at !== intervalIndex,
                ),
              }
            : entry,
        ),
      );
    },
    [mapExceptions],
  );

  return {
    addHoursException,
    removeHoursException,
    removePastHoursExceptions,
    setHoursExceptionDate,
    setHoursExceptionNote,
    setHoursExceptionOpen,
    setHoursExceptionInterval,
    addHoursExceptionInterval,
    removeHoursExceptionInterval,
  };
}
