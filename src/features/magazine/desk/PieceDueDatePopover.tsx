import { useId, useRef, useState } from "react";
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
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import { mediaMax } from "../../../shared/theme/breakpoints";
import styles from "./PieceRow.module.css";

export interface PieceDueDatePopoverProps {
  /** The row title's id. "Set date" is described by it, so the button is
   *  announced with its piece, and focus moves to the title once a day
   *  saves, since the saved date replaces this button. */
  titleId: string;
  /** Saves the picked ISO day. Rejects when the save fails. */
  onSave: (dueOn: string) => Promise<void>;
}

// `mode="date"` never fires these three, but `DatePickerPopover[Content]`
// takes them unconditionally.
function ignoreMonth(): void {}
function ignoreTime(): void {}
function ignorePreset(): void {}

/**
 * The pipeline row's "Set date" for an undated piece: a muted text button
 * that opens the calendar popover `DatePicker` uses, anchored under the
 * button (a bottom sheet on phones), the same pattern as the pulse line's
 * `IssueCloseDatePopover`. Picking a day saves it right away and closes the
 * popover; Escape and an outside press close it and return focus to the
 * button. Days before today are off the calendar, since a new due day in
 * the past would only mark the piece late.
 *
 * While a save runs the button is `aria-disabled` and ignores presses; a
 * natively disabled button would drop the focus `close()` just put on it.
 */
export function PieceDueDatePopover({
  titleId,
  onSave,
}: PieceDueDatePopoverProps) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = `${useId()}-due-date-popover`;
  const dialogLabel = t("magazine:desk.pieceRow.setDateDialogLabel");
  const todayIso = formatIsoDate(todayPlain());

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // The desktop popover portals to `document.body`, so it needs its own
  // outside-press dismiss; the phone sheet owns one. `DatePickerPopover`
  // already handles Escape and calls `onClose`.
  useOutsideDismiss(isOpen && !isMobile, triggerRef, close, {
    additionalInsideRef: popoverRef,
  });

  const commit = async (dueOn: string) => {
    close();
    setIsSaving(true);
    try {
      await onSave(dueOn);
      showToast(
        t("magazine:desk.pieceRow.dueSavedToast", {
          date: formatDate(dueOn, language),
        }),
        "success",
      );
      // The countdown takes this button's place on the next render. The row
      // title holds focus meanwhile, so it never falls back to the page.
      if (document.activeElement === triggerRef.current) {
        document.getElementById(titleId)?.focus();
      }
    } catch {
      // The piece mutation's global error toast already reports the failure,
      // and the button stays for another try.
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectDay = (dueOn: string) => {
    void commit(dueOn);
  };
  const handleToday = () => {
    void commit(todayIso);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.setDate}
        aria-describedby={titleId}
        aria-disabled={isSaving || undefined}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen && !isMobile ? popoverId : undefined}
        onClick={() => {
          if (!isSaving) setIsOpen((isCurrentlyOpen) => !isCurrentlyOpen);
        }}
      >
        {t("magazine:desk.pieceRow.setDate")}
      </button>
      {isOpen && isMobile && (
        <ModalSheet onClose={close} ariaLabel={dialogLabel}>
          <DatePickerPopoverContent
            mode="date"
            value={null}
            locale={language}
            min={todayIso}
            onSelectDay={handleSelectDay}
            onSelectMonth={ignoreMonth}
            onTimeChange={ignoreTime}
            onPresetSelect={ignorePreset}
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
          value={null}
          dialogLabel={dialogLabel}
          locale={language}
          min={todayIso}
          onSelectDay={handleSelectDay}
          onSelectMonth={ignoreMonth}
          onTimeChange={ignoreTime}
          onPresetSelect={ignorePreset}
          onToday={handleToday}
          onClose={close}
        />
      )}
    </>
  );
}
