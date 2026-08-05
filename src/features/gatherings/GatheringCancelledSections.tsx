import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { spotsText } from "./data";
import {
  ALTS,
  CANCELLED_HOURS_AGO,
  EVENT_END,
  EVENT_START,
  EVENT_VENUE_LINE,
  EXPLAINER_DATE_TEXT,
  EXPLAINER_EM,
  EXPLAINER_P1,
  EXPLAINER_P2,
  HOST_LAST_NAME,
  HOST_NAME,
  NOTE_P1,
  NOTE_P2,
  NOTE_QUOTE_EM,
  NOTE_QUOTE_P1,
  REFUND_NOTE,
  REFUND_PRICE_EUR,
  RESCHEDULE_DATE,
} from "./gatheringCancelled.data";
import styles from "./GatheringCancelledPage.module.css";

const MESSAGES = routes.messages;
const GATHERING = routes.gatherings;

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** The cancelled event's header, host explainer, and "send well wishes" row. */
export function CancelledEventCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventH}>
        <div className={styles.eventDate}>
          <div className="d">{fmt.date(EVENT_START, { day: "2-digit" })}</div>
          <div className="m">{fmt.date(EVENT_START, { month: "short" })}</div>
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
          {t("gatherings:cancelled.sendWellWishesCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}

/** The "what happens now" list: refund, headcount, reschedule, concern. */
export function CancelledRefundInfo() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
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
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the link text at render time.
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
  );
}

/** The host's personal apology note. */
export function CancelledHostNote() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const cancelledAgo = fmt.relativeTime(-CANCELLED_HOURS_AGO, "hour");
  return (
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
  );
}

/** The alternative gatherings offered in place of the cancelled visit. */
export function CancelledAlternatives() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
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
    </>
  );
}
