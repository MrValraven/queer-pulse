import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck, FiArrowRight } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioTipModal } from "./StudioTipModal";
import {
  SET,
  TRACKS,
  HERO_ART,
  HERO_TRACK,
  HERO_STATS,
  WEDNESDAY_SET,
  RECAP_AVATARS,
  type TrackCard,
} from "./studioPage.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

const tagClass: Record<TrackCard["tag"], string> = {
  free: styles.tagFree!,
  mem: styles.tagMem!,
};

export function StudioHero() {
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tipOpen, setTipOpen] = useState(false);
  const saved = isSaved(HERO_TRACK.id);

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          <ImageSlot
            src={HERO_ART}
            tint="coral"
            width="100%"
            height="100%"
            radius={16}
            placeholder={`${t("studio:media.coverLabel")} · ${HERO_TRACK.artist}`}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.eb}>
            <span className={styles.live} />
            {t("studio:room.hero.onAirEyebrow", {
              track: HERO_STATS.onAirTrack,
            })}
          </div>
          <h1>
            {HERO_TRACK.titlePre}
            <em>{HERO_TRACK.titleEm}</em>
          </h1>
          <div className={styles.by}>
            <Translation
              i18nKey="studio:room.hero.byFromLine"
              components={{ strong: <strong />, em: <em /> }}
              values={{
                artist: HERO_TRACK.artist,
                album: HERO_TRACK.album,
                year: HERO_TRACK.year,
                place: HERO_TRACK.place,
              }}
            />
          </div>
          <div className={styles.stats}>
            <span>
              <Translation
                i18nKey="studio:room.hero.listening"
                components={{ em: <em /> }}
                values={{ count: HERO_STATS.listeningNow }}
              />
            </span>
            <span className={styles.dot} />
            <span>
              {t("studio:room.hero.trackPosition", {
                current: HERO_STATS.onAirTrack,
                total: HERO_STATS.trackTotal,
                duration: HERO_STATS.duration,
              })}
            </span>
            <span className={styles.dot} />
            <span>{HERO_STATS.audioFormat}</span>
          </div>
          <div className={styles.heroActions}>
            <Link
              to={routes.studioAlbum}
              className={styles.playBig}
              aria-label={t("studio:player.play")}
            >
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => {
                const now = toggleSave(HERO_TRACK);
                showToast(
                  now
                    ? t("studio:room.hero.addedToast")
                    : t("studio:room.hero.removedToast"),
                  now ? "success" : "info",
                );
              }}
            >
              {saved ? (
                <>
                  <FiCheck /> {t("studio:room.hero.inLibrary")}
                </>
              ) : (
                <>
                  <FiPlus /> {t("studio:room.hero.addLibrary")}
                </>
              )}
            </button>
            <button
              type="button"
              className={styles.tip}
              onClick={() => setTipOpen(true)}
            >
              <FiHeart />{" "}
              {t("studio:player.tipCta", {
                amount: fmt.currency(HERO_STATS.perPlayAmount),
              })}
            </button>
          </div>
          <div className={styles.payPill}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>
              <Translation
                i18nKey="studio:room.hero.payNote"
                components={{ em: <em /> }}
                values={{
                  artist: HERO_TRACK.artist,
                  amount: fmt.currency(HERO_STATS.perPlayAmount),
                }}
              />{" "}
              <span className={styles.small}>
                {t("studio:room.hero.tipOnTop")}
              </span>
            </span>
          </div>
        </div>
      </div>
      {tipOpen && (
        <StudioTipModal
          recipient={HERO_TRACK.artist}
          onClose={() => setTipOpen(false)}
        />
      )}
    </section>
  );
}

