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
const GATHERING = routes.gathering;
const MESSAGES = routes.messages;

/** The cancelling host's first name — organizer-authored content. */
const HOST_NAME = "Marta";
const CANCELLED_HOURS_AGO = 4;
const EVENT_START = new Date(2026, 5, 20, 14, 0);
const EVENT_END = new Date(2026, 5, 20, 17, 0);
const RESCHEDULE_DATE = new Date(2026, 6, 19);
const REFUND_PRICE_EUR = 5;

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
        Studio visit · <em>Atelier Pulso · July</em>
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
        Sunday risograph workshop — <em>Bairro Alto</em>
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
        Portfolio night — <em>creatives only</em>
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
              Host illness · cancelled <b>{cancelledAgo}</b>.{" "}
              {t("gatherings:cancelled.stampBody")}
            </p>
          </div>
        </div>

        <div className={styles.eventCard}>
          <div className={styles.eventH}>
            <div className={styles.eventDate}>
              <div className="d">{fmt.date(EVENT_START, { day: "2-digit" })}</div>
              <div className="m">{fmt.date(EVENT_START, { month: "short" })}</div>
            </div>
            <div className={styles.eventInfo}>
              <h2>
                Studio visit · <em>Atelier Pulso open hours.</em>
              </h2>
              <div className={styles.eventMeta}>
                <span>
                  {fmt.date(EVENT_START, { weekday: "short" })}{" "}
                  {fmt.time(EVENT_START)} — {fmt.time(EVENT_END)}
                </span>
                <span className={styles.dot} />
                <span>Largo do Carmo · Lisbon</span>
                <span className={styles.dot} />
                <span>
                  {t("gatherings:common.hostedBy")} {HOST_NAME} Reis
                </span>
              </div>
            </div>
          </div>
          <div className={styles.explainer}>
            <h3>{t("gatherings:cancelled.explainerTitle")}</h3>
            <p>
              Marta is out sick — she dropped us a message yesterday and we
              waited 24h hoping a co-host could step in.{" "}
              <em>Nobody available this week.</em> We're not rescheduling
              immediately because the studio's painting work starts Monday, but
              the next visit is already on the calendar for <b>19 July</b>.
            </p>
          </div>
          <div className={styles.host}>
            <div className={styles.hostAv}>MR</div>
            <div className={styles.hostText}>
              <b>{HOST_NAME} Reis</b> · {t("gatherings:cancelled.hostSentLabel")}
            </div>
            <Link to={MESSAGES} className={styles.hostLink}>
              {t("gatherings:cancelled.sendWellWishesCta")} →
            </Link>
          </div>
        </div>

        <div className={styles.info}>
          <h3>
            <Translation i18nKey="gatherings:cancelled.infoTitle" components={{ em: <em /> }} />
          </h3>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>{t("gatherings:cancelled.refundTitle", { price: fmt.currency(REFUND_PRICE_EUR) })}</b>
              <span>Refunded to Visa ending 4729 within 3–5 business days.</span>
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
              <b>{t("gatherings:cancelled.rescheduleTitle", { date: fmt.date(RESCHEDULE_DATE, { month: "long" }) })}</b>
              <span>
                <Translation
                  i18nKey="gatherings:cancelled.rescheduleBody"
                  values={{
                    date: fmt.date(RESCHEDULE_DATE, { day: "numeric", month: "long" }),
                    host: HOST_NAME,
                  }}
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
          <div className={styles.noteEyebrow}>{t("gatherings:cancelled.noteEyebrow", { host: HOST_NAME })}</div>
          <h3>
            "I'm so sorry, especially to the three of you{" "}
            <em>who travelled in.</em>"
          </h3>
          <p>
            It's a chest cold and not anything dramatic, but I lose my voice the
            moment I try to talk for more than ten minutes — and a studio visit
            where I can't talk is a tour, not a visit.
          </p>
          <p>
            July 19 will happen. The painting is done by then and we'll have the
            new riso press set up. Promise.
          </p>
          <div className={styles.noteSign}>
            — <b>{HOST_NAME}</b> ·{" "}
            {t("gatherings:cancelled.noteSentVia", { time: cancelledAgo })}
          </div>
        </div>

        <div className={styles.altH} id="july">{t("gatherings:cancelled.altHeading")}</div>
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
                <div className="d">{fmt.date(alt.date, { day: "2-digit" })}</div>
                <div className="m">{fmt.date(alt.date, { month: "short" })}</div>
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
            {t("gatherings:cancelled.rsvpCta", { date: fmt.date(RESCHEDULE_DATE, { day: "numeric", month: "short" }) })}{" "}
            →
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
