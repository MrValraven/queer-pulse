import { Link } from "react-router-dom";
import { FiPlay, FiShare2 } from "react-icons/fi";
import { Avatar, FadeIn, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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
          <Translation
            i18nKey="cinema:shorts.shelf.continueWatching.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:shorts.shelf.continueWatching.sub")}
        actionTo={routes.cinemaWatch}
        actionLabel={t("cinema:shorts.shelf.continueWatching.cta")}
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
                  placeholder={t("cinema:slot.poster")}
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
                {t("cinema:shorts.shelf.continueWatching.minutesLeft", {
                  minutes: left,
                  maker: film.makerShort,
                })}
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
  const { t } = useTranslation();
  return (
    <>
      <SecDiv
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.programmes.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:shorts.shelf.programmes.sub")}
        actionTo={routes.cinemaCollections}
        actionLabel={t("cinema:shorts.shelf.programmes.cta")}
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
              placeholder={t("cinema:slot.programmeCover")}
              style={{ position: "absolute", inset: 0 }}
            />
            <span
              role="button"
              tabIndex={0}
              className={styles.progShare}
              aria-label={t("cinema:shorts.shelf.programmes.shareAriaLabel")}
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
  const { t } = useTranslation();
  return (
    <>
      <SecDiv
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.meetMakers.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:shorts.shelf.meetMakers.sub")}
        actionTo={routes.cinemaBrowse}
        actionLabel={t("cinema:shorts.shelf.meetMakers.cta")}
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
