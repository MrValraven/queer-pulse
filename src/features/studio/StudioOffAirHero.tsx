import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { nightcapImage } from "./studioOffAir.data";
import styles from "./StudioOffAirPage.module.css";

const NIGHTCAP_TITLE = "Vespertina, vol. iv";
const NIGHTCAP_TITLE_PRE = "Vespertina, ";
const NIGHTCAP_TITLE_EM = "vol. iv";
const NIGHTCAP_PAID_OUT = 8.2;

// Content: the curator's own signoff quote and attribution — an authored
// closing statement, comes from the broadcast record in live mode.
const SIGNOFF_QUOTE =
  '"We played fourteen songs and paid fourteen people. Go to sleep. The ' +
  "catalogue stays open, and we'll be back when the kettle's on.\"";
const SIGNOFF_ATTRIBUTION = "Sara Marques, closing the Wednesday set at 01:58";

// Content: next broadcast's show title, host, and description — comes from
// the programme schedule in live mode.
const NEXT_SHOW_TITLE_PRE = "Morning pages with ";
const NEXT_SHOW_HOST = "D. Okoye";
const NEXT_SHOW_DESCRIPTION =
  "Ambient & trans composers · 90 minutes · captioned live";

// Content: the nightcap replay's curator/duration/track-count summary line.
const NIGHTCAP_SUMMARY = "Sara Marques · 1h 42m · 12 tracks · ";

export function StudioOffAirHero() {
  const { t } = useTranslation();
  const fmt = useFormat();
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
          {SIGNOFF_QUOTE}
          <span className={styles.signoffWho}>{SIGNOFF_ATTRIBUTION}</span>
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
              {NEXT_SHOW_TITLE_PRE}
              <em>{NEXT_SHOW_HOST}</em>
            </h3>
            <p>{NEXT_SHOW_DESCRIPTION}</p>
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
              {NIGHTCAP_SUMMARY}
              {t("studio:offAir.hero.paidOutSuffix", {
                amount: fmt.currency(NIGHTCAP_PAID_OUT),
              })}
            </p>
          </div>
          <button
            type="button"
            className={styles.playBig}
            aria-label={t("studio:offAir.hero.replayAria")}
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
          </button>
        </div>
      </div>
    </section>
  );
}
