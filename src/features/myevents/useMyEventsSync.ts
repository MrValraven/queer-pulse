import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MyEvent, Notif } from "./myEvents.types";
import { reconcileById, trackDirty } from "./myEvents.reconcile";

interface SyncDeps {
  sourceEvents: MyEvent[];
  sourceNotifs: Notif[];
}

export interface MyEventsSync {
  events: MyEvent[];
  notifs: Notif[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  setNotifs: Dispatch<SetStateAction<Notif[]>>;
  byId: (id: string) => MyEvent | undefined;
}

/**
 * The dashboard's local, optimistically-mutable mirror of the data hook's
 * `events`/`notifs` — demo mode returns the page's own mock registry, live
 * mode fetches from GET /events (per category-bearing filter) + GET
 * /event-invites. Either way the result lands here as a flat list, then
 * every RSVP/bulk/notification action keeps mutating it locally exactly as
 * before.
 *
 * Every optimistic edit flows through the wrapped setters returned here
 * (handed to the rsvp/selection sub-hooks and the local notif actions),
 * which record the touched ids as dirty via `trackDirty`. A background
 * live GET /events (or /event-invites) refetch then resyncs through
 * `reconcileById` — by id, so untouched rows adopt fresh server truth while
 * any row with a pending optimistic edit (RSVP, bulk-remove, mark-read)
 * keeps its local value. Blindly replacing on every source change was the
 * query-mirror antipattern that clobbered in-flight edits.
 */
export function useMyEventsSync({
  sourceEvents,
  sourceNotifs,
}: SyncDeps): MyEventsSync {
  const [events, setEventsRaw] = useState<MyEvent[]>(sourceEvents);
  const [notifs, setNotifsRaw] = useState<Notif[]>(sourceNotifs);
  // Ids the user has optimistically edited since the last server sync. A
  // background refetch must not clobber these rows.
  const dirtyEventIds = useRef<Set<string>>(new Set());
  const dirtyNotifIds = useRef<Set<string>>(new Set());

  // The raw setters above are reserved for the server resync below, so a
  // resync never marks a row dirty.
  const setEvents = useCallback<Dispatch<SetStateAction<MyEvent[]>>>(
    (update) =>
      setEventsRaw((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        trackDirty(prev, next, dirtyEventIds.current);
        return next;
      }),
    [],
  );
  const setNotifs = useCallback<Dispatch<SetStateAction<Notif[]>>>(
    (update) =>
      setNotifsRaw((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        trackDirty(prev, next, dirtyNotifIds.current);
        return next;
      }),
    [],
  );

  useEffect(
    () =>
      setEventsRaw((prev) =>
        reconcileById(prev, sourceEvents, dirtyEventIds.current),
      ),
    [sourceEvents],
  );
  useEffect(
    () =>
      setNotifsRaw((prev) =>
        reconcileById(prev, sourceNotifs, dirtyNotifIds.current),
      ),
    [sourceNotifs],
  );

  const byId = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events],
  );

  return { events, notifs, setEvents, setNotifs, byId };
}
