import { sx } from "./myEvents.styles";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { PriceChip, UrgencyChip, AvStack } from "./EventCardParts";
import type { MyEvent } from "./myEvents.types";

/** The status-pill / count badge row, varying by category. */
export function StatusBadges({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  return <div className={sx("ev-badges")}>{badgeContent(ev, t)}</div>;
}

function badgeContent(ev: MyEvent, t: TFunction) {
  switch (ev.cat) {
    case "going":
      return (
        <>
          {ev.maybe ? (
            <span className={sx("status-pill maybe")}>
              <span className={sx("sd")} />
              {t("myevents:badges.maybe")}
            </span>
          ) : (
            <span className={sx("status-pill going")}>
              <span className={sx("sd")} />
              {t("myevents:badges.going")}
            </span>
          )}
          <PriceChip ev={ev} />
        </>
      );
    case "hosting":
      return (
        <>
          <span className={sx("status-pill hosting")}>
            <span className={sx("sd")} />
            {ev.cohost
              ? t("myevents:badges.coHosting")
              : t("myevents:badges.hosting")}
          </span>
          <span className={sx("ev-count")}>
            {t("myevents:badges.goingCount", { count: ev.going })}
            {ev.waitlist
              ? t("myevents:badges.waitlistSuffix", { count: ev.waitlist })
              : ""}
          </span>
          <PriceChip ev={ev} />
        </>
      );
    case "waitlisted":
      return (
        <>
          <span className={sx("status-pill waitlisted")}>
            <span className={sx("sd")} />
            {t("myevents:badges.waitlistedPosition", { position: ev.position })}
          </span>
          <span className={sx("ev-count")}>
            {t("myevents:badges.goingFull", { count: ev.going })}
          </span>
          <PriceChip ev={ev} />
        </>
      );
    case "past":
      return (
        <>
          {ev.noShow ? (
            <span className={sx("status-pill missed")}>
              <span className={sx("sd")} />
              {t("myevents:badges.didntMakeIt")}
            </span>
          ) : (
            <span className={sx("status-pill attended")}>
              <span className={sx("sd")} />
              {t("myevents:badges.attended")}
            </span>
          )}
          <PriceChip ev={ev} />
          {ev.taggedPhotos ? (
            <span className={sx("ev-count")}>
              {t("myevents:badges.inPhotos", { count: ev.taggedPhotos })}
            </span>
          ) : null}
        </>
      );
    case "saved":
      return (
        <>
          <span className={sx("status-pill saved")}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              aria-hidden
            >
              <path
                d="M2.5 1h6a.7.7 0 0 1 .7.7v8.3l-3.7-2.1L1.8 10V1.7A.7.7 0 0 1 2.5 1Z"
                fill="currentColor"
              />
            </svg>
            {t("myevents:badges.saved")}
          </span>
          <UrgencyChip ev={ev} />
          <PriceChip ev={ev} />
        </>
      );
    case "invite":
      return (
        <>
          <span className={sx("status-pill pending")}>
            <span className={sx("sd")} />
            {t("myevents:badges.invitedTakeYourTime")}
          </span>
          <UrgencyChip ev={ev} />
          <PriceChip ev={ev} />
        </>
      );
    case "sent":
      return (
        <span className={sx("status-pill pending")}>
          <span className={sx("sd")} />
          {t("myevents:badges.youInvited", { invitee: ev.invitee })}
        </span>
      );
    default:
      return null;
  }
}

/** The attendee / status footer line, varying by category. */
export function EventFoot({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  if (ev.cat === "going") {
    if (ev.cancelled) return null;
    return (
      <div className={sx("ev-foot")}>
        <AvStack who={ev.who} />
        <span className={sx("ev-foot-text")}>{ev.whoText}</span>
      </div>
    );
  }
  if (ev.cat === "hosting") {
    const footWho =
      ev.cohost && ev.cohosts ? [...ev.cohosts, ...(ev.who || [])] : ev.who;
    const footText =
      ev.cohost && ev.cohostName
        ? t("myevents:foot.coHostingWith", { name: ev.cohostName })
        : ev.whoText;
    return (
      <div className={sx("ev-foot")}>
        <AvStack who={footWho} />
        <span className={sx("ev-foot-text")}>{footText}</span>
      </div>
    );
  }
  if (ev.cat === "waitlisted") {
    return (
      <div className={sx("ev-foot")}>
        <span className={sx("ev-foot-text")}>
          <Translation
            i18nKey="myevents:foot.aheadOfYou"
            components={{ strong: <strong /> }}
            values={{ count: ev.ahead }}
          />
        </span>
      </div>
    );
  }
  if (ev.cat === "invite") {
    return (
      <div className={sx("ev-foot")}>
        <span className={sx("ev-foot-text")}>
          <Translation
            i18nKey="myevents:foot.invitedYou"
            components={{ strong: <strong /> }}
            values={{ from: ev.from ?? "" }}
          />
        </span>
      </div>
    );
  }
  if (ev.cat === "sent") {
    return (
      <div className={sx("ev-foot")}>
        <span className={sx("ev-foot-text")}>
          <Translation
            i18nKey="myevents:foot.waitingOnReply"
            components={{ strong: <strong /> }}
            values={{ invitee: ev.invitee ?? "" }}
          />
        </span>
      </div>
    );
  }
  return null;
}
