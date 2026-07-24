import { useState } from "react";
import { Button, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { DEMO_WAVE, HERO_SET_ART } from "./studioLanding.data";
import styles from "./StudioLandingPage.module.css";

/** The mock "on the air" moment shown in the hero clock — a Wednesday broadcast slot. */
const ON_AIR_MOMENT = new Date(2026, 5, 10, 21, 18);
const HERO_SHARE_PERCENT = 0.8;
const HERO_TIP_PERCENT = 1;

const PayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export function StudioLandingHero() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.hero} id="top">
      <div className={styles.heroInner}>
        <div>
          <div className={styles.eb}>
            <span className={styles.live} />
            <span>{t("studio:landing.hero.onAirNow")}</span>
            <span className={styles.sep}>·</span>
            <span className={styles.clock}>
              {t("studio:landing.hero.clock", {
                weekday: fmt.date(ON_AIR_MOMENT, { weekday: "short" }),
                time: fmt.time(ON_AIR_MOMENT),
              })}
            </span>
          </div>
          <h1>
            <Translation
              i18nKey="studio:landing.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="studio:landing.hero.dek"
              components={{ em: <em /> }}
              values={{
                sharePercent: fmt.number(HERO_SHARE_PERCENT, {
                  style: "percent",
                }),
                tipPercent: fmt.number(HERO_TIP_PERCENT, { style: "percent" }),
              }}
            />
          </p>
          <div className={styles.actions}>
            <Button variant="ghost-dark" size="lg" href="#demo">
              {t("studio:landing.hero.demoCta")}
            </Button>
          </div>
        </div>

        <DemoCard />
      </div>
    </section>
  );
}

/** Demo set + track content — mock, kept in English regardless of language. */
const DEMO_SET = { titlePre: "Vespertina, ", titleEm: "vol. iv" };
const DEMO_META = {
  curator: "Sara Marques",
  duration: "1h 42m",
  trackCount: 12,
  listening: 312,
};
const DEMO_TRACK = { number: 6, titlePre: "Carta para a ", titleEm: "santa" };
const DEMO_ARTIST = { name: "Mariana Sol", album: "Cidade dos santos" };
const DEMO_PER_PLAY_AMOUNT = 0.05;
const DEMO_QUOTE_ATTRIBUTION = "Sara Marques";

function DemoCard() {
  const [playing, setPlaying] = useState(false);
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.demoCard} id="demo">
      <div className={styles.demoInner}>
        <div className={styles.demoEb}>
          <span className={styles.live} /> {t("studio:landing.demo.eyebrow")}
        </div>
        <h3>
          {DEMO_SET.titlePre}
          <em>{DEMO_SET.titleEm}</em>
        </h3>
        <div className={styles.demoMeta}>
          {t("studio:landing.demo.meta", DEMO_META)}
        </div>

        <div className={styles.demoRow}>
          <div className={styles.demoArt}>
            <ImageSlot
              src={HERO_SET_ART}
              tint="plum"
              width="100%"
              height="100%"
              radius={12}
              placeholder="cover · set art"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div>
            <div
              className={`${styles.wf} ${playing ? styles.playing : ""}`}
              aria-hidden
            >
              {DEMO_WAVE.map((bar, i) => (
                <span
                  key={i}
                  className={bar.played ? styles.played : undefined}
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
            <div className={styles.times}>
              <span className={styles.e}>1:42</span>
              <span>4:18</span>
            </div>
            <div className={styles.demoCtrl}>
              <button
                type="button"
                className={styles.demoPlay}
                aria-label={
                  playing
                    ? t("studio:landing.demo.pauseAria")
                    : t("studio:landing.demo.playAria")
                }
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? (
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <rect x="1" y="1" width="3.5" height="12" rx="1" />
                    <rect x="7.5" y="1" width="3.5" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <path d="M1 1l10 6-10 6z" />
                  </svg>
                )}
              </button>
              <div className={styles.demoInfo}>
                <div className={styles.t}>
                  {t("studio:landing.demo.trackPrefix", {
                    n: DEMO_TRACK.number,
                  })}{" "}
                  {DEMO_TRACK.titlePre}
                  <em>{DEMO_TRACK.titleEm}</em>
                </div>
                <div className={styles.a}>
                  {t("studio:landing.demo.byLine", {
                    artist: DEMO_ARTIST.name,
                    album: DEMO_ARTIST.album,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.payPill}>
          <PayIcon />
          <span>
            <Translation
              i18nKey="studio:landing.demo.payNote"
              components={{ em: <em /> }}
              values={{
                artist: DEMO_ARTIST.name,
                amount: fmt.currency(DEMO_PER_PLAY_AMOUNT),
              }}
            />
          </span>
        </div>

        <div className={styles.note}>
          <Translation
            i18nKey="studio:landing.demo.quote"
            components={{ em: <em /> }}
            values={{ attribution: DEMO_QUOTE_ATTRIBUTION }}
          />
        </div>
      </div>
    </div>
  );
}
