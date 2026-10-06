import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { ModalSheet } from "../../../shared/components/ui";
import { DatePickerPopover } from "../../../shared/components/ui/DatePickerPopover";
import { DatePickerPopoverContent } from "../../../shared/components/ui/DatePickerPopoverContent";
import {
  formatIsoDate,
  todayPlain,
} from "../../../shared/components/ui/plainDate";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useIssueCloseDate } from "../api/useIssueCloseDate";
import styles from "./DeskPulseHeader.module.css";

export interface IssueCloseDatePopoverProps {
  issueNumber: string;
  /** Closes must land on or before this day when the issue already has one. */
  publishedOn?: string | null;
  /** The close day already set (ISO), so the calendar opens on it when the
   *  trigger is the countdown itself. Unset for an issue with none. */
  closesOn?: string | null;
  /** The trigger's content. Defaults to "Set close date"; the pulse line
   *  passes its "9 days left" countdown here, so the countdown is the door to
   *  moving the date. */
  children?: ReactNode;
  /** Called once a picked day has saved. */
  onSaved?: () => void;
  /** Moves focus onto the trigger when it turns true (the countdown that
   *  replaces "Set close date" after the first save), then reports it. */
  shouldTakeFocus?: boolean;
  onFocusTaken?: () => void;
}

/**
 * The pulse line's own way to set or move an issue's close date: a quiet text
 * button ("Set close date" when the issue has none, the "9 days left"
 * countdown when it has one) that opens the same calendar popover
 * `DatePicker` uses for its own trigger, anchored under this button instead
 * of a full date field. Picking a day saves it through `useIssueCloseDate`
 * right away (there is no draft to confirm, unlike the issue-production
 * page's `PublishDateCard` row) and closes the popover; the mutation
 * invalidates the issue queries `DeskIssuePulse` reads, so the pulse line
 * swaps this button for the real countdown on its own re-render.
 *
 * While a save runs the trigger is `aria-disabled` and ignores presses; a
 * natively disabled button would drop the focus `close()` just put on it.
 */
export function IssueCloseDatePopover({
  issueNumber,
  publishedOn,
  closesOn = null,
  children,
  onSaved,
  shouldTakeFocus = false,
  onFocusTaken,
}: IssueCloseDatePopoverProps) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  // `closesOn` already arrives as a prop from the pulse line, which reads it
  // off the issues list it already has, so this popover only ever saves.
  const { saveClosesOn, isSaving } = useIssueCloseDate(issueNumber, {
    isQueryEnabled: false,
  });
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const popoverId = `${baseId}-close-date-popover`;
  const dialogLabel = t("magazine:desk.pulse.setCloseDateDialogLabel");

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!shouldTakeFocus) return;
    triggerRef.current?.focus();
    onFocusTaken?.();
  }, [shouldTakeFocus, onFocusTaken]);

  // Mirrors `SingleDatePicker`'s own desktop branch: the desktop popover
  // portals to `document.body` and needs its own outside-press dismiss here,
  // while the mobile sheet below already owns one (a press inside it would
  // otherwise read as "outside"). No `onEscape`: `DatePickerPopover` already
  // attaches its own Escape handler and calls `onClose`, so adding one here
  // too would just call `close()` twice on one press.
  useOutsideDismiss(isOpen && !isMobile, triggerRef, close, {
    additionalInsideRef: popoverRef,
  });

  const commit = async (iso: string) => {
    // The calendar grid's `max` already refuses these days, but the "Today"
    // shortcut bypasses `min`/`max` by design (see `DatePicker.tsx`'s own
    // `handleToday`), so an issue whose publish date has already passed can
    // otherwise save a close date after it with no warning at all. Re-check
    // here, the same guard `NewIssueModal` and `PublishDateCard` run before
    // saving, and leave the popover open so a valid day is still one click
    // away.
    if (publishedOn && iso > publishedOn) {
      showToast(t("magazine:desk.closeDate.afterPublishError"), "error");
      return;
    }
    close();
    try {
      await saveClosesOn(iso);
      showToast(
        t("magazine:desk.pulse.closeDateSavedToast", {
          date: formatDate(iso, intlLocale(language)),
        }),
        "success",
      );
      onSaved?.();
    } catch {
      showToast(t("magazine:desk.newIssue.saveFailedError"), "error");
    }
  };

  const handleSelectDay = (iso: string) => {
    void commit(iso);
  };
  // mode="date" never fires these three, but `DatePickerPopover[Content]`
  // takes them unconditionally.
  const handleSelectMonth = () => {};
  const handleTimeChange = () => {};
  const handlePresetSelect = () => {};
  const handleToday = () => {
    void commit(formatIsoDate(todayPlain()));
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.setCloseDate}
        aria-disabled={isSaving || undefined}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        onClick={() => {
          if (!isSaving) setIsOpen((wasOpen) => !wasOpen);
        }}
        data-tap-target
      >
        {children ?? t("magazine:desk.pulse.setCloseDate")}
      </button>
      {isOpen && isMobile && (
        <ModalSheet onClose={close} ariaLabel={dialogLabel}>
          <DatePickerPopoverContent
            mode="date"
            value={closesOn}
            locale={language}
            max={publishedOn ?? undefined}
            onSelectDay={handleSelectDay}
            onSelectMonth={handleSelectMonth}
            onTimeChange={handleTimeChange}
            onPresetSelect={handlePresetSelect}
            onToday={handleToday}
          />
        </ModalSheet>
      )}
      {isOpen && !isMobile && (
        <DatePickerPopover
          id={popoverId}
          anchorRef={triggerRef}
          popoverRef={popoverRef}
          mode="date"
          value={closesOn}
          dialogLabel={dialogLabel}
          locale={language}
          max={publishedOn ?? undefined}
          onSelectDay={handleSelectDay}
          onSelectMonth={handleSelectMonth}
          onTimeChange={handleTimeChange}
          onPresetSelect={handlePresetSelect}
          onToday={handleToday}
          onClose={close}
        />
      )}
    </>
  );
}
