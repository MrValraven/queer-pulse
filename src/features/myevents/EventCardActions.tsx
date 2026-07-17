import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { Icons } from "./MyEventsIcons";
import { isToday } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

const GATHERING = linkToPath("QueerPulse Gathering.html");

/** The specific gathering detail page for this event, or the generic listing. */
const detailPath = (ev: MyEvent) =>
  ev.slug ? gatheringPath(ev.slug) : GATHERING;
const TICKET = linkToPath("QueerPulse RSVP Ticket.html");
const MANAGE = linkToPath("QueerPulse Manage Gathering.html");
const COHOST = linkToPath("QueerPulse Co-host Invite.html");
const PHOTOS = linkToPath("QueerPulse Gathering Photos.html");
const RECEIPT = linkToPath("QueerPulse Receipt.html");

/** Right-hand action column, varying by category. */
export function EventSide({ ev }: { ev: MyEvent }) {
  const { t } = useTranslation();
  const { rsvpSaved, acceptInvite, declineInvite, softRemove, toast } =
    useMyEvents();
  return (
    <div className={sx("ev-actions")}>
      {ev.cat === "going" &&
        (ev.cancelled ? (
          <Button variant="ghost" to={GATHERING}>
            {t("myevents:side.findSimilar")}
          </Button>
        ) : (
          <>
            {ev.ticket && (
              <Button variant="ghost" to={TICKET}>
                {t("myevents:side.viewTicket")}
              </Button>
            )}
            <Link className={sx("ev-link")} to={detailPath(ev)}>
              {t("myevents:side.eventDetailsCta")}
            </Link>
          </>
        ))}

      {ev.cat === "hosting" && (
        <>
          <Button variant="primary" to={MANAGE}>
            {t("myevents:side.manageCta")}
          </Button>
          <Link className={sx("ev-link")} to={detailPath(ev)}>
            {t("myevents:side.viewListingCta")}
          </Link>
        </>
      )}

      {ev.cat === "waitlisted" && (
        <Link className={sx("ev-link")} to={detailPath(ev)}>
          {t("myevents:side.eventDetailsCta")}
        </Link>
      )}

      {ev.cat === "past" && (
        <>
          {ev.photos ? (
            <Link className={sx("ev-link")} to={PHOTOS}>
              {t("myevents:side.seePhotosCta")}
            </Link>
          ) : (
            <button
              type="button"
              className={sx("ev-link quiet")}
              onClick={() => toast(t("myevents:side.leaveNoteToast"))}
            >
              {t("myevents:side.leaveNoteCta")}
            </button>
          )}
          {ev.receipt && (
            <Link className={sx("ev-link quiet")} to={RECEIPT}>
              {t("myevents:side.receiptCta")}
            </Link>
          )}
        </>
      )}

      {ev.cat === "saved" && (
        <>
          {ev.soldOut ? (
            <Button
              variant="ghost"
              onClick={() =>
                toast(t("myevents:side.joinWaitlistToast"), "success")
              }
            >
              {t("myevents:side.joinWaitlistCta")}
            </Button>
          ) : (
            <Button variant="jade" onClick={() => rsvpSaved(ev.id)}>
              {t("myevents:side.rsvpCta")}
            </Button>
          )}
          <button
            type="button"
            className={sx("ev-link quiet")}
            onClick={() =>
              softRemove(ev.id, t("myevents:side.removedFromSavedToast"))
            }
          >
            {t("myevents:side.removeCta")}
          </button>
        </>
      )}

      {ev.cat === "invite" && (
        <div className={sx("invite-row")}>
          <Button variant="jade" onClick={() => acceptInvite(ev.id)}>
            {t("myevents:side.acceptCta")}
          </Button>
          <Button variant="ghost" onClick={() => declineInvite(ev.id)}>
            {t("myevents:side.declineCta")}
          </Button>
        </div>
      )}

      {ev.cat === "sent" && (
        <Link className={sx("ev-link")} to={MANAGE}>
          {t("myevents:side.manageInviteCta")}
        </Link>
      )}
    </div>
  );
}

