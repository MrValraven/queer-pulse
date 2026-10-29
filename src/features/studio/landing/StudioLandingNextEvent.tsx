import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { Button, ImageSlot } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import type { StudioLandingNextEventView } from "../api/studioLanding.adapters";
import styles from "./StudioLandingProof.module.css";

const AVATAR_SIZE_PX = 44;

/**
 * "Next on stage": the next public event with a Studio artist. Events are
 * gated, so a visitor's link goes to the request-invite path and a member's
 * opens the event. The persona name is plain text for both.
 */
export function StudioLandingNextEvent({
  event,
}: {
  event: StudioLandingNextEventView;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { loggedIn } = useAuth();
  const dateText = fmt.date(event.startAt, {
    timeZone: event.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeText = fmt.time(event.startAt, {
    timeZone: event.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const whereText = event.isOnline
    ? t("studio:landing.nextEvent.online")
    : event.area;
  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>{t("studio:landing.nextEvent.eyebrow")}</p>
      <h3 className={styles.eventTitle}>{event.title}</h3>
      <p className={styles.when}>
        {dateText}
        {" · "}
        {timeText}
      </p>
      {whereText ? <p className={styles.where}>{whereText}</p> : null}
      <div className={styles.artist}>
        <ImageSlot
          src={event.artist.avatarUrl ?? undefined}
          alt=""
          shape="circle"
          tint={event.artist.tint}
          initials={event.artist.initials}
          width={AVATAR_SIZE_PX}
          height={AVATAR_SIZE_PX}
        />
        <span className={styles.artistName}>
          {t("studio:landing.nextEvent.with", { artist: event.artist.name })}
        </span>
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        to={
          loggedIn
            ? gatheringPath(event.slug)
            : requestInvitePath("studio_landing")
        }
      >
        {loggedIn
          ? t("studio:landing.nextEvent.memberCta")
          : t("studio:landing.nextEvent.visitorCta")}
        <FiArrowRight aria-hidden="true" />
      </Button>
    </article>
  );
}