export function StudioSetSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.row}>
      <div className={styles.rowH}>
        <h2>
          <Translation
            i18nKey="studio:room.set.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.sub}>
          {t("studio:room.set.subtitle", {
            curator: WEDNESDAY_SET.curator,
            count: WEDNESDAY_SET.listeners,
          })}
        </div>
      </div>
      <div className={styles.split}>
        <div className={styles.setCard}>
          <h3>
            {WEDNESDAY_SET.titlePre}
            <em>{WEDNESDAY_SET.titleEm}</em>
          </h3>
          <div className={styles.setDesc}>{WEDNESDAY_SET.description}</div>
          {SET.map((row) => (
            <div
              key={row.n}
              className={[styles.setRow, row.now && styles.setRowNow]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.n}>{row.n}</div>
              <div className={styles.srCov}>
                <ImageSlot
                  src={row.image}
                  tint={row.cvTint}
                  width={36}
                  height={36}
                  radius={5}
                  placeholder=""
                />
              </div>
              <div>
                <h5>
                  {row.titlePre}
                  {row.titleEm && <em>{row.titleEm}</em>}
                </h5>
                <div className={styles.who}>{row.who}</div>
              </div>
              <div className={styles.pay}>
                {row.payNote && <b>{row.payNote}</b>}
                {row.pay}
              </div>
              <div className={styles.tm}>{row.tm}</div>
            </div>
          ))}
        </div>

        <StudioSideCol />
      </div>
    </section>
  );
}

function StudioSideCol() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.sideCol}>
      <div className={styles.sideCard}>
        <div className={styles.eb}>
          <span className={styles.live} />
          {t("studio:room.set.sideHeading")}
        </div>
        <div className={styles.ct}>
          <Translation
            i18nKey="studio:room.hero.listening"
            components={{ em: <em /> }}
            values={{ count: WEDNESDAY_SET.listeners }}
          />
        </div>
        <div className={styles.sub}>
          {t("studio:room.set.sideSub", {
            sustainers: WEDNESDAY_SET.sustainers,
            casual: WEDNESDAY_SET.casual,
            cities: WEDNESDAY_SET.cities,
          })}
        </div>
        <div className={styles.avStack}>
          {RECAP_AVATARS.map((a, i) => (
            <span
              key={a}
              className={[styles.av, i % 2 === 1 && styles.jade]
                .filter(Boolean)
                .join(" ")}
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>{t("studio:room.set.ledgerHead")}</div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:room.set.ledgerPaidArtists")}
          </span>
          <span className={styles.v}>
            {fmt.currency(WEDNESDAY_SET.ledgerPaidArtists)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:room.set.ledgerPlays")}</span>
          <span className={styles.v}>{WEDNESDAY_SET.ledgerPlays}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:room.set.ledgerArtistShare")}
          </span>
          <span className={styles.v}>
            {fmt.number(WEDNESDAY_SET.ledgerArtistShare, {
              style: "percent",
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:room.set.ledgerPerPlay")}</span>
          <span className={styles.v}>
            {fmt.currency(WEDNESDAY_SET.ledgerPerPlay)}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:room.set.readPlanCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function StudioTracksSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.row}>
      <div className={styles.rowH}>
        <h2>
          <Translation
            i18nKey="studio:room.tracks.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.sub}>{t("studio:room.tracks.subtitle")}</div>
        <Link to={routes.studioAlbum} className={styles.all}>
          {t("studio:room.tracks.allCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
      <div className={styles.rowGrid}>
        {TRACKS.map((track) => (
          <Link
            key={track.titlePre}
            to={routes.studioAlbum}
            className={styles.card}
          >
            <div className={styles.cardCov}>
              <ImageSlot
                src={track.image}
                tint={track.cvTint}
                width="100%"
                height="100%"
                radius={10}
                placeholder={t("studio:media.coverLabel")}
                style={{ position: "absolute", inset: 0 }}
              />
              <span className={`${styles.tag} ${tagClass[track.tag]}`}>
                {t(track.tagLabelKey)}
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label={t("studio:player.play")}
                className={styles.playFab}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <svg viewBox="0 0 12 14" fill="currentColor">
                  <path d="M1 1l10 6-10 6z" />
                </svg>
              </span>
            </div>
            <div className={styles.byCur}>{track.curator}</div>
            <h4>
              {track.titlePre}
              {track.titleEm && <em>{track.titleEm}</em>}
            </h4>
            <div className={styles.meta}>
              <span>{track.who}</span> · {track.time}
            </div>
            <div className={styles.payLine}>
              <span>{t("studio:room.tracks.perPlay")}</span>
              <em>{fmt.currency(HERO_STATS.perPlayAmount)}</em>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
