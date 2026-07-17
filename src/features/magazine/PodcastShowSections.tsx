import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PodcastListenModal } from "./PodcastShowModals";
import {
  EPISODES,
  OLDER_EPISODES,
  PLATFORMS,
  SHOW_INFO,
  EPISODE_PATH,
  MEMBER_PATH,
  NEWSLETTER_PATH,
  CONTACT_PATH,
  type Episode,
} from "./podcastShow.data";
import styles from "./PodcastShowPage.module.css";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="6 4 20 12 6 20" />
  </svg>
);

const OLDER_BATCH = 4;

export function PodcastHero() {
  const { t } = useTranslation();
  return (
    <div className={styles.hero}>
      <div className={styles.heroInner}>
        {/* Content: show name/cover, hosts and cadence are the show's own
            editorial fields — kept in English. */}
        <div className={styles.cover}>The Back Room · cover art</div>
        <div>
          <div className={styles.eyebrow}>
            {t("magazine:podcast.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            The Back <em>Room.</em>
          </h1>
          <p className={styles.byline}>
            Hosted by <b>Catarina Vaz</b> · produced by <b>Jonas Ferreira</b>
          </p>
          <div className={styles.meta}>
            <span>
              <b>34</b> episodes
            </span>
            <span>
              <b>~ 45 min</b> avg
            </span>
            <span>
              <b>Bi-weekly</b> · Thursdays
            </span>
            <span>
              Since <b>Aug 2024</b>
            </span>
          </div>
          <div className={styles.actions}>
            <Button to={EPISODE_PATH} variant="primary">
              <FiPlay style={{ verticalAlign: "-2px", marginRight: 8 }} />
              {t("magazine:podcast.hero.playLatestCta")}
            </Button>
            <Button to={NEWSLETTER_PATH} variant="ghost-dark">
              {t("magazine:podcast.hero.subscribeCta")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PodcastListenRow() {
  const { t } = useTranslation();
  const [listenOpen, setListenOpen] = useState(false);
  return (
    <div className={styles.listenRow}>
      <div className={styles.listenInner}>
        <span className={styles.listenLabel}>
          {t("magazine:podcast.listenOnLabel")}
        </span>
        {PLATFORMS.map((p) => (
          <button
            key={p.name}
            type="button"
            className={styles.listenBtn}
            onClick={() => setListenOpen(true)}
          >
            <span className={styles.listenIc} style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
      </div>
      {listenOpen && (
        <PodcastListenModal onClose={() => setListenOpen(false)} />
      )}
    </div>
  );
}

function EpisodeRow({ e }: { e: Episode }) {
  const { t } = useTranslation();
  return (
    <div className={styles.epRow}>
      <div className={styles.epNum}>
        {e.num}
        <em>{e.numEm}</em>
      </div>
      <div className={styles.epInfo}>
        <h3>
          <Link to={EPISODE_PATH}>{e.title}</Link>
        </h3>
        <p>{e.desc}</p>
        <div className={styles.emMeta}>{e.meta}</div>
      </div>
      <div className={styles.epActions}>
        <Link
          to={EPISODE_PATH}
          className={styles.play}
          title={t("magazine:podcast.playEpisodeAria")}
        >
          <PlayIcon />
        </Link>
        <span className={styles.epDuration}>{e.duration}</span>
      </div>
    </div>
  );
}

export function PodcastEpisodes() {
  const { t } = useTranslation();
  const [shown, setShown] = useState(0);
  const remaining = OLDER_EPISODES.length - shown;
  const visibleOlder = OLDER_EPISODES.slice(0, shown);

  return (
    <main>
      <div className={styles.epH}>
        <h2>
          <Translation
            i18nKey="magazine:podcast.aboutShowHeading"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      {/* Content: the show's own about-copy — kept in English. */}
      <p className={styles.aboutP}>
        Slow conversations between queer people doing the work of building
        community in Lisbon. Activists, clinicians, organisers, artists — one
        guest per episode, recorded in the back room of Café Beirão after
        closing time. <em>No interruptions, no time limit.</em>
      </p>
      <p className={`${styles.aboutP} ${styles.aboutPLast}`}>
        If our magazine is what we write down, this is what we say out loud.
        Pair it with a coffee in the morning or a walk in the late afternoon.
      </p>

      <div className={styles.epH}>
        <h2>{t("magazine:podcast.episodesHeading", { count: 34 })}</h2>
        <span className={styles.meta}>{t("magazine:podcast.newestFirst")}</span>
      </div>

      {/* Content: the featured episode's own kicker/title/description. */}
      <div className={styles.epFeat}>
        <div className={styles.epFeatKicker}>Latest · 5 days ago · 52 min</div>
        <h3>
          34 · Dr. Inês Pereira on{" "}
          <em>fifteen minutes of someone else's time</em>
        </h3>
        <p>
          The Anjos GP who treats trans patients as adults — and changed the
          protocol for an entire clinic. We talk about waiting rooms,
          prescription lists, and why she answers her own phone.
        </p>
        <div className={styles.epFeatRow}>
          <Link
            to={EPISODE_PATH}
            className={`${styles.play} ${styles.playLg}`}
            title={t("magazine:podcast.playEpisodeNumberAria", { number: 34 })}
          >
            <PlayIcon />
          </Link>
          <Link to={EPISODE_PATH} className={styles.epFeatNotes}>
            {t("magazine:podcast.viewEpisodeNotesCta")}
          </Link>
        </div>
      </div>

      <div className={styles.epList}>
        {EPISODES.map((e, i) => (
          <EpisodeRow e={e} key={`base-${i}`} />
        ))}
        {visibleOlder.map((e, i) => (
          <EpisodeRow e={e} key={`older-${i}`} />
        ))}
        {remaining > 0 && (
          <div className={styles.epMore}>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setShown((n) =>
                  Math.min(OLDER_EPISODES.length, n + OLDER_BATCH),
                )
              }
            >
              {t("magazine:podcast.showOlderEpisodes", {
                count: Math.min(OLDER_BATCH, remaining),
              })}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export function PodcastSidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <h4>{t("magazine:podcast.sidebar.hostsHeading")}</h4>
        {/* Content: host names/pronouns/roles are the show's own credits. */}
        <div className={styles.hostRow}>
          <div className={styles.hostAv}>CV</div>
          <div>
            <div className={styles.hostName}>
              <Link to={MEMBER_PATH}>Catarina Vaz</Link>
            </div>
            <div className={styles.hostRole}>she/her · interviewer</div>
          </div>
        </div>
        <div className={styles.hostRow}>
          <div
            className={styles.hostAv}
            style={{
              background: "rgba(var(--jade-rgb),.16)",
              color: "var(--jade)",
            }}
          >
            JF
          </div>
          <div>
            <div className={styles.hostName}>
              <Link to={MEMBER_PATH}>Jonas Ferreira</Link>
            </div>
            <div className={styles.hostRole}>he/him · producer · editor</div>
          </div>
        </div>
      </div>

      <div className={styles.sideCard}>
        <h4>{t("magazine:podcast.sidebar.aboutShowHeading")}</h4>
        {/* labelKey is chrome (translated); value describes this specific
            show and is content — left in English. */}
        {SHOW_INFO.map((row) => (
          <div className={styles.infoRow} key={row.labelKey}>
            <span>{t(row.labelKey)}</span>
            <b>{row.value}</b>
          </div>
        ))}
        <div className={styles.infoRow}>
          <span>{t("magazine:podcast.sidebar.sponsoredLabel")}</span>
          <b style={{ color: "var(--jade)" }}>No · ever</b>
        </div>
      </div>

      <div className={`${styles.sideCard} ${styles.guestCard}`}>
        <h4>{t("magazine:podcast.sidebar.guestHeading")}</h4>
        <p>{t("magazine:podcast.sidebar.guestBody")}</p>
        <Button
          to={CONTACT_PATH}
          variant="ghost-dark"
          className={styles.guestBtn}
        >
          {t("magazine:podcast.sidebar.writeToTeamCta")}
        </Button>
      </div>
    </aside>
  );
}
