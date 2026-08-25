import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PosterSlot } from "./CinemaAtoms";
import { routes } from "../../app/routeMap";
import type { Filmmaker } from "./cinemaFilmmaker.data";
import styles from "./CinemaFilmmakerPage.module.css";

const BADGE_CLASS = {
  free: styles.fgbFree,
  member: styles.fgbMem,
  rent: styles.fgbRent,
} as const;

export function FilmmakerMain({ filmmaker }: { filmmaker: Filmmaker }) {
  const { t } = useTranslation();
  return (
    <div className={styles.main}>
      {/* Filmography */}
      <div>
        <div className={styles.sb}>
          <h2>
            <Translation
              i18nKey="cinema:filmmaker.main.filmographyTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <span className={styles.sbAll}>
            {t("cinema:filmmaker.main.filmsTotal", {
              count: filmmaker.filmography.length,
            })}
          </span>
        </div>
        <div className={styles.filmog}>
          {filmmaker.filmography.map((film) => (
            <Link key={film.titlePre} to={film.href} className={styles.fgCard}>
              <div className={styles.fgPoster}>
                <PosterSlot src={film.image} tint={film.tint} radius={12} />
                <span
                  className={`${styles.fgBadge} ${BADGE_CLASS[film.badgeKind]}`}
                >
                  {film.badge}
                </span>
              </div>
              <div className={styles.fgEb}>{film.eyebrow}</div>
              <div className={styles.fgTitle}>
                {film.titlePre}
                {film.titleEm && <em>{film.titleEm}</em>}
                {film.titlePost}
              </div>
              <div className={styles.fgMeta}>{film.meta}</div>
              <div className={styles.fgEarn}>{film.earned}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Festival circuit */}
      <div>
        <div className={styles.sb}>
          <h2>
            <Translation
              i18nKey="cinema:filmmaker.main.festivalCircuitTitle"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.festList}>
          {filmmaker.festivals.map((f) => (
            <div key={`${f.year}-${f.namePre}`} className={styles.festRow}>
              <div className={styles.festYear}>{f.year}</div>
              <div>
                <div className={styles.festName}>
                  {f.namePre}
                  {f.nameEm && <em>{f.nameEm}</em>}
                </div>
                <div className={styles.festDetail}>{f.detail}</div>
              </div>
              <div className={styles.festAward}>{f.award}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div>
        <div className={styles.sb}>
          <h2>
            <Translation
              i18nKey="cinema:filmmaker.main.upcomingEventsTitle"
              values={{ name: filmmaker.nameEm }}
              components={{ em: <em /> }}
            />
          </h2>
          <Link to={routes.calendar} className={styles.sbAll}>
            {t("cinema:live.fullCalendarCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={styles.eventList}>
          {filmmaker.events.map((ev) => (
            <div key={ev.titlePre} className={styles.ev}>
              <div className={styles.evDate}>
                <div className="d">{ev.day}</div>
                <div className="m">{ev.month}</div>
              </div>
              <div className={styles.evMain}>
                <div className={styles.evKind}>{ev.kind}</div>
                <h4>
                  {ev.titlePre}
                  {ev.titleEm && <em>{ev.titleEm}</em>}
                  {ev.titlePost}
                </h4>
                <div className={styles.evSub}>{ev.sub}</div>
              </div>
              <Button
                variant="ghost"
                to={routes.rsvp}
                className={styles.evRsvp}
              >
                {t("cinema:live.rsvpCta")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
