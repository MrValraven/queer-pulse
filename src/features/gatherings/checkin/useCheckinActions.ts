import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isAttendanceWindowClosed } from "../api/checkInError";
import { attendeeToRow, type AttendeeRow } from "../api/events.adapters";
import { useCheckIn, useUndoCheckIn } from "../api/useCheckIn";
import { DOOR_LINGER_MS } from "./checkinLinger";
import {
  cardScanFailureHint,
  checkInFailureToast,
  undoFailureToast,
} from "./doorFailureCopy";
import {
  classifyCardScan,
  recordedStampAfterScan,
  type ScanOutcome,
} from "./scanOutcome";

/** A live-region line; a new `sequence` makes repeated words read again. */
export interface CheckinAnnouncement {
  message: string;
  sequence: number;
}

export interface CheckinActions {
  pendingSlugs: ReadonlySet<string>;
  lingeringRows: ReadonlyMap<string, AttendeeRow>;
  wasRefusedPastWindow: boolean;
  lastAnnouncement: CheckinAnnouncement | null;
  checkInByName: (attendee: AttendeeRow) => void;
  undoByName: (memberSlug: string) => Promise<boolean>;
  checkInByCard: (cardToken: string) => Promise<ScanOutcome>;
}

/**
 * The Check-in tab's mutations: by name, by card, and undo. Each call is
 * awaited on its own promise so several rows can be in flight at once and
 * each clears its own pending state (the per-call callbacks of `mutate` fire
 * for the latest call only). Lives above the focus layer, which remounts its
 * children, so nothing here resets when focus mode toggles.
 *
 * Success confirms on the row and through the live region; only failures
 * toast, so nothing stacks over the meter or the sticky search on a phone.
 */
export function useCheckinActions(slug: string): CheckinActions {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const checkIn = useCheckIn(slug);
  const undoCheckIn = useUndoCheckIn(slug);
  const [pendingSlugs, setPendingSlugs] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [lingeringRows, setLingeringRows] = useState<
    ReadonlyMap<string, AttendeeRow>
  >(() => new Map());
  // Sticky for the life of the tab: a closed attendance window is final, so
  // the reason stays on the page and no retry is offered.
  const [wasRefusedPastWindow, setWasRefusedPastWindow] = useState(false);
  const lingerTimeoutsRef = useRef(new Map<string, number>());
  const [lastAnnouncement, setLastAnnouncement] =
    useState<CheckinAnnouncement | null>(null);
  // The stamp of this tab's last check-in per guest slug, by card welcome or
  // by name (null when the server sent none). A held card re-reads sooner than
  // the repeat threshold and gets the same stamp back, so that read says
  // "already arrived"; a fresh stamp means the check-in was undone on another
  // device and made anew.
  const checkedInStampsBySlugRef = useRef(new Map<string, number | null>());

  useEffect(() => {
    const lingerTimeouts = lingerTimeoutsRef.current;
    return () => {
      for (const timeoutId of lingerTimeouts.values()) {
        window.clearTimeout(timeoutId);
      }
      lingerTimeouts.clear();
    };
  }, []);

  const setPending = (memberSlug: string, isPending: boolean) =>
    setPendingSlugs((current) => {
      const next = new Set(current);
      if (isPending) next.add(memberSlug);
      else next.delete(memberSlug);
      return next;
    });

  const stopLingering = (memberSlug: string) => {
    window.clearTimeout(lingerTimeoutsRef.current.get(memberSlug));
    lingerTimeoutsRef.current.delete(memberSlug);
    setLingeringRows((current) => {
      if (!current.has(memberSlug)) return current;
      const next = new Map(current);
      next.delete(memberSlug);
      return next;
    });
  };

  const startLingering = (attendee: AttendeeRow) => {
    window.clearTimeout(lingerTimeoutsRef.current.get(attendee.slug));
    setLingeringRows((current) =>
      new Map(current).set(attendee.slug, {
        ...attendee,
        checkedInAt: new Date(),
      }),
    );
    lingerTimeoutsRef.current.set(
      attendee.slug,
      window.setTimeout(() => stopLingering(attendee.slug), DOOR_LINGER_MS),
    );
  };

  const announce = (message: string) =>
    setLastAnnouncement((previous) => ({
      message,
      sequence: (previous?.sequence ?? 0) + 1,
    }));

  const undoByName = (memberSlug: string) => {
    stopLingering(memberSlug);
    setPending(memberSlug, true);
    return undoCheckIn
      .mutateAsync(memberSlug)
      .then(
        () => {
          checkedInStampsBySlugRef.current.delete(memberSlug);
          announce(t("gatherings:door.undoneToast"));
          return true;
        },
        (error: unknown) => {
          showToast(undoFailureToast(t, error), "error");
          return false;
        },
      )
      .finally(() => setPending(memberSlug, false));
  };

  const checkInByName = (attendee: AttendeeRow) => {
    const memberSlug = attendee.slug;
    setPending(memberSlug, true);
    // The linger carries information, so it runs under reduced motion too.
    startLingering(attendee);
    void checkIn
      .mutateAsync({ memberSlug })
      .then(
        (result) => {
          // Demo answers with nothing; its cards never read, so nothing to keep.
          if (result) {
            const serverRow = attendeeToRow(result.attendee, 0);
            checkedInStampsBySlugRef.current.set(
              memberSlug,
              serverRow.checkedInAt?.getTime() ?? null,
            );
          }
          announce(
            t("gatherings:checkin.row.checkedInToast", { name: attendee.name }),
          );
        },
        (error: unknown) => {
          stopLingering(memberSlug);
          // A closed window is final for the whole gathering: the buttons come
          // down and the reason is stated in place. Every other refusal gets
          // its own translated toast.
          if (isAttendanceWindowClosed(error)) {
            setWasRefusedPastWindow(true);
            return;
          }
          showToast(checkInFailureToast(t, error), "error");
        },
      )
      .finally(() => setPending(memberSlug, false));
  };

  const checkInByCard = async (cardToken: string): Promise<ScanOutcome> => {
    const requestStartedAt = new Date();
    try {
      const result = await checkIn.mutateAsync({ cardToken });
      if (!result) {
        // Demo has no card registry, so no card can be read there.
        return {
          kind: "refused",
          message: demoMode
            ? t("gatherings:door.scan.cardUnreadableHint")
            : t("gatherings:door.failedToast"),
        };
      }
      const attendee = attendeeToRow(result.attendee, 0);
      const checkedInStampsBySlug = checkedInStampsBySlugRef.current;
      const recordedStampMs = checkedInStampsBySlug.get(attendee.slug);
      const kind = classifyCardScan(
        attendee.checkedInAt,
        requestStartedAt,
        recordedStampMs,
      );
      const nextStampMs = recordedStampAfterScan(
        kind,
        attendee.checkedInAt,
        recordedStampMs,
      );
      if (nextStampMs !== undefined) {
        checkedInStampsBySlug.set(attendee.slug, nextStampMs);
      }
      return { kind, attendee };
    } catch (error) {
      if (isAttendanceWindowClosed(error)) {
        setWasRefusedPastWindow(true);
        return { kind: "closed" };
      }
      return { kind: "refused", message: cardScanFailureHint(t, error) };
    }
  };

  return {
    pendingSlugs,
    lingeringRows,
    wasRefusedPastWindow,
    lastAnnouncement,
    checkInByName,
    undoByName,
    checkInByCard,
  };
}
