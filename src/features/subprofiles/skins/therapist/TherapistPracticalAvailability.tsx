import { FiCalendar } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MAX_QUEUE_SQUARES } from "./therapistPractical.data";
import { PracticalCell, PracticalRow } from "./TherapistPracticalCells";
import { PracticalEditLink } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import type { TherapistView } from "./therapistView";
import styles from "./TherapistPractical.module.css";

/** Owner-typed open slots, shown as display chips. Nothing books from here:
 *  the note asks people to mention a slot in their message. */
function OpenSlots({ slots, name }: { slots: string[]; name: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.live}>
      <p className={styles.liveLabel}>
        {t("subprofiles:therapist.practical.availability.slotsLabel")}
      </p>
      <ul className={styles.slots}>
        {slots.map((slot, index) => (
          <li key={`${slot}-${index}`} className={styles.slot}>
            <FiCalendar className={styles.slotIcon} aria-hidden="true" />
            {slot}
          </li>
        ))}
      </ul>
      <p className={styles.hint}>
        {t("subprofiles:therapist.practical.availability.slotsNote", { name })}
      </p>
    </div>
  );
}

/** Lower-cases the first letter so "About 2 a fortnight" reads mid-sentence. */
function midSentence(text: string): string {
  return text.charAt(0).toLocaleLowerCase() + text.slice(1);
}

interface WaitlistProps {
  waiting: number;
  moves: string;
  name: string;
}

/** Waitlist size, your rough place in it, and one square per person ahead
 *  with the last square standing for you. */
function Waitlist({ waiting, moves, name }: WaitlistProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const position = format.number(waiting + 1);
  const squaresAhead = Math.min(Math.max(0, waiting), MAX_QUEUE_SQUARES);
  return (
    <div className={styles.live}>
      <p className={styles.liveLabel}>
        {t("subprofiles:therapist.practical.availability.waitlistLabel")}
      </p>
      <div className={styles.queue}>
        <p className={styles.big}>
          {format.number(waiting)}
          <small>
            {t("subprofiles:therapist.practical.availability.waiting")}
          </small>
        </p>
        <p className={styles.queueText}>
          {moves
            ? t("subprofiles:therapist.practical.availability.positionMoves", {
                position,
                moves: midSentence(moves),
              })
            : t("subprofiles:therapist.practical.availability.position", {
                position,
              })}
        </p>
      </div>
      <div className={styles.queueBar} aria-hidden="true">
        {Array.from({ length: squaresAhead }, (_unused, index) => (
          <span key={index} className={styles.queueSquare} />
        ))}
        <span className={styles.queueSquareYou} />
      </div>
      <p className={styles.hint}>
        {t("subprofiles:therapist.practical.availability.waitNote", { name })}
      </p>
    </div>
  );
}

/** Availability follows the status: open shows the time to a first session
 *  and the open slots; wait shows the waitlist (or a plain waitlist line
 *  without a count); closed says so. Hours show in every status. */
export function AvailabilityCell({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const { hours, openSlots, waiting, status } = view;
  const isOpen = status === "open";
  const isWaiting = status === "wait";
  const headline = isOpen ? view.availabilityHeadline : "";
  const hasOpenSlots = isOpen && openSlots.length > 0;
  const hasAnything = headline !== "" || hours.length > 0 || hasOpenSlots;
  return (
    <PracticalCell
      icon={FiCalendar}
      title={t("subprofiles:therapist.practical.availability.title")}
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.availability} />
      <div className={styles.availabilityBody}>
        <div className={styles.availabilityFacts}>
          {status === "closed" && (
            <p className={styles.missing}>
              {t("subprofiles:therapist.practical.availability.closed")}
            </p>
          )}
          {isWaiting && waiting === null && (
            <p className={styles.missing}>
              {t("subprofiles:therapist.practical.availability.waitOnly")}
            </p>
          )}
          {isWaiting && waiting === null && view.waitNote && (
            <p className={styles.hint}>{view.waitNote}</p>
          )}
          {isOpen && !hasAnything && (
            <p className={styles.missing}>
              {t("subprofiles:therapist.practical.availability.missing")}
            </p>
          )}
          {headline && (
            <p className={styles.big}>
              {headline}
              <small>
                {t("subprofiles:therapist.practical.availability.untilFirst")}
              </small>
            </p>
          )}
          {hours.length > 0 && (
            <dl className={styles.rows}>
              {hours.map((line, index) => (
                <PracticalRow
                  key={`${line.label}-${index}`}
                  label={line.label}
                  value={line.value}
                />
              ))}
            </dl>
          )}
        </div>
        {hasOpenSlots && <OpenSlots slots={openSlots} name={view.firstName} />}
        {isWaiting && waiting !== null && (
          <Waitlist
            waiting={waiting}
            moves={view.waitMoves}
            name={view.firstName}
          />
        )}
      </div>
    </PracticalCell>
  );
}