function ToolBtn({
  on,
  danger,
  onClick,
  children,
}: {
  on?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={sx(`tool-btn${on ? " on" : ""}${danger ? " danger" : ""}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** The card-tools row, varying by category. */
export function EventTools({
  ev,
  dayofShown,
  onToggleDayof,
}: {
  ev: MyEvent;
  dayofShown: boolean;
  onToggleDayof: () => void;
}) {
  const { t } = useTranslation();
  const c = useMyEvents();
  const onMore = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    c.openMore(ev.id, r.left, r.bottom + 6);
  };
  const Bell = (
    <ToolBtn on={ev.reminder} onClick={() => c.toggleReminder(ev.id)}>
      {Icons.bell}
      <span>
        {ev.reminder
          ? t("myevents:tools.reminderOn")
          : t("myevents:tools.remindMe")}
      </span>
    </ToolBtn>
  );
  const Cal = (
    <ToolBtn
      onClick={() =>
        c.toast(t("myevents:tools.addedToCalendarToast"), "success")
      }
    >
      {Icons.cal}
      {t("myevents:tools.addToCalendar")}
    </ToolBtn>
  );
  const MoreBtn = (
    <button
      type="button"
      className={sx("tool-btn")}
      aria-label={t("myevents:tools.moreOptionsAria")}
      onClick={onMore}
    >
      {Icons.more}
      {t("myevents:tools.more")}
    </button>
  );
  const DayofBtn =
    isToday(ev) && ev.dayof ? (
      <ToolBtn on={dayofShown} onClick={onToggleDayof}>
        {Icons.info}
        {t("myevents:tools.dayOfDetails")}
      </ToolBtn>
    ) : null;

  if (ev.cat === "going") {
    if (ev.cancelled) return null;
    return (
      <div className={sx("card-tools")}>
        {Bell}
        {DayofBtn}
        {ev.maybe && (
          <ToolBtn onClick={() => c.setGoing(ev.id)}>
            {Icons.check}
            {t("myevents:tools.switchToGoing")}
          </ToolBtn>
        )}
        {Cal}
        <ToolBtn onClick={() => c.openDetails(ev.id)}>
          {Icons.edit}
          {t("myevents:tools.yourDetails")}
        </ToolBtn>
        <ToolBtn danger onClick={() => c.cantGo(ev.id)}>
          {Icons.x}
          {t("myevents:tools.cantMakeIt")}
        </ToolBtn>
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "hosting") {
    return (
      <div className={sx("card-tools")}>
        {Bell}
        {Cal}
        {!ev.cohost && (
          <Link className={sx("tool-btn")} to={COHOST}>
            {Icons.plus}
            {t("myevents:tools.inviteCoHost")}
          </Link>
        )}
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "waitlisted") {
    return (
      <div className={sx("card-tools")}>
        {Bell}
        <ToolBtn danger onClick={() => c.leaveWaitlist(ev.id)}>
          {Icons.leave}
          {t("myevents:tools.leaveWaitlist")}
        </ToolBtn>
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "past") {
    return (
      <div className={sx("card-tools")}>
        {ev.noShow ? (
          <ToolBtn onClick={() => c.toast(t("myevents:tools.tellHostToast"))}>
            {Icons.info}
            {t("myevents:tools.tellHostWhy")}
          </ToolBtn>
        ) : (
          <ToolBtn
            onClick={() => c.toast(t("myevents:tools.thankedToast"), "success")}
          >
            {Icons.heart}
            {t("myevents:tools.thankHost")}
          </ToolBtn>
        )}
        {ev.connect && (
          <ToolBtn
            onClick={() => c.toast(t("myevents:tools.connectWithMetToast"))}
          >
            {Icons.connect}
            {t("myevents:tools.connectWithMet")}
          </ToolBtn>
        )}
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "saved") {
    return (
      <div className={sx("card-tools")}>
        {Bell}
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "invite") {
    return (
      <div className={sx("card-tools")}>
        <ToolBtn onClick={() => c.toast(t("myevents:tools.askQuestionToast"))}>
          {Icons.msg}
          {t("myevents:tools.askQuestion")}
        </ToolBtn>
        {MoreBtn}
      </div>
    );
  }
  if (ev.cat === "sent") {
    return (
      <div className={sx("card-tools")}>
        <ToolBtn
          onClick={() =>
            c.toast(
              t("myevents:tools.nudgeSentToast", { invitee: ev.invitee }),
              "success",
            )
          }
        >
          {Icons.bell}
          {t("myevents:tools.sendNudge")}
        </ToolBtn>
        <ToolBtn
          danger
          onClick={() =>
            c.softRemove(ev.id, t("myevents:tools.withdrawnToast"))
          }
        >
          {Icons.x}
          {t("myevents:tools.withdraw")}
        </ToolBtn>
      </div>
    );
  }
  return null;
}
