import { AnimatePresence, m } from "motion/react";
import { FiUser } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import styles from "./GatheringRsvpGuestCountField.module.css";

/** The most seats drawn as icons. Past it a "+N" stands in for the rest, so a
 *  large party still fits one line on a phone. */
const MAX_VISIBLE_SEATS = 6;

const SEAT_HIDDEN = { opacity: 0, scale: 0.6 };
const SEAT_SHOWN = { opacity: 1, scale: 1 };

type SeatKind = "member" | "guest" | "invite";

const SEAT_CLASS: Record<SeatKind, string | undefined> = {
  member: styles.seatMember,
  guest: styles.seatGuest,
  invite: styles.seatInvite,
};

/** The seats in drawing order: the member, their guests, then the seats
 *  member invites hold. Keys count within a kind, so a guest added before
 *  the invites never re-keys an invite seat. */
function seatList(guestCount: number, inviteSeatCount: number) {
  return [
    { kind: "member" as const, key: "member" },
    ...Array.from({ length: guestCount }, (_, index) => ({
      kind: "guest" as const,
      key: `guest-${index}`,
    })),
    ...Array.from({ length: inviteSeatCount }, (_, index) => ({
      kind: "invite" as const,
      key: `invite-${index}`,
    })),
  ];
}

/**
 * One small person icon per seat the RSVP takes: the member's own seat is
 * filled in ink, each guest's is an outline after it, and each seat a member
 * invite holds (sent and still open, or picked to send on Save) is a dashed
 * coral outline after those. Seats fade and scale in or out as the counts
 * change, and sit still under reduced motion. Purely visual: the lines
 * around it already say the counts in words.
 */
export function GuestSeatIcons({
  guestCount,
  inviteSeatCount = 0,
}: {
  guestCount: number;
  inviteSeatCount?: number;
}) {
  const { reducedMotion } = useMotionPrefs();
  const seats = seatList(guestCount, inviteSeatCount);
  const visibleSeats = seats.slice(0, MAX_VISIBLE_SEATS);
  const hiddenSeatCount = seats.length - visibleSeats.length;
  const seatTransition = { duration: reducedMotion ? 0 : 0.18 };

  return (
    <span className={styles.seats} aria-hidden>
      <AnimatePresence initial={false}>
        {visibleSeats.map((seat) => (
          <m.span
            key={seat.key}
            className={SEAT_CLASS[seat.kind]}
            initial={SEAT_HIDDEN}
            animate={SEAT_SHOWN}
            exit={SEAT_HIDDEN}
            transition={seatTransition}
          >
            {/* Feather icons paint black when `fill` is left undefined, so
                every seat kind sets it explicitly. */}
            <FiUser fill={seat.kind === "member" ? "currentColor" : "none"} />
          </m.span>
        ))}
        {hiddenSeatCount > 0 && (
          <m.span
            key="overflow"
            className={styles.seatOverflow}
            initial={SEAT_HIDDEN}
            animate={SEAT_SHOWN}
            exit={SEAT_HIDDEN}
            transition={seatTransition}
          >
            {`+${hiddenSeatCount}`}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
