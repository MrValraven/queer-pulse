import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiRotateCcw } from "react-icons/fi";
import { MdAccessible } from "react-icons/md";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { IconButton } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import { AttendeeNeeds } from "../AttendeeNeeds";
import { EASE, keepOnFrameLoop } from "./checkinMotion";
import styles from "./CheckinGuestRow.module.css";
import chipStyles from "./CheckinGuestRowChip.module.css";
import { useArrivalFlash } from "./useArrivalFlash";

interface CheckinGuestRowProps {
  attendee: AttendeeRow;
  isPending: boolean;
  /** False once this gathering is past its attendance window. */
  canCheckIn: boolean;
  /** The host's own RSVP question, which labels this guest's answer. */
  customRsvpQuestion?: string | null;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
}

/**
 * One guest on the Check-in tab.
 *
 * Before arrival the whole row is the check-in target: a full-size button
 * sits over it, so a host with a queue in front of them can hit the name, the
 * avatar or the pill. The DOM under that button stays the same before and
 * after the tap, which is what lets the right-hand slot crossfade from the
 * "Check in" pill to the "Arrived" chip in place.
 *
 * Once the attendance window has closed the row stops being a button and the
 * pill goes away, because the server refuses the write. Undo stays on an
 * arrived row: it removes a stamp and the endpoint keeps honouring it.
 */
export function CheckinGuestRow({
  attendee,
  isPending,
  canCheckIn,
  customRsvpQuestion,
  onCheckIn,
  onUndo,
}: CheckinGuestRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const arrivedAt = attendee.checkedInAt ?? null;
  const isFlashing = useArrivalFlash(arrivedAt ? arrivedAt.getTime() : null);
  const isTappable = !arrivedAt && canCheckIn;
  const guestCount = attendee.guestCount ?? 0;
  const hasAccessNeeds = Boolean(attendee.accessNeeds?.trim());
  const hasMeta = Boolean(attendee.pronouns) || guestCount > 0;
  const arrivedTime = arrivedAt ? format.time(arrivedAt) : "";
  const swapTransition = {
    duration: reducedMotion ? 0.12 : 0.18,
    ease: EASE,
  };
  // Reduced motion swaps pill and chip instantly: the chip mounts at full
  // opacity, so no fade can restart and blink it after it is painted.
  const swapInitial = reducedMotion ? false : { opacity: 0 };
  const swapExit = reducedMotion ? undefined : { opacity: 0 };
  const rowClassName = [styles.row, isFlashing && styles.flash]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClassName} data-pending={isPending || undefined}>
      {isTappable && (
        <button
          type="button"
          className={styles.rowHit}
          data-checkin-slug={attendee.slug}
          aria-label={t("gatherings:door.checkInAria", { name: attendee.name })}
          disabled={isPending}
          onClick={() => onCheckIn(attendee.slug)}
        />
      )}
      <span
        className={styles.avatar}
        style={{ background: attendee.background, color: attendee.color }}
        aria-hidden
      >
        {attendee.initials}
      </span>
      <div className={styles.info}>
        <span className={styles.name}>{attendee.name}</span>
        {hasMeta && (
          <span className={styles.meta}>
            {attendee.pronouns && <span>{attendee.pronouns}</span>}
            {guestCount > 0 && (
              <span>
                {t("gatherings:checkin.row.guests", { count: guestCount })}
              </span>
            )}
          </span>
        )}
        {hasAccessNeeds && (
          <span className={styles.accessTag}>
            <MdAccessible aria-hidden />
            {t("gatherings:checkin.row.accessNeeds")}
          </span>
        )}
        <AttendeeNeeds
          attendee={attendee}
          customQuestion={customRsvpQuestion}
          shouldShowGuestCount={false}
        />
      </div>
      {/* Pill and chip share one grid cell and crossfade in place, so the
          row's height never changes and nothing moves past its edge. */}
      <span className={styles.slot}>
        <AnimatePresence initial={false}>
          {arrivedAt ? (
            <m.span
              key="arrived"
              className={chipStyles.arrived}
              onUpdate={keepOnFrameLoop}
              initial={swapInitial}
              animate={{ opacity: 1 }}
              exit={swapExit}
              transition={swapTransition}
            >
              <span className={chipStyles.chip}>
                <FiCheck
                  aria-hidden
                  className={
                    isFlashing && !reducedMotion
                      ? chipStyles.checkDraw
                      : undefined
                  }
                />
                {/* A narrow list hides this label visually and shows the
                    time alone; screen readers always hear the label. */}
                <span className={chipStyles.chipLabel}>
                  {t("gatherings:door.arrivedAt", { time: arrivedTime })}
                </span>
                <span className={chipStyles.chipTime} aria-hidden>
                  {arrivedTime}
                </span>
              </span>
              <IconButton
                size="sm"
                data-undo-slug={attendee.slug}
                aria-label={t("gatherings:door.undoAria", {
                  name: attendee.name,
                })}
                disabled={isPending}
                onClick={() => onUndo(attendee.slug)}
              >
                <FiRotateCcw aria-hidden />
              </IconButton>
            </m.span>
          ) : isTappable ? (
            <m.span
              key="pill"
              className={styles.swapItem}
              onUpdate={keepOnFrameLoop}
              aria-hidden
              initial={swapInitial}
              animate={{ opacity: 1 }}
              exit={swapExit}
              transition={swapTransition}
            >
              {/* The visible pill sits inside the motion wrapper, so its
                  pending dim is not overridden by the swap's opacity. */}
              <span className={styles.pill}>
                {t("gatherings:door.checkInCta")}
              </span>
            </m.span>
          ) : null}
        </AnimatePresence>
      </span>
    </div>
  );
}
