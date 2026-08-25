import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { MyEvent } from "./myEvents.types";

interface SoftRemoveDeps {
  events: MyEvent[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  toast: (msg: string, type?: "success" | "info") => void;
  toastAction: (msg: string, action: ToastAction) => void;
  t: TFunction;
}

export interface MyEventsSoftRemove {
  softRemove: (id: string, msg: string) => void;
  removingId: string | null;
}

/**
 * Soft-remove-with-undo, shared by `cantGo`/`leaveWaitlist`/`declineInvite`
 * in `useMyEventsRsvp`: flags the row as removing, then (after a short
 * delay) drops it from `events` behind an "Undo" toast that re-inserts it at
 * its original index.
 *
 * NOTE on "Undo": this purely restores the LOCAL card — every caller only
 * invokes this from the real cancel/decline mutation's `onSuccess`, so the
 * real call has ALREADY succeeded by the time this timer's toast (and its
 * Undo button) appear, and re-inserting the row here does not re-issue a
 * real RSVP/invite-response call to match. Declined invites specifically
 * CAN'T be un-declined server-side (the backend 409s a second response to an
 * already-answered invite), so a true undo isn't available for every caller
 * of this helper uniformly. Scoped out of this pass; flagged here rather
 * than left silently surprising.
 */
export function useMyEventsSoftRemove({
  events,
  setEvents,
  toast,
  toastAction,
  t,
}: SoftRemoveDeps): MyEventsSoftRemove {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear the pending soft-remove timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(removeTimer.current);
    },
    [],
  );

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
    [events, setEvents, t, toast, toastAction],
  );

  return { softRemove, removingId };
}
