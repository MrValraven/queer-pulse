import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FeatureHelp, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { coverFilm } from "./data";
import {
  PROGRAMME_WEEK,
  PROGRAMME_WEEK_END,
  PROGRAMME_WEEK_START,
  SECTION_NAV_KEYS,
} from "./cinemaPage.data";
import styles from "./CinemaPage.module.css";
import { routes } from "../../app/routeMap";

export function CinemaMast() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <section className={styles.mast}>
      <div className="wrap">
        <div className={styles.mastRow}>
          <div>
            <div className={styles.issue}>
              {t("cinema:mast.issueLabel", {
                week: PROGRAMME_WEEK,
                year: PROGRAMME_WEEK_START.getFullYear(),
              })}
            </div>
            <h1 className={styles.mastBrand}>
              Queer<em>Pulse</em> Cinema <FeatureHelp id="cinema.hub" />
            </h1>
          </div>
          <div className={styles.mastMeta}>
            <div className={styles.issue}>
              {fmt.date(PROGRAMME_WEEK_START, { day: "numeric" })} —{" "}
              {fmt.date(PROGRAMME_WEEK_END, { day: "numeric", month: "long" })}
            </div>
            <div className={styles.mastTag}>
              <Translation
                i18nKey="cinema:mast.tagline"
                components={{ em: <em /> }}
              />
            </div>
          </div>
        </div>
        <div className={styles.secNav}>
          {SECTION_NAV_KEYS.map((labelKey, i) => (
            <Link
              key={labelKey}
              to={routes.cinemaBrowse}
              className={[styles.cnLink, i === 0 && styles.cnLinkActive]
                .filter(Boolean)
                .join(" ")}
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AskStrip() {
  const { t } = useTranslation();
  return (
    <div className={styles.askStrip}>
      <div className="wrap">
        <div className={styles.askInner}>
          <div className={styles.askText}>
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <circle cx={12} cy={12} r={10} />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            {t("cinema:ask.text")}
          </div>
          <Button to={routes.cinemaBrowse}>
            {t("cinema:ask.cta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CinemaCover() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <section className={styles.cover}>
      <div className={styles.cvImg}>
        <ImageSlot
          src={coverFilm.image}
          tint="plum"
          width="100%"
          height="100%"
          radius={0}
          placeholder={t("cinema:slot.coverFilm")}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.cvOverlay} />
        <div className={styles.cvMarks}>
          <span className="pulse" />
          <span>{t("cinema:cover.nowShowing")}</span>
          <span className="dot" />
          <span>{t("cinema:cover.freeForSustainers")}</span>
          <span className="dot" />
          <span>{t("cinema:cover.liveQna")}</span>
        </div>
      </div>
      <div className={styles.cvText}>
        <div className={styles.cvKicker}>{coverFilm.kicker}</div>
        <h2 className={styles.cvTitle}>
          {coverFilm.titlePre}
          <em>{coverFilm.titleEm}</em>
          {coverFilm.titlePost}
        </h2>
        <div className={styles.cvMetaLine}>{coverFilm.meta}</div>
        <div className={styles.cvCurator}>
          <div className="who">{coverFilm.curatorWho}</div>
          <div className="cbody">{coverFilm.curatorBody}</div>
        </div>
        <div className={styles.cvActions}>
          <Button size="lg" to={routes.film}>
            {t("cinema:cover.watchNowCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.film}>
            {t("cinema:cover.rentCta", { price: fmt.currency(3) })}
          </Button>
          <Button variant="ghost-dark" to={routes.rsvp}>
            {t("cinema:cover.rsvpCta")}
          </Button>
        </div>
        <div className={styles.cvSplit}>
          <Translation
            i18nKey="cinema:cover.splitNote"
            components={{ strong: <strong /> }}
            values={{
              filmmakerShare: fmt.currency(2.4),
              platformShare: fmt.currency(0.6),
            }}
          />
        </div>
      </div>
    </section>
  );
}
