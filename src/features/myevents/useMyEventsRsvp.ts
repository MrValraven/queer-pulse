import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import type { MyEvent } from "./myEvents.types";
import { parseDate, timeStr } from "./myEvents.helpers";

interface RsvpDeps {
  events: MyEvent[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  byId: (id: string) => MyEvent | undefined;
  toast: (msg: string, type?: "success" | "info") => void;
  toastAction: (msg: string, action: ToastAction) => void;
  t: TFunction;
  fmt: Formatters;
  /** Current reminder-lead preference, for the "reminder set" toast copy. */
  reminderLead: string;
  /** Closes the row "more" menu (owned by the modals sub-hook). */
  closeMore: () => void;
}

export interface MyEventsRsvp {
  toggleReminder: (id: string) => void;
  setMaybe: (id: string) => void;
  setGoing: (id: string) => void;
  rsvpSaved: (id: string) => void;
  acceptInvite: (id: string) => void;
  declineInvite: (id: string) => void;
  cantGo: (id: string) => void;
  leaveWaitlist: (id: string) => void;
  softRemove: (id: string, msg: string) => void;
  removingId: string | null;
  confirm: { open: boolean; title: string; meta: string };
  closeConfirm: () => void;
  scope: { open: boolean; eventId: string | null; title: string };
  closeScope: () => void;
  scopeChoice: (which: "one" | "all") => void;
}

/**
 * RSVP lifecycle: reminders, maybe/going toggles, invite accept/decline,
 * can't-go / leave-waitlist (with the series-scope prompt), and the shared
 * soft-remove-with-undo. Confirm + scope modal state live here too.
 */
export function useMyEventsRsvp({
  events,
  setEvents,
  byId,
  toast,
  toastAction,
  t,
  fmt,
  reminderLead,
  closeMore,
}: RsvpDeps): MyEventsRsvp {
  const [confirm, setConfirm] = useState({ open: false, title: "", meta: "" });
  const [scope, setScope] = useState<{
    open: boolean;
    eventId: string | null;
    title: string;
  }>({ open: false, eventId: null, title: "" });
  const [removingId, setRemovingId] = useState<string | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear the pending soft-remove timer on unmount so it can't fire late.
  useEffect(
    () => () => {
      clearTimeout(removeTimer.current);
    },
    [],
  );

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
    [events, setEvents, t, toast, toastAction],
  );

  // ── rsvp lifecycle ────────────────────────────────
  const patch = useCallback(
    (id: string, fn: (e: MyEvent) => MyEvent) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
    },
    [setEvents],
  );

  const toggleReminder = useCallback(
    (id: string) => {
      const ev = byId(id);
      if (!ev) return;
      const next = !ev.reminder;
      patch(id, (e) => ({ ...e, reminder: next }));
      toast(
        next
          ? t("myevents:toast.reminderSet", { lead: reminderLead })
          : t("myevents:toast.reminderOff"),
        "info",
      );
    },
    [byId, patch, reminderLead, t, toast],
  );

  const setMaybe = useCallback(
    (id: string) => {
      patch(id, (e) => ({ ...e, maybe: true }));
      closeMore();
      toast(t("myevents:toast.markedMaybe"), "info");
    },
    [patch, closeMore, t, toast],
  );
  const setGoing = useCallback(
    (id: string) => {
      patch(id, (e) => ({ ...e, maybe: false }));
      closeMore();
      toast(t("myevents:toast.fullyIn"), "success");
    },
    [patch, closeMore, t, toast],
  );

  const rsvpSaved = useCallback(
    (id: string) => {
      patch(id, (e) => ({
        ...e,
        category: "going",
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
        category: "going",
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
        setScope({ open: true, eventId: id, title: ev.title });
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
      const id = scope.eventId;
      setScope((s) => ({ ...s, open: false }));
      if (!id) return;
      if (which === "one") softRemove(id, t("myevents:toast.skippedThisOne"));
      else softRemove(id, t("myevents:toast.leftWholeSeries"));
    },
    [scope.eventId, softRemove, t],
  );

  return {
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
    confirm,
    closeConfirm,
    scope,
    closeScope,
    scopeChoice,
  };
}
