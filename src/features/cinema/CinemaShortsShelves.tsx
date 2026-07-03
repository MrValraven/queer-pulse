import { Link } from "react-router-dom";
import { FiPlay, FiShare2 } from "react-icons/fi";
import { Avatar, FadeIn, ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  continueWatching,
  getShort,
  makers,
  programmes,
  type ShortsShelf,
} from "./cinemaShorts.data";
import { SecDiv, ShortTitle } from "./CinemaShortsParts";
import styles from "./CinemaShortsPage.module.css";

/** Pick-up-where-you-left-off rail. Hidden when nothing is in progress. */
export function ContinueWatching() {
  const items = continueWatching
    .map((c) => ({ film: getShort(c.id), pct: c.pct }))
    .filter(
      (
        c,
      ): c is { film: NonNullable<ReturnType<typeof getShort>>; pct: number } =>
        Boolean(c.film),
    );
  if (items.length === 0) return null;

  return (
    <div>
      <SecDiv
        title={
          <>
            Continue <em>watching</em>
          </>
        }
        sub="Pick up where you left off"
        actionTo={routes.cinemaWatch}
        actionLabel="Your library →"
      />
      <div className={styles.rail}>
        {items.map(({ film, pct }) => {
          const left = Math.round(film.runtime * (1 - pct / 100));
          return (
            <Link
              key={film.id}
              to={routes.cinemaWatch}
              className={styles.cwCard}
            >
              <div className={styles.cwPoster}>
                <ImageSlot
                  tint={film.tint}
                  width="100%"
                  height="100%"
                  radius={12}
                  placeholder="poster"
                  style={{ position: "absolute", inset: 0 }}
                />
                <div className={styles.cwPlay}>
                  <span>
                    <FiPlay aria-hidden />
                  </span>
                </div>
                <div className={styles.cwBar}>
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className={styles.cwTitle}>
                <ShortTitle film={film} />
              </div>
              <div className={styles.cwLeft}>
                {left} min left · {film.makerShort}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Curated short-set programmes. */
export function Programmes({ shelf }: { shelf: ShortsShelf }) {
  return (
    <>
      <SecDiv
        title={
          <>
            Watch by <em>programme</em>
          </>
        }
        sub="Short sets curated by members — a way in when you don't know where to start"
        actionTo={routes.cinemaCollections}
        actionLabel="All programmes →"
      />
      <div className={styles.progGrid}>
        {programmes.map((p) => (
          <Link
            key={p.id}
            to={routes.cinemaCollections}
            className={styles.progCard}
          >
            <ImageSlot
              tint={p.tint}
              width="100%"
              height="100%"
              placeholder="programme cover"
              style={{ position: "absolute", inset: 0 }}
            />
            <span
              role="button"
              tabIndex={0}
              className={styles.progShare}
              aria-label="Share programme"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                shelf.onShare(`${p.titlePre}${p.titleEm}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  shelf.onShare(`${p.titlePre}${p.titleEm}`);
                }
              }}
            >
              <FiShare2 aria-hidden />
            </span>
            <div className={styles.progInner}>
              <span className={styles.progCount}>{p.count}</span>
              <div className={styles.progTitle}>
                {p.titlePre}
                <em>{p.titleEm}</em>
              </div>
              <div className={styles.progCurator}>{p.curator}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

/** People-behind-the-films row. */
export function MeetTheMakers() {
  return (
    <>
      <SecDiv
        title={
          <>
            Meet the <em>makers</em>
          </>
        }
        sub="Every film here has a person behind it — say hello"
        actionTo={routes.cinemaBrowse}
        actionLabel="All filmmakers →"
      />
      <div className={styles.makersRow}>
        {makers.map((m, i) => (
          <FadeIn key={m.name} delay={Math.min(i, 7) * 50}>
            <Link
              to={`${routes.cinemaFilmmaker}/${m.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={styles.makerCard}
            >
              <Avatar
                initials={m.initials}
                tint={m.tint}
                size={60}
                className={styles.mkAv}
              />
              <div className={styles.mkName}>{m.name}</div>
              <div className={styles.mkRole}>{m.role}</div>
              <div className={styles.mkStat}>{m.stat}</div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </>
  );
}
