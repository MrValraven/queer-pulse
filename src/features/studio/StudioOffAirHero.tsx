import { IconButton, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { nightcapImage } from "./studioOffAir.data";
import styles from "./StudioOffAirPage.module.css";

const NIGHTCAP_TITLE = "Vespertina, vol. iv";
const NIGHTCAP_TITLE_PRE = "Vespertina, ";
const NIGHTCAP_TITLE_EM = "vol. iv";

const NIGHTCAP_CURATOR = "Sara Marques";
const NIGHTCAP_DURATION = "1h 42m";
const NIGHTCAP_TRACK_COUNT = 12;

// The curator who closed the night and when: proper noun and clock figure,
// slotted into the catalog attribution line.
const SIGNOFF_CURATOR = "Sara Marques";
const SIGNOFF_TIME = "01:58";

// The next broadcast's show title and host: proper nouns, slotted into the
// catalog title line.
const NEXT_SHOW_TITLE = "Morning pages";
const NEXT_SHOW_HOST = "D. Okoye";

export function StudioOffAirHero() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <section className={styles.offairHero}>
      <div className={styles.offairInner}>
        <div className={styles.offairEb}>
          <svg
            className={styles.moon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          {t("studio:offAir.hero.statusLine", { time: "03:14" })}
          <span className={styles.sep} aria-hidden />
          {t("studio:offAir.hero.roomDark")}
        </div>

        <h1>
          <Translation
            i18nKey="studio:offAir.hero.title"
            components={{ em: <em /> }}
          />
        </h1>

        <p className={styles.signoff}>
          {t("studioShowcase:offAir.hero.signoff.quote")}
          <span className={styles.signoffWho}>
            {t("studioShowcase:offAir.hero.signoff.attribution", {
              name: SIGNOFF_CURATOR,
              time: SIGNOFF_TIME,
            })}
          </span>
        </p>

        {/* Next broadcast */}
        <div className={styles.nextStrip}>
          <div className={styles.clock}>
            <div className={styles.clockTime}>
              <em>04</em>:46
            </div>
            <div className={styles.clockLabel}>
              {t("studio:offAir.hero.untilDoors")}
            </div>
          </div>
          <div className={styles.vr} aria-hidden />
          <div className={styles.nsInfo}>
            <div className={styles.nsEb}>
              {t("studio:offAir.hero.nextBroadcastLabel", { time: "08:00" })}
            </div>
            <h3>
              <Translation
                i18nKey="studioShowcase:offAir.hero.nextShow.title"
                components={{ em: <em /> }}
                values={{ show: NEXT_SHOW_TITLE, host: NEXT_SHOW_HOST }}
              />
            </h3>
            <p>{t("studioShowcase:offAir.hero.nextShow.description")}</p>
          </div>
        </div>

        {/* Night-cap replay */}
        <div className={styles.nightcap}>
          <div className={styles.ncCover}>
            <ImageSlot
              src={nightcapImage}
              tint="plum"
              width={78}
              height={78}
              radius={10}
              placeholder={t("studio:media.setArtLabel")}
            />
          </div>
          <div className={styles.ncInfo}>
            <div className={styles.ncEb}>
              {t("studio:offAir.hero.nightcapEyebrow")}
            </div>
            <h3>
              {NIGHTCAP_TITLE_PRE}
              <em>{NIGHTCAP_TITLE_EM}</em>
            </h3>
            <p>
              {[
                NIGHTCAP_CURATOR,
                NIGHTCAP_DURATION,
                t("studioShowcase:offAir.meta.trackCount", {
                  count: NIGHTCAP_TRACK_COUNT,
                }),
                t("studio:offAir.hero.replaySuffix"),
              ].join(" · ")}
            </p>
          </div>
          <IconButton
            className={styles.playBig}
            aria-label={t("studio:offAir.hero.replayAria")}
            tooltip
            onClick={() =>
              showToast(
                t("studio:offAir.hero.replayingToast", {
                  title: NIGHTCAP_TITLE,
                }),
                "success",
              )
            }
          >
            <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden>
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </IconButton>
        </div>
      </div>
    </section>
  );
}
