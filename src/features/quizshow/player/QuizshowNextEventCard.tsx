import { useState } from "react";
import { FiCalendar, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowNextEvent } from "../../../shared/contracts/quizshow";
import { useRsvp } from "../../gatherings/api/useEventMutations";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { rsvpErrorMessage } from "../../gatherings/rsvpErrors";
import styles from "./QuizshowPlayerEnd.module.css";

/** The two answers `useGatheringRsvp` words alike: a seat, or a waitlist place. */
type RsvpStanding = "going" | "waitlisted";

/**
 * The next event in this series (item 61), with an RSVP straight from the end
 * screen through the events RSVP mutation. A refusal names its cause through
 * the events RSVP copy.
 */
export function QuizshowNextEventCard({
  nextEvent,
}: {
  nextEvent: QuizshowNextEvent;
}) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const rsvp = useRsvp(nextEvent.slug);
  // What the server answered: a full event puts the member on its waitlist.
  const [rsvpStanding, setRsvpStanding] = useState<RsvpStanding | null>(null);
  // Both lines read on every render, so the events catalog is loaded before an RSVP answers.
  const goingLine = t("gatherings:rsvpControl.goingToast");
  const waitlistLine = t("gatherings:rsvpControl.waitlistToast");
  const hasRsvped = rsvpStanding !== null;

  const sendRsvp = () => {
    rsvp.mutate("going", {
      onSuccess: (status) =>
        setRsvpStanding(status === "waitlisted" ? "waitlisted" : "going"),
      onError: (error) =>
        showToast(rsvpErrorMessage(error, t, language), "error"),
    });
  };

  return (
    <section className={styles.nextEvent}>
      <p className={styles.eyebrow}>{t("quizshow:player.nextEvent.label")}</p>
      <Link
        className={styles.nextEventTitle}
        to={gatheringPath(nextEvent.slug)}
      >
        {nextEvent.title}
      </Link>
      <p className={styles.nextEventDate}>
        <FiCalendar aria-hidden="true" focusable="false" fill="none" />
        {format.date(new Date(nextEvent.startAt))}
      </p>
      <Collapse isOpen={!hasRsvped}>
        <Button
          variant="stage-ghost"
          className={styles.nextEventButton}
          disabled={rsvp.isPending}
          onClick={sendRsvp}
        >
          {t("quizshow:player.nextEvent.rsvp")}
        </Button>
      </Collapse>
      <Collapse isOpen={hasRsvped}>
        <p className={styles.nextEventGoing} role="status">
          <FiCheck aria-hidden="true" focusable="false" fill="none" />
          {rsvpStanding === "waitlisted" ? waitlistLine : goingLine}
        </p>
      </Collapse>
    </section>
  );
}
