import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { SpotsLabel } from "./data";
import { spotsText } from "./data";
import styles from "./GatheringCancelledPage.module.css";

const CALENDAR = routes.calendar;
const GATHERING = routes.gatherings;
const MESSAGES = routes.messages;

/** The cancelling host's name — organizer-authored content. */
const HOST_NAME = "Marta";
const HOST_LAST_NAME = "Reis";
const CANCELLED_HOURS_AGO = 4;
const EVENT_START = new Date(2026, 5, 20, 14, 0);
const EVENT_END = new Date(2026, 5, 20, 17, 0);
const RESCHEDULE_DATE = new Date(2026, 6, 19);
const REFUND_PRICE_EUR = 5;

/**
 * This cancellation's own narrative — organizer-authored content (like a
 * gathering's `body`), left in English and held as constants rather than
 * inline JSX text so it has a single source and doesn't trip the lint rule
 * that guards un-keyed chrome.
 */
const CANCELLATION_REASON = "Host illness · cancelled ";
const EVENT_VENUE_LINE = "Largo do Carmo · Lisbon";
const EXPLAINER_P1 =
  "Marta is out sick — she dropped us a message yesterday and we waited 24h hoping a co-host could step in. ";
const EXPLAINER_EM = "Nobody available this week.";
const EXPLAINER_P2 =
  " We're not rescheduling immediately because the studio's painting work starts Monday, but the next visit is already on the calendar for ";
const EXPLAINER_DATE_TEXT = "19 July";
const REFUND_NOTE = "Refunded to Visa ending 4729 within 3–5 business days.";
const NOTE_QUOTE_P1 = "\"I'm so sorry, especially to the three of you";
const NOTE_QUOTE_EM = "who travelled in.";
const NOTE_P1 =
  "It's a chest cold and not anything dramatic, but I lose my voice the moment I try to talk for more than ten minutes — and a studio visit where I can't talk is a tour, not a visit.";
const NOTE_P2 =
  "July 19 will happen. The painting is done by then and we'll have the new riso press set up. Promise.";

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ALTS: {
  primary: boolean;
  date: Date;
  title: ReactNode;
  venue: string;
  time: Date;
  note: string;
  spots: SpotsLabel;
}[] = [
  {
    primary: true,
    date: RESCHEDULE_DATE,
    title: (
      <>
        {"Studio visit · "}
        <em>{"Atelier Pulso · July"}</em>
      </>
    ),
    venue: "Largo do Carmo",
    time: new Date(2026, 6, 19, 14, 0),
    note: "same host · new press!",
    spots: { key: "gatherings:cancelled.altRsvpsOpen" },
  },
  {
    primary: false,
    date: new Date(2026, 5, 22),
    title: (
      <>
        {"Sunday risograph workshop — "}
        <em>{"Bairro Alto"}</em>
      </>
    ),
    venue: "Editora Anjos",
    time: new Date(2026, 5, 22, 11, 0),
    note: "open to 8 people",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 3 } },
  },
  {
    primary: false,
    date: new Date(2026, 5, 28),
    title: (
      <>
        {"Portfolio night — "}
        <em>{"creatives only"}</em>
      </>
    ),
    venue: "Café Beirão back room",
    time: new Date(2026, 5, 28, 18, 0),
    note: "informal",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 11 } },
  },
];

