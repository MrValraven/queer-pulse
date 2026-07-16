import { Link } from "react-router-dom";
import { linkToPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { TINT_STYLE } from "./myEvents.data";
import {
  timeStr,
  isOnline,
  isToday,
  soonLabel,
  COMMITTED,
} from "./myEvents.helpers";
import type { AvatarSpec, MyEvent } from "./myEvents.types";

export function AvStack({ who }: { who?: AvatarSpec[] }) {
  if (!who?.length) return null;
  return (
    <div className={sx("av-stack")}>
      {who.map((a) => (
        <div
          key={a[0] + a[1]}
          className={sx("av")}
          style={TINT_STYLE[a[1]] || TINT_STYLE.plum}
        >
          {a[0]}
        </div>
      ))}
    </div>
  );
}

/** Time · venue · (directions / join) line. */
export function EventMeta({ ev, links }: { ev: MyEvent; links: boolean }) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  const timeLabel = timeStr(ev) + (ev.tz ? ` ${ev.tz}` : "");
  return (
    <div className={sx("ev-meta")}>
      <span>{timeLabel}</span>
      <span className={sx("dotsep")} />
      <span>{ev.venue}</span>
      {links && (
        <>
          <span className={sx("dotsep")} />
          {isOnline(ev) ? (
            <button
              type="button"
              className={sx("meta-link")}
              onClick={() => toast(t("myevents:card.joinLinkToast"))}
            >
              {t("myevents:card.joinLinkCta")}
            </button>
          ) : (
            <button
              type="button"
              className={sx("meta-link")}
              onClick={() =>
                toast(t("myevents:card.directionsToast", { venue: ev.venue }))
              }
            >
              {t("myevents:card.directionsCta")}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function PriceChip({ ev }: { ev: MyEvent }) {
  if (!ev.paid) return null;
  return <span className={sx("ev-price")}>{ev.paid}</span>;
}

export function UrgencyChip({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  let text: string | null = null;
  if (ev.soldOut) text = t("myevents:card.soldOut");
  else if (ev.spotsLeft != null)
    text = t("myevents:card.spotsOpen", { count: ev.spotsLeft });
  else if (ev.deadline) text = ev.deadline;
  if (!text) return null;
  return (
    <span className={sx("urgent")}>
      <span className={sx("ud")} />
      {text}
    </span>
  );
}

export function FriendsLine({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  if (!ev.friends) return null;
  return (
    <button
      type="button"
      className={sx("ev-friends")}
      onClick={() => toast(t("myevents:card.friendsToast"))}
    >
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M5.5 8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM11 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM1.5 13c0-2.3 1.8-3.6 4-3.6s4 1.3 4 3.6H1.5ZM10.4 9.5c1.9.1 3.3 1.3 3.3 3.5h-2.6c0-1.4-.3-2.5-.7-3.5Z" />
      </svg>
      {t("myevents:card.friendsGoing", { count: ev.friends })}
    </button>
  );
}

/** Today's "starts in / happening now" bar with quick links. */
export function SoonBar({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  if (!isToday(ev) || !COMMITTED[ev.cat] || ev.cancelled) return null;
  const lab = soonLabel(ev, t);
  if (!lab) return null;
  return (
    <div className={sx("soon-bar")}>
      <span className={sx("live")} />
      {lab}
      <span className={sx("soon-sep")}>·</span>
      <button
        type="button"
        className={sx("soon-link")}
        onClick={() => toast(t("myevents:soon.checkedInToast"), "success")}
      >
        {t("myevents:soon.checkInCta")}
      </button>
      <span className={sx("soon-sep")}>·</span>
      {isOnline(ev) ? (
        <button
          type="button"
          className={sx("soon-link")}
          onClick={() => toast(t("myevents:card.joinLinkToast"))}
        >
          {t("myevents:card.joinLinkCta")}
        </button>
      ) : (
        <button
          type="button"
          className={sx("soon-link")}
          onClick={() =>
            toast(t("myevents:card.directionsToast", { venue: ev.venue }))
          }
        >
          {t("myevents:card.directionsCta")}
        </button>
      )}
      {ev.ticket && (
        <>
          <span className={sx("soon-sep")}>·</span>
          <Link
            className={sx("soon-link")}
            to={linkToPath("QueerPulse RSVP Ticket.html")}
          >
            {t("myevents:soon.ticketCta")}
          </Link>
        </>
      )}
    </div>
  );
}
