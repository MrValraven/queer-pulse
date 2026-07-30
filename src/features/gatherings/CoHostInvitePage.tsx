import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { FiStar } from "react-icons/fi";
import { useRespondInvite } from "./api/useEventMutations";
import { DEMO_GATHERING_SLUGS, manageGatheringPath } from "./data";
import { CoHostInviteDetails } from "./CoHostInviteDetails";
import styles from "./CoHostInvitePage.module.css";

/** Placeholder invite id for this static co-host invitation. */
const INVITE_ID = "cohost-anika-clinic";
/** The inviting host's first name — organizer-authored content. */
const HOST_NAME = "Anika";
/** The clinic night's start/end — real `Date`s so the meta row can be
 *  formatted with `useFormat()` instead of a baked "Thu 19:00 — 21:00". */
const EVENT_START = new Date(2026, 5, 12, 19, 0);
const EVENT_END = new Date(2026, 5, 12, 21, 0);
const INVITED_HOURS_AGO = 2;
const REPLY_BY_DATE = new Date(2026, 5, 10);

const NOTIFICATIONS = routes.notifications;
const MESSAGES = routes.messages;

/**
 * This invite's own narrative — organizer/host-authored content (like a
 * gathering's `body`), left in English and held as constants rather than
 * inline JSX text so it has a single source and doesn't trip the lint rule
 * that guards un-keyed chrome.
 */
const INVITE_SUB_TEXT =
  "She's running an open clinic night and would like a second person at the door — for vibes, for the line, and so the night doesn't rest on one set of shoulders.";
const FROM_AVATAR_INITIALS = "AK";
const FROM_FULL_NAME = "Anika Kovač";
const FROM_ROLE = "Healthcare designer · Trans & Non-Binary Network";
const EVENT_TITLE_PREFIX = "Open clinic night — ";
const EVENT_TITLE_EM = "bring your prescription questions.";
const EVENT_VENUE_NAME = "Café Beirão";
const EVENT_HOOD_SUFFIX = " · Anjos";
const PERSONAL_QUOTE_P1 =
  "\"I'd love to do this with you. You're calmer than I am about the front-door bit and you know Sandra and Rui. I'll bring the doctor, the pharmacist, and the kettle — ";
const PERSONAL_QUOTE_EM = "can you bring the room?";

export function CoHostInvitePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const respondInvite = useRespondInvite();
  // Hold the post-toast redirect timer so a late fire can't navigate() after
  // the user has already left this page.
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  const accept = () => {
    respondInvite.mutate({ id: INVITE_ID, action: "accept" });
    showToast(
      t("gatherings:cohostInvite.acceptedToast", { host: HOST_NAME }),
      "success",
      3500,
    );
    redirectTimerRef.current = setTimeout(
      () => void navigate(manageGatheringPath(DEMO_GATHERING_SLUGS.coHostInvite)),
      1300,
    );
  };
  const decline = () => {
    respondInvite.mutate({ id: INVITE_ID, action: "decline" });
    showToast(
      t("gatherings:cohostInvite.declinedToast", { host: HOST_NAME }),
      "info",
      3000,
    );
    redirectTimerRef.current = setTimeout(() => void navigate(NOTIFICATIONS), 1300);
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={NOTIFICATIONS} className={styles.back}>
          {t("gatherings:cohostInvite.back")}
        </Link>

        <div className={styles.hero}>
          <span className={styles.eyebrow}>
            {t("gatherings:cohostInvite.eyebrow")}
          </span>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="gatherings:cohostInvite.title"
              values={{ host: HOST_NAME }}
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>
            {INVITE_SUB_TEXT}{" "}
            <em>{t("gatherings:cohostInvite.readThroughHint")}</em>
          </p>
        </div>

        <div className={styles.fromCard}>
          <div className={styles.fromAv}>{FROM_AVATAR_INITIALS}</div>
          <div>
            <div className={styles.fromName}>{FROM_FULL_NAME}</div>
            <div className={styles.fromRole}>{FROM_ROLE}</div>
            <div className={styles.fromMeta}>
              <b>{t("gatherings:cohostInvite.hostedCount", { count: 14 })}</b>
              <span className={styles.dot}>·</span>
              <b>
                {fmt.number(4.9, { minimumFractionDigits: 1 })} <FiStar />
              </b>{" "}
              {t("gatherings:cohostInvite.ratingFromAttendees")}
              <span className={styles.dot}>·</span>
              {t("gatherings:cohostInvite.attendedCount", { count: 3 })}
            </div>
          </div>
          <div className={styles.fromStats}>
            <b>{t("gatherings:cohostInvite.mutualsCount", { count: 11 })}</b>
            <br />
            {t("gatherings:cohostInvite.invitedAgo", {
              time: fmt.relativeTime(-INVITED_HOURS_AGO, "hour"),
            })}
            <br />
            {t("gatherings:cohostInvite.replyBy", {
              date: fmt.date(REPLY_BY_DATE, { day: "numeric", month: "short" }),
            })}
          </div>
        </div>

        <div className={styles.eventCard}>
          <div className={styles.eventH}>
            <div className={styles.eventDate}>
              <div className="d">
                {fmt.date(EVENT_START, { day: "2-digit" })}
              </div>
              <div className="m">
                {fmt.date(EVENT_START, { month: "short" })}
              </div>
            </div>
            <div className={styles.eventInfo}>
              <h2>
                {EVENT_TITLE_PREFIX}
                <em>{EVENT_TITLE_EM}</em>
              </h2>
              <div className={styles.eventMeta}>
                <b>
                  {fmt.date(EVENT_START, { weekday: "short" })}{" "}
                  {fmt.time(EVENT_START)} — {fmt.time(EVENT_END)}
                </b>
                <span className={styles.dot} />
                <b>{EVENT_VENUE_NAME}</b>
                {EVENT_HOOD_SUFFIX}
                <span className={styles.dot} />
                <span>
                  {t("gatherings:cohostInvite.rsvpsAndWaitlist", {
                    rsvps: 22,
                    waitlist: 14,
                  })}
                </span>
              </div>
            </div>
          </div>
          <p className={styles.personal}>
            {PERSONAL_QUOTE_P1}
            <em>{PERSONAL_QUOTE_EM}</em>
            {'"'}
          </p>
        </div>

        <CoHostInviteDetails host={HOST_NAME} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.later}
            onClick={() =>
              showToast(t("gatherings:cohostInvite.snoozedToast"), "info")
            }
          >
            {t("gatherings:cohostInvite.sleepCta")}
          </button>
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={decline}>
              {t("gatherings:cohostInvite.declineCta")}
            </Button>
            <Button variant="primary" onClick={accept}>
              {t("gatherings:cohostInvite.acceptCta", { host: HOST_NAME })}
            </Button>
          </div>
        </div>
        <p className={styles.actionMeta}>
          <Translation
            i18nKey="gatherings:cohostInvite.actionMeta"
            values={{ host: HOST_NAME }}
            components={{ b: <b /> }}
          />{" "}
          <Link to={MESSAGES} style={{ color: "var(--plum)", fontWeight: 600 }}>
            {t("gatherings:cohostInvite.openMessagesCta")} →
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