export function GatheringCancelledPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const cancelledAgo = fmt.relativeTime(-CANCELLED_HOURS_AGO, "hour");

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={CALENDAR} className={styles.back}>
          {t("gatherings:cancelled.back")}
        </Link>

        <div className={styles.stamp}>
          <div className={styles.stampIc}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <h2>{t("gatherings:cancelled.stampTitle")}</h2>
            <p>
              {CANCELLATION_REASON}
              <b>{cancelledAgo}</b>. {t("gatherings:cancelled.stampBody")}
            </p>
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
                {"Studio visit · "}
                <em>{"Atelier Pulso open hours."}</em>
              </h2>
              <div className={styles.eventMeta}>
                <span>
                  {fmt.date(EVENT_START, { weekday: "short" })}{" "}
                  {fmt.time(EVENT_START)} — {fmt.time(EVENT_END)}
                </span>
                <span className={styles.dot} />
                <span>{EVENT_VENUE_LINE}</span>
                <span className={styles.dot} />
                <span>
                  {t("gatherings:common.hostedBy")} {HOST_NAME} {HOST_LAST_NAME}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.explainer}>
            <h3>{t("gatherings:cancelled.explainerTitle")}</h3>
            <p>
              {EXPLAINER_P1}
              <em>{EXPLAINER_EM}</em>
              {EXPLAINER_P2}
              <b>{EXPLAINER_DATE_TEXT}</b>.
            </p>
          </div>
          <div className={styles.host}>
            <div className={styles.hostAv}>{"MR"}</div>
            <div className={styles.hostText}>
              <b>
                {HOST_NAME} {HOST_LAST_NAME}
              </b>{" "}
              · {t("gatherings:cancelled.hostSentLabel")}
            </div>
            <Link to={MESSAGES} className={styles.hostLink}>
              {t("gatherings:cancelled.sendWellWishesCta")} →
            </Link>
          </div>
        </div>

        <div className={styles.info}>
          <h3>
            <Translation
              i18nKey="gatherings:cancelled.infoTitle"
              components={{ em: <em /> }}
            />
          </h3>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>
                {t("gatherings:cancelled.refundTitle", {
                  price: fmt.currency(REFUND_PRICE_EUR),
                })}
              </b>
              <span>{REFUND_NOTE}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>{t("gatherings:cancelled.headcountTitle")}</b>
              <span>{t("gatherings:cancelled.headcountBody")}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>
                {t("gatherings:cancelled.rescheduleTitle", {
                  date: fmt.date(RESCHEDULE_DATE, { month: "long" }),
                })}
              </b>
              <span>
                <Translation
                  i18nKey="gatherings:cancelled.rescheduleBody"
                  values={{
                    date: fmt.date(RESCHEDULE_DATE, {
                      day: "numeric",
                      month: "long",
                    }),
                    host: HOST_NAME,
                  }}
                  // eslint-disable-next-line jsx-a11y/anchor-has-content -- element template; <Translation> clones it with the link text at render time.
                  components={{ a: <a href="#july" /> }}
                />
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={`${styles.infoIc} ${styles.infoIcAccent}`}>
              <svg viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <b>{t("gatherings:cancelled.concernTitle")}</b>
              <span>{t("gatherings:cancelled.concernBody")}</span>
            </div>
          </div>
        </div>

        <div className={styles.noteCard}>
          <div className={styles.noteEyebrow}>
            {t("gatherings:cancelled.noteEyebrow", { host: HOST_NAME })}
          </div>
          <h3>
            {NOTE_QUOTE_P1} <em>{NOTE_QUOTE_EM}</em>
            {'"'}
          </h3>
          <p>{NOTE_P1}</p>
          <p>{NOTE_P2}</p>
          <div className={styles.noteSign}>
            — <b>{HOST_NAME}</b> ·{" "}
            {t("gatherings:cancelled.noteSentVia", { time: cancelledAgo })}
          </div>
        </div>

        <div className={styles.altH} id="july">
          {t("gatherings:cancelled.altHeading")}
        </div>
        <div className={styles.altGrid}>
          {ALTS.map((alt, index) => (
            <Link
              to={GATHERING}
              className={[styles.altRow, alt.primary && styles.altRowPrimary]
                .filter(Boolean)
                .join(" ")}
              key={index}
            >
              <div className={styles.altDate}>
                <div className="d">
                  {fmt.date(alt.date, { day: "2-digit" })}
                </div>
                <div className="m">
                  {fmt.date(alt.date, { month: "short" })}
                </div>
              </div>
              <div>
                <div className={styles.altTitle}>{alt.title}</div>
                <div className={styles.altMeta}>
                  {alt.venue} · {fmt.time(alt.time)} · {alt.note}
                </div>
              </div>
              <div className={styles.altSpots}>
                <b>{spotsText(alt.spots, t, fmt)}</b>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.footActions}>
          <Button variant="ghost" to={CALENDAR}>
            {t("gatherings:cancelled.calendarCta")}
          </Button>
          <Button variant="primary" to={GATHERING}>
            {t("gatherings:cancelled.rsvpCta", {
              date: fmt.date(RESCHEDULE_DATE, {
                day: "numeric",
                month: "short",
              }),
            })}{" "}
            →
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
