import { FiInfo } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SplitTitle, PosterSlot } from "./CinemaAtoms";
import type { CollectionDetail, CollectionFilm } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

function FilmEntry({ film }: { film: CollectionFilm }) {
  const { t } = useTranslation();
  const watchLabel = t(
    film.free
      ? "cinema:collection.films.watchCta"
      : "cinema:collection.films.watchNowCta",
  );
  return (
    <div className={styles.entry}>
      <div className={styles.entryNum} aria-hidden>
        <em>{film.num}</em>
      </div>
      <div className={styles.poster}>
        <PosterSlot src={film.image} tint={film.tint} radius={12} />
      </div>
      <div className={styles.entryMain}>
        <div className={styles.kicker}>
          <span>{film.kicker}</span>
          <span className={styles.dot} aria-hidden />
          <span className={styles.kind}>{film.kind}</span>
        </div>
        <div className={styles.entryTitle}>
          <SplitTitle pre={film.titlePre} em={film.titleEm} post={film.titlePost} />
        </div>
        <div className={styles.entryMeta}>{film.meta}</div>
        <blockquote className={styles.why}>
          {film.why}
          <span className={styles.who}>— {film.who}</span>
        </blockquote>
        <div className={styles.entryTags}>
          {film.tags.map((t) => (
            <span key={t} className={styles.entryTag}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.entrySide}>
        <div className={`${styles.price} ${film.free ? styles.priceFree : ""}`}>
          {film.price}
        </div>
        <Button
          to={routes.film}
          size="md"
          variant={film.primary ? "primary" : "ghost"}
          className={styles.entryBtn}
        >
          {watchLabel}
        </Button>
        {film.secondary && (
          <Button
            to={routes.film}
            size="md"
            variant="ghost"
            className={styles.entryBtn}
          >
            {film.secondary}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Ordered, numbered film list with the curator's "why this order" note. */
export function CinemaCollectionFilms({ data }: { data: CollectionDetail }) {
  const { t } = useTranslation();
  return (
    <div>
      {data.orderNote && (
        <div className={styles.orderNote}>
          <FiInfo aria-hidden />
          <p>{data.orderNote}</p>
        </div>
      )}

      <div className={styles.filmList}>
        {data.films.map((film, i) => (
          <FadeIn key={film.num} delay={Math.min(i, 6) * 70}>
            <FilmEntry film={film} />
          </FadeIn>
        ))}

        {data.showingNote && (
          <div className={styles.showMore}>
            <div className={styles.showNote}>{data.showingNote}</div>
            <Button variant="ghost">
              {data.seeAllLabel ?? t("cinema:collection.films.seeAllFallback")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
