import { FiInfo } from "react-icons/fi";
import { Button, FadeIn, ImageSlot } from "../../shared/components/ui";
import type { CollectionDetail, CollectionFilm } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

function FilmEntry({ film }: { film: CollectionFilm }) {
  const watchLabel = film.free ? "Watch" : "Watch now";
  return (
    <div className={styles.entry}>
      <div className={styles.entryNum} aria-hidden>
        <em>{film.num}</em>
      </div>
      <div className={styles.poster}>
        <ImageSlot
          src={film.image}
          tint={film.tint}
          width="100%"
          height="100%"
          radius={12}
          placeholder="poster"
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div className={styles.entryMain}>
        <div className={styles.kicker}>
          <span>{film.kicker}</span>
          <span className={styles.dot} aria-hidden />
          <span className={styles.kind}>{film.kind}</span>
        </div>
        <div className={styles.entryTitle}>
          {film.titlePre}
          {film.titleEm && <em>{film.titleEm}</em>}
          {film.titlePost}
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
              {data.seeAllLabel ?? "See all films"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
