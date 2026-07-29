import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  commissions,
  pastFunded,
  smallCalls,
  type Commission,
  type PastFilm,
  type SmallCall,
} from "./openCalls.data";
import styles from "./CinemaOpenCalls.module.css";

function CommissionCard({ call }: { call: Commission }) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  return (
    <article className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.kicker}>
          <span className={styles.kickerType}>{call.type}</span>
          <span className={styles.kickerDot} aria-hidden />
          <span
            className={
              call.status === "closing"
                ? styles.kickerUrgent
                : styles.kickerOpen
            }
          >
            {call.statusLabel}
          </span>
        </div>
        <h3 className={styles.cardTitle}>
          {call.titlePre}
          <em>{call.titleEm}</em>
          {call.titlePost}
        </h3>
        <div className={styles.cardBody}>{call.body}</div>
        <div className={styles.details}>
          {call.details.map((d) => (
            <div key={d.k} className={styles.det}>
              <div className="k">{d.k}</div>
              <div className="v">{d.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.cardSide}>
        <div>
          <div className={styles.amount}>
            {call.amount}
            <span className={styles.amountLabel}>{call.amountLabel}</span>
          </div>
        </div>
        <div className={styles.deadline}>
          <div className={styles.dlLabel}>
            {t("cinema:openCalls.card.deadlineLabel")}
          </div>
          <div className={styles.dlDate}>{call.deadline}</div>
          <div className={styles.dlRemain}>{call.remaining}</div>
        </div>
        <div className={styles.applied}>{call.applied}</div>
        <div className={styles.sideActions}>
          <Button to={routes.cinemaSubmit}>
            {t("cinema:openCalls.card.applyNowCta")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => showToast(t("cinema:openCalls.card.downloadToast"))}
          >
            {t("cinema:openCalls.card.downloadBriefCta")}
          </Button>
        </div>
      </div>
    </article>
  );
}

function SmallCallCard({ call }: { call: SmallCall }) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  return (
    <article className={styles.sc}>
      <div className={styles.scKicker}>{call.kicker}</div>
      <h3>
        {call.titlePre}
        <em>{call.titleEm}</em>
        {call.titlePost}
      </h3>
      <p>{call.body}</p>
      <div className={styles.scMeta}>
        {call.meta.map((m) => (
          <div key={m.k} className={styles.scM}>
            <span className="v">{m.v}</span>
            {m.k}
          </div>
        ))}
      </div>
      <div className={styles.scActions}>
        <Button to={routes.cinemaSubmit}>
          {t("cinema:openCalls.card.applyCta")}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            showToast(
              t("cinema:openCalls.card.comingSoonToast", {
                label: call.secondaryLabel,
              }),
            )
          }
        >
          {call.secondaryLabel}
        </Button>
      </div>
    </article>
  );
}

function PastFilmCard({ film }: { film: PastFilm }) {
  const { t } = useTranslation();
  return (
    <Link to={routes.film} className={styles.pf}>
      <div className={styles.pfPoster}>
        <ImageSlot
          src={film.image}
          tint={film.tint}
          width="100%"
          height="100%"
          placeholder={t("cinema:slot.poster")}
          style={{ position: "absolute", inset: 0 }}
        />
        <span className={styles.pfGrant}>{film.grant}</span>
      </div>
      <div className={styles.pfTitle}>
        {film.titlePre}
        {film.titleEm && <em>{film.titleEm}</em>}
        {film.titlePost}
      </div>
      <div className={styles.pfMeta}>{film.meta}</div>
    </Link>
  );
}

export function CinemaOpenCallsBody() {
  const { t } = useTranslation();
  return (
    <section className={styles.body}>
      <div className="wrap">
        <div className={styles.section}>
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="cinema:openCalls.body.commissionsTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <span className={styles.count}>
              {t("cinema:openCalls.body.openCount", {
                count: commissions.length,
              })}
            </span>
          </div>
          {commissions.map((call) => (
            <CommissionCard key={call.id} call={call} />
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="cinema:openCalls.body.residenciesTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <span className={styles.count}>
              {t("cinema:openCalls.body.openCount", {
                count: smallCalls.length,
              })}
            </span>
          </div>
          <div className={styles.smallCalls}>
            {smallCalls.map((call) => (
              <SmallCallCard key={call.id} call={call} />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="cinema:openCalls.body.gotMadeTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <Link to={routes.cinemaBrowse} className={styles.allLink}>
              {t("cinema:openCalls.body.allFundedCta")}
            </Link>
          </div>
          <div className={styles.pastGrid}>
            {pastFunded.map((film) => (
              <PastFilmCard key={film.id} film={film} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
