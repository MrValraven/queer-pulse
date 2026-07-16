import { useState } from "react";
import { FiSkipBack, FiSkipForward, FiPlay, FiPause } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { RADIO } from "./culture.data";
import styles from "./CulturePage.module.css";

/** Full-bleed plum radio player, shown only on the Radio tab. */
export function CultureRadioPanel() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.radioFull}>
      <div className="wrap">
        <div className={styles.radioWrap}>
          <div>
            <div className={styles.curatorLabel}>
              {t(RADIO.curatorLabelKey)}
            </div>
            <div className={styles.curatorTitle}>{RADIO.curatorTitle}</div>
            <div className={styles.curatedBy}>
              {t("culture:radio.curatedBy", { name: RADIO.curatorName })}
            </div>
            <p className={styles.curatorQuote}>{RADIO.quote}</p>
            <div className={styles.curatorLinks}>
              <a href="#past">{t("culture:radio.pastPlaylists")}</a>
              <a href="#curate">{t("culture:radio.becomeCurator")}</a>
            </div>
          </div>

          <div className={styles.radioPlayer}>
            <div className={styles.radioNow}>
              <span className={styles.rdot} aria-hidden />
              {t("culture:radio.nowPlaying")}
            </div>
            <div className={styles.radioTrack}>{RADIO.now.track}</div>
            <div className={styles.radioArtist}>{RADIO.now.artist}</div>
            <div className={styles.radioBar}>
              <div
                className={styles.radioProg}
                style={{ width: `${RADIO.now.progress}%` }}
              />
            </div>
            <div className={styles.radioCtrls}>
              <button
                type="button"
                className={styles.rBtn}
                aria-label={t("culture:radio.previousTrack")}
              >
                <FiSkipBack size={18} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.rPlay}
                onClick={() => setPlaying((p) => !p)}
                aria-label={
                  playing ? t("culture:radio.pause") : t("culture:radio.play")
                }
              >
                {playing ? (
                  <FiPause size={22} aria-hidden />
                ) : (
                  <FiPlay size={22} aria-hidden />
                )}
              </button>
              <button
                type="button"
                className={styles.rBtn}
                aria-label={t("culture:radio.nextTrack")}
              >
                <FiSkipForward size={18} aria-hidden />
              </button>
              <div style={{ flex: 1 }} />
              <span className={styles.radioTime}>{RADIO.now.time}</span>
            </div>
            <div className={styles.radioQueue}>
              <div className={styles.rqLabel}>{t("culture:radio.upNext")}</div>
              {RADIO.queue.map((item) => (
                <div key={item.n} className={styles.rqItem}>
                  <div className={styles.rqN}>{item.n}</div>
                  <div className={styles.rqInfo}>
                    <div className={styles.rqTrack}>{item.track}</div>
                    <div className={styles.rqArtist}>{item.artist}</div>
                  </div>
                  <div className={styles.rqDur}>{item.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
