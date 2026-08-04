import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { liveEvents } from "./data";
import styles from "./CinemaPage.module.css";
import { routes } from "../../app/routeMap";

const badgeClass: Record<string, string | undefined> = {
  premiere: styles.bgPremiere,
  party: styles.bgParty,
  live: styles.bgLive,
};

export function LiveSection() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="cinema:live.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className="sub">{t("cinema:live.lead")}</div>
        <Link to={routes.calendar} className="all">
          {t("cinema:live.fullCalendarCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
      <div className={styles.liveList}>
        {liveEvents.map((e) => (
          <div key={e.date.toISOString()} className={styles.liveRow}>
            <div className={styles.liveDate}>
              <div className="d">{fmt.date(e.date, { day: "numeric" })}</div>
              <div className="m">{fmt.date(e.date, { weekday: "short" })}</div>
            </div>
            <div className={styles.liveMain}>
              <h4>
                {e.titlePre}
                <em>{e.titleEm}</em>
                {e.titlePost}
              </h4>
              <div className={styles.lmSub}>{e.sub}</div>
              <div className={styles.lmTags}>
                <span className={`${styles.bg} ${badgeClass[e.badgeClass]}`}>
                  {t(e.badgeKey)}
                </span>
                {e.tags.map((tag, i) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {i >= 0 && <span className="dot" />}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="ghost-dark" to={routes.rsvp}>
              {t("cinema:live.rsvpCta")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LedgerSection() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.ledger}>
      <div className={styles.ledgerText}>
        <div className={styles.ledgerEb}>{t("cinema:ledger.eyebrow")}</div>
        <h2>
          <Translation
            i18nKey="cinema:ledger.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("cinema:ledger.body")}</p>
        <div className={styles.ledgerActions}>
          <Button to={routes.cinemaSubmit}>
            {t("cinema:ledger.submitCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button variant="ghost-dark" to={routes.cinemaMembership}>
            {t("cinema:ledger.sustainCta", { price: fmt.currency(7) })}
          </Button>
          <Button variant="ghost-dark" to={routes.governance}>
            {t("cinema:ledger.readDeedCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.cinemaRights}>
            {t("cinema:ledger.rightsCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
      <div className={styles.ledgerCard}>
        <div className={styles.lcHead}>
          <span className="live" />
          {t("cinema:ledger.card.heading")}
        </div>
        <div className={styles.lcRow}>
          <span className="k">{t("cinema:ledger.card.paidToFilmmakers")}</span>
          <span className="v">
            <em>{fmt.currency(8420)}</em>
          </span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">{t("cinema:ledger.card.filmsStreamed")}</span>
          <span className="v">
            <em>{fmt.number(14207)}</em>
          </span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">{t("cinema:ledger.card.averageShare")}</span>
          <span className="v">
            <em>{fmt.number(82)}</em>%
          </span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">{t("cinema:ledger.card.openCommissions")}</span>
          <span className="v">
            <em>{fmt.number(4)}</em>
          </span>
        </div>
        <div className={styles.lcFoot}>{t("cinema:ledger.card.footnote")}</div>
      </div>
    </div>
  );
}

export function OpenCallsStrip() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const openCallsCount = 4;

  return (
    <div className={styles.openCallsStrip}>
      <div className={styles.openCallsText}>
        <div className={styles.openCallsEb}>
          <span className="live" />
          {t("cinema:openCallsStrip.eyebrow", { count: openCallsCount })}
        </div>
        <h2>
          <Translation
            i18nKey="cinema:openCallsStrip.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>
          <Translation
            i18nKey="cinema:openCallsStrip.body"
            components={{ em: <em /> }}
            values={{
              count: openCallsCount,
              amount: fmt.currency(13200),
            }}
          />
        </p>
      </div>
      <Button variant="ghost-dark" to={routes.cinemaOpenCalls}>
        {t("cinema:openCallsStrip.cta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

export function AboutStrip() {
  const { t } = useTranslation();

  return (
    <div className={styles.aboutStrip}>
      <div className={styles.aboutStripText}>
        <div className={styles.aboutStripEb}>
          {t("cinema:aboutStrip.eyebrow")}
        </div>
        <h2>
          <Translation
            i18nKey="cinema:aboutStrip.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("cinema:aboutStrip.body")}</p>
      </div>
      <Button variant="ghost-dark" to={routes.cinemaAbout}>
        {t("cinema:aboutStrip.cta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

export function CinemaOutro() {
  const { t } = useTranslation();

  return (
    <Outro
      title={
        <Translation i18nKey="cinema:outro.title" components={{ em: <em /> }} />
      }
      sub={t("cinema:outro.sub")}
    >
      <Button size="lg" to={routes.cinemaMembership}>
        {t("cinema:outro.sustainCta")}
      </Button>
    </Outro>
  );
}
