import { sx } from "./myEvents.styles";
import { PriceChip, UrgencyChip, AvStack } from "./EventCardParts";
import type { MyEvent } from "./myEvents.types";

/** The status-pill / count badge row, varying by category. */
export function StatusBadges({ ev }: { ev: MyEvent }) {
  return <div className={sx("ev-badges")}>{badgeContent(ev)}</div>;
}

function badgeContent(ev: MyEvent) {
  switch (ev.cat) {
    case "going":
      return (
        <>
          {ev.maybe ? (
            <span className={sx("status-pill maybe")}>
              <span className={sx("sd")} />
              Maybe
            </span>
          ) : (
            <span className={sx("status-pill going")}>
              <span className={sx("sd")} />
              Going
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
            {ev.cohost ? "Co-hosting" : "Hosting"}
          </span>
          <span className={sx("ev-count")}>
            {ev.going} going{ev.waitlist ? ` · ${ev.waitlist} waitlist` : ""}
          </span>
          <PriceChip ev={ev} />
        </>
      );
    case "waitlisted":
      return (
        <>
          <span className={sx("status-pill waitlisted")}>
            <span className={sx("sd")} />
            Waitlisted · #{ev.position}
          </span>
          <span className={sx("ev-count")}>{ev.going} going · full</span>
          <PriceChip ev={ev} />
        </>
      );
    case "past":
      return (
        <>
          {ev.noShow ? (
            <span className={sx("status-pill missed")}>
              <span className={sx("sd")} />
              Didn’t make it
            </span>
          ) : (
            <span className={sx("status-pill attended")}>
              <span className={sx("sd")} />
              Attended
            </span>
          )}
          <PriceChip ev={ev} />
          {ev.taggedPhotos ? (
            <span className={sx("ev-count")}>
              You’re in {ev.taggedPhotos} photos
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
            Saved
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
            Invited — take your time
          </span>
          <UrgencyChip ev={ev} />
          <PriceChip ev={ev} />
        </>
      );
    case "sent":
      return (
        <span className={sx("status-pill pending")}>
          <span className={sx("sd")} />
          You invited {ev.invitee}
        </span>
      );
    default:
      return null;
  }
}

/** The attendee / status footer line, varying by category. */
export function EventFoot({ ev }: { ev: MyEvent }) {
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
        ? `Co-hosting with ${ev.cohostName}`
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
          <strong>{ev.ahead} people before you.</strong> We’ll let you know if a
          spot opens.
        </span>
      </div>
    );
  }
  if (ev.cat === "invite") {
    return (
      <div className={sx("ev-foot")}>
        <span className={sx("ev-foot-text")}>
          <strong>{ev.from}</strong> invited you
        </span>
      </div>
    );
  }
  if (ev.cat === "sent") {
    return (
      <div className={sx("ev-foot")}>
        <span className={sx("ev-foot-text")}>
          Waiting on <strong>{ev.invitee}</strong> to reply
        </span>
      </div>
    );
  }
  return null;
}
