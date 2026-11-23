import { useState } from "react";
import { sx } from "./myEvents.styles";
import { ConfirmDialog } from "../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  getCalendarFeedUrl,
  revokeCalendarFeedToken,
} from "./api/calendarFeed.api";
import { useMyEvents } from "./MyEventsContext";
import { isInMonth } from "./myEvents.helpers";
import { downloadICS } from "./myEvents.ics";
import { myEventsActionErrorMessage } from "./myEvents.rsvpErrors";

/** Subscribe-to-feed and export-this-month buttons under the calendar. */
export function CalendarSubscribe() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { toast, viewM, viewY, events } = useMyEvents();
  const monthLong = fmt.date(new Date(viewY, viewM, 1), { month: "long" });
  const copyFeedUrl = async (url: string, successMessage: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast(t("myevents:calSubscribe.feedCopyFailToast"), "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(successMessage, "success");
    } catch {
      // The browser refused the clipboard write; the link itself was made.
      toast(t("myevents:calSubscribe.feedCopyFailToast"), "info");
    }
  };
  // Demo mode has no real backend token to mint, so it keeps the toast-only
  // affordance the prototype always had; live mode mints the caller's real
  // signed feed URL (`GET /me/calendar-feed-token`) and copies IT — a real,
  // repeatedly-pollable webcal-style subscription, not a one-time snapshot,
  // so "auto-syncs" (the button's own subtitle) is an honest claim.
  const subscribeToFeed = async () => {
    if (demoMode) {
      toast(t("myevents:calSubscribe.feedToast"), "success");
      return;
    }
    let url: string;
    try {
      url = await getCalendarFeedUrl();
    } catch (error) {
      // The feed link was never made: name why (offline, signed out, a fault).
      toast(myEventsActionErrorMessage(error, t), "error");
      return;
    }
    await copyFeedUrl(url, t("myevents:calSubscribe.feedToast"));
  };
  // SEC-18. Switches the current feed URL off (`DELETE /me/calendar-feed-token`)
  // and mints a fresh one, so a leaked link stops publishing the member's
  // events. Two steps with their own failure lines: when only the second step
  // fails the old link is already dead, and the toast says so.
  const resetFeedLink = async () => {
    if (demoMode) {
      toast(t("myevents:calSubscribe.resetToast"), "success");
      return;
    }
    try {
      await revokeCalendarFeedToken();
    } catch (error) {
      toast(myEventsActionErrorMessage(error, t), "error");
      return;
    }
    let url: string;
    try {
      url = await getCalendarFeedUrl();
    } catch {
      toast(t("myevents:calSubscribe.resetMintFailToast"), "error");
      return;
    }
    await copyFeedUrl(url, t("myevents:calSubscribe.resetToast"));
  };
  const exportMonth = () => {
    // `isInMonth`, the same reading the grid and the agenda use, so the export
    // and the screen agree. It answers on every day the gathering RUNS, which
    // matters twice over: year AND month, so the same month from another year
    // stays out (that bug shipped once, under a filename and a toast naming
    // only the month in view), and a festival running 29 September to 2
    // October reaches BOTH months. Bucketing on the opening day alone left a
    // hole in the member's calendar app on days the grid said they were
    // booked.
    const monthEvents = events.filter((event) =>
      isInMonth(event, viewY, viewM),
    );
    const monthSlug = fmt
      .date(new Date(viewY, viewM, 1), { month: "long" })
      .toLowerCase();
    downloadICS(`queerpulse-${monthSlug}-${viewY}.ics`, monthEvents, t);
    toast(
      t("myevents:calSubscribe.exportToast", { month: monthLong }),
      "success",
    );
  };
  return (
    <div className={sx("cal-sub")}>
      <button
        type="button"
        className={sx("cal-sub-btn")}
        onClick={() => void subscribeToFeed()}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          aria-hidden
        >
          <circle
            cx="3.5"
            cy="12.5"
            r="1.3"
            fill="currentColor"
            stroke="none"
          />
          <path d="M3 8.2a4.8 4.8 0 0 1 4.8 4.8M3 4.2a8.8 8.8 0 0 1 8.8 8.8" />
        </svg>
        <span className={sx("csb-t")}>
          {t("myevents:calSubscribe.feedTitle")}
          <span className={sx("csb-sub")}>
            {t("myevents:calSubscribe.feedSub")}
          </span>
        </span>
      </button>
      <button type="button" className={sx("cal-sub-btn")} onClick={exportMonth}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 2.5v8M5 7.5 8 10.5l3-3M3 13h10" />
        </svg>
        <span className={sx("csb-t")}>
          {t("myevents:calSubscribe.exportTitle")}
          <span className={sx("csb-sub")}>
            {t("myevents:calSubscribe.exportSub")}
          </span>
        </span>
      </button>
      <ResetFeedLinkButton onReset={resetFeedLink} />
    </div>
  );
}

/** "Reset calendar link": asks first, because every calendar app on the
 *  current link stops updating the moment the member confirms. */
function ResetFeedLinkButton({ onReset }: { onReset: () => Promise<void> }) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const confirmReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
      setIsConfirmOpen(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className={sx("cal-sub-btn")}
        onClick={() => setIsConfirmOpen(true)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5v2.5h-2.5" />
        </svg>
        <span className={sx("csb-t")}>
          {t("myevents:calSubscribe.resetTitle")}
          <span className={sx("csb-sub")}>
            {t("myevents:calSubscribe.resetSub")}
          </span>
        </span>
      </button>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void confirmReset()}
        title={t("myevents:calSubscribe.resetConfirmTitle")}
        description={t("myevents:calSubscribe.resetConfirmBody")}
        confirmLabel={t("myevents:calSubscribe.resetConfirmLabel")}
        loading={isResetting}
        initialFocus="cancel"
      />
    </>
  );
}
