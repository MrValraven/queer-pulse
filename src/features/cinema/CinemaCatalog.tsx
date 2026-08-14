import { Link } from "react-router-dom";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { Avatar, SectionHead } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SplitTitle, PosterSlot } from "./CinemaAtoms";
import { accessLabel, collections, films, shorts } from "./data";
import { PROGRAMME_WEEK } from "./cinemaPage.data";
import styles from "./CinemaPage.module.css";
import { routes } from "../../app/routeMap";

const accessClass = {
  free: styles.free,
  member: styles.member,
  rent: styles.rent,
};

export function ProgrammeSection() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.sec}>
      <SectionHead
        dark
        className={styles.cinemaSectionHead}
        title={
          <Translation
            i18nKey="cinema:programme.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:programme.lead")}
        linkTo={routes.cinemaBrowse}
        linkLabel={t("cinema:programme.allCta")}
      />
      <div className={styles.prog}>
        {films.map((film) => (
          <Link key={film.id} to={routes.film} className={styles.film}>
            <div className={styles.poster}>
              <PosterSlot src={film.image} tint={film.tint} radius={14} />
              <span className={`${styles.fTag} ${accessClass[film.access]}`}>
                {accessLabel(film, t, fmt)}
              </span>
            </div>
            <div className={styles.fKicker}>{film.kicker}</div>
            <h3 className={styles.fTitle}>
              <SplitTitle
                pre={film.titlePre}
                em={film.titleEm}
                post={film.titlePost}
              />
            </h3>
            <div className={styles.fMeta}>{film.meta}</div>
            <div className={styles.fNote}>
              {film.note} <span className={styles.by}>{film.by}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.note}>
        <div className={styles.noteTag}>
          <Translation
            i18nKey="cinema:programme.notebook.eyebrow"
            components={{ em: <em /> }}
          />
          <br />
          {t("cinema:programme.notebook.week", { week: PROGRAMME_WEEK })}
        </div>
        <div>
          <p className={styles.nq}>
            “We chose six films this week that share one thing: they refuse the
            cleanness of the coming-out arc. They are messy, slow, alive.{" "}
            <em>Watch them in the order you want.</em>”
          </p>
          <div className={styles.sig}>
            Sara Marques, programming lead.{" "}
            <Link to={routes.cinemaBrowse}>
              {t("cinema:programme.notebook.readMoreCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionsSection() {
  const { t } = useTranslation();

  return (
    <div className={styles.sec}>
      <SectionHead
        dark
        className={styles.cinemaSectionHead}
        title={
          <Translation
            i18nKey="cinema:collectionsSection.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:collectionsSection.lead")}
        linkTo={routes.cinemaBrowse}
        linkLabel={t("cinema:collectionsSection.allCta")}
      />
      <div className={styles.collGrid}>
        {collections.map((c) => (
          <Link
            key={c.slug}
            to={`${routes.cinemaCollections}/${c.slug}`}
            className={styles.coll}
          >
            <div className={styles.collTag}>{c.tag}</div>
            <h3>
              <SplitTitle pre={c.titlePre} em={c.titleEm} post={c.titlePost} />
            </h3>
            <p>{c.desc}</p>
            <div className={styles.collBy}>
              <Avatar initials={c.av} tint="coral" size={22} />
              {c.by}
            </div>
            <div className={styles.collCount}>
              <span>{c.count}</span>
              <span>
                <em>{c.total}</em> {t("cinema:collectionsSection.totalSuffix")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MadeHereSection() {
  const { t } = useTranslation();

  return (
    <div className={styles.sec}>
      <SectionHead
        dark
        className={styles.cinemaSectionHead}
        title={
          <Translation
            i18nKey="cinema:madeHere.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:madeHere.lead")}
        linkTo={routes.cinemaShorts}
        linkLabel={t("cinema:madeHere.exploreCta")}
      />
      <div className={styles.shortGrid}>
        {shorts.map((s) => (
          <Link key={s.titlePre} to={routes.film} className={styles.short}>
            <div className={styles.shortEyebrow}>{s.eyebrow}</div>
            <h4>
              <SplitTitle pre={s.titlePre} em={s.titleEm} post={s.titlePost} />
            </h4>
            <p>{s.desc}</p>
            <div className={styles.shortMeta}>
              {s.metaBy} · <FiStar aria-hidden /> {s.metaWatches}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
