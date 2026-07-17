import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { FadeIn, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type ShortFilm, type ShortsShelf } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Renders a split title with the coral italic emphasis word. */
export function ShortTitle({ film }: { film: ShortFilm }) {
  return (
    <>
      {film.titlePre}
      <em>{film.titleEm}</em>
      {film.titlePost}
    </>
  );
}

/** A member film poster card, shared across every catalogue shelf. */
export function ShortCard({
  film,
  shelf,
  flash,
}: {
  film: ShortFilm;
  shelf: ShortsShelf;
  flash?: boolean;
}) {
  const { t } = useTranslation();
  const isSaved = shelf.saved.includes(film.id);
  const isSeen = shelf.seen.includes(film.id);
  const cls = [styles.shortCard, isSeen && styles.seen, flash && styles.flash]
    .filter(Boolean)
    .join(" ");

  const toggleSave = (e: {
    preventDefault(): void;
    stopPropagation(): void;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    shelf.onToggleSave(film.id);
  };

  return (
    <Link to={routes.film} className={cls} data-film={film.id}>
      <div className={styles.scPoster}>
        <ImageSlot
          tint={film.tint}
          width="100%"
          height="100%"
          radius={12}
          placeholder="poster"
          style={{ position: "absolute", inset: 0 }}
        />
        <span className={styles.scFree}>{t("cinema:access.free")}</span>
        <span className={styles.scRuntime}>{film.runtime} min</span>
        <span className={styles.scCc}>
          <span>CC</span>
          {film.ad && <span>AD</span>}
        </span>
        <span
          role="button"
          tabIndex={0}
          className={`${styles.scSave} ${isSaved ? styles.saved : ""}`}
          aria-label={t(
            isSaved
              ? "cinema:film.watchlist.remove"
              : "cinema:shorts.card.saveAriaLabel",
          )}
          aria-pressed={isSaved}
          onClick={toggleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleSave(e);
          }}
        >
          <FiHeart aria-hidden />
        </span>
      </div>
      <div className={styles.scEb}>
        {film.kind} · {film.lang} · {film.year}
      </div>
      <div className={styles.scTitle}>
        <ShortTitle film={film} />
      </div>
      <div className={styles.scMaker}>
        {film.makerShort}
        {film.grant && (
          <span className={styles.scGrantInline}>{film.grant}</span>
        )}
      </div>
      {film.moods.length > 0 && (
        <div className={styles.scMoods}>
          {film.moods.slice(0, 3).map((m) => (
            <span key={m} className={styles.mood}>
              {m}
            </span>
          ))}
        </div>
      )}
      <div className={styles.scMetarow}>
        <span className={styles.scWatches}>
          <span className={styles.heart}>
            <FiHeart aria-hidden />
          </span>
          {t("cinema:shorts.card.watches", { count: film.watches })}
        </span>
        {film.cn ? (
          <span className={styles.scCnWrap}>
            <span className={styles.scCn}>
              {t("cinema:shorts.card.contentNoteLabel")}
            </span>
            <span className={styles.cnPop}>
              <b>{t("cinema:shorts.card.contentNoteHeading")}</b>
              {film.cn}
            </span>
          </span>
        ) : (
          <span className={`${styles.scCn} ${styles.scCnNone}`}>
            {t("cinema:shorts.card.noContentNotes")}
          </span>
        )}
      </div>
    </Link>
  );
}

/** A grid of short cards with a staggered fade-in. */
export function ShortGrid({
  films,
  shelf,
}: {
  films: ShortFilm[];
  shelf: ShortsShelf;
}) {
  return (
    <div className={styles.shortsGrid}>
      {films.map((f, i) => (
        <FadeIn key={f.id} delay={Math.min(i, 7) * 50}>
          <ShortCard film={f} shelf={shelf} />
        </FadeIn>
      ))}
    </div>
  );
}

/** Shared section header: title + optional sub + trailing link. */
export function SecDiv({
  title,
  sub,
  actionTo,
  actionLabel,
}: {
  title: ReactNode;
  sub?: string;
  actionTo?: string;
  actionLabel?: string;
}) {
  return (
    <div className={styles.secDiv}>
      <h2>{title}</h2>
      {sub && <span className={styles.sub}>{sub}</span>}
      {actionTo && actionLabel && (
        <Link to={actionTo} className={styles.all}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
