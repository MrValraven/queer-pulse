import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CinemaComingSoon } from "./CinemaComingSoon";
import { PageShell } from "../../shared/components/layout";
import { ImageSlot, Tag } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { films, filmRelationReason } from "./data";
import { FilmBody } from "./FilmBody";
import { FilmHero } from "./FilmHero";
import styles from "./FilmPage.module.css";
import { routes } from "../../app/routeMap";

const related = films.filter((f) => f.id !== "cascais").slice(0, 4);

export function FilmPage() {
  const { demoMode } = useDemoMode();
  // Mock film-detail page; the live catalogue links straight to /cinema/watch,
  // so this is only reachable via legacy links. Show coming-soon in live.
  if (!demoMode) return <CinemaComingSoon />;
  return <DemoFilmPage />;
}

function DemoFilmPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>{t("cinema:brand.tag")}</Link>
            <span className={styles.sep} aria-hidden>
              <FiChevronRight />
            </span>
            <Link to={routes.cinemaBrowse}>
              {t("cinema:mast.sectionNav.thisWeek")}
            </Link>
            <span className={styles.sep} aria-hidden>
              <FiChevronRight />
            </span>
            {/* eslint-disable-next-line local/no-literal-string -- this film's own title; content per the scope rule */}
            <span className={styles.cur}>The light between rooms</span>
            <Link to={routes.cinema} className={styles.crumbBack}>
              <FiArrowLeft aria-hidden /> {t("cinema:film.crumb.backCta")}
            </Link>
          </div>
        </div>
      </section>

      <FilmHero />
      <FilmBody />

      <section className={styles.splitBand}>
        <div className={`wrap ${styles.splitInner}`}>
          <div>
            <div className="eb">{t("cinema:film.split.eyebrow")}</div>
            <h2>
              <Translation
                i18nKey="cinema:film.split.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("cinema:film.split.body")}</p>
          </div>
          <div className={styles.splitBar}>
            <div className={styles.sbTitle}>
              {t("cinema:film.split.breakdownHeading", {
                price: fmt.currency(3),
              })}
            </div>
            <div className={styles.sbAmount}>
              {t("cinema:film.split.amountTo", {
                amount: fmt.currency(2.4),
                name: "Maria",
              })}
            </div>
            <div className={styles.sbBar}>
              <div className={`${styles.sbSeg} ${styles.fm}`}>
                {t("cinema:about.split.legend.filmmaker")}
              </div>
              <div className={`${styles.sbSeg} ${styles.pay}`}>12%</div>
              <div className={`${styles.sbSeg} ${styles.host}`}>8%</div>
            </div>
            <div className={styles.sbLegend}>
              <div>
                <span className="v">{fmt.currency(2.4)}</span>
                {t("cinema:about.split.legend.filmmaker")}
              </div>
              <div>
                <span className="v">{fmt.currency(0.36)}</span>
                {t("cinema:about.split.legend.paymentFees")}
              </div>
              <div>
                <span className="v">{fmt.currency(0.24)}</span>
                {t("cinema:about.split.legend.hosting")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.related}>
        <div className="wrap">
          <h2>
            <Translation
              i18nKey="cinema:film.related.title"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={styles.sub}>{t("cinema:film.related.sub")}</div>
          <div className={styles.relGrid}>
            {related.map((film) => (
              <Link key={film.id} to={routes.film} className={styles.rf}>
                <div className={styles.rfPoster}>
                  <ImageSlot
                    src={film.image}
                    tint={film.tint}
                    width="100%"
                    height="100%"
                    radius={12}
                    placeholder={t("cinema:slot.poster")}
                    style={{ position: "absolute", inset: 0 }}
                  />
                </div>
                <div className={styles.rfEb}>{film.format}</div>
                <div className={styles.rfTitle}>
                  {film.titlePre}
                  {film.titleEm && <em>{film.titleEm}</em>}
                  {film.titlePost}
                </div>
                <div className={styles.rfMeta}>{film.meta}</div>
                <Tag className={styles.rfReason}>
                  {filmRelationReason(film, t)}
                </Tag>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
