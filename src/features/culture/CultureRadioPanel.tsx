import { useState } from "react";
import { FiSkipBack, FiSkipForward, FiPlay } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubmitPlaylistModal } from "./CultureFormModals";
import { RADIO } from "./culture.data";
import styles from "./CulturePage.module.css";

/**
 * Full-bleed plum radio player, shown only on the Radio tab. There is no
 * real audio-streaming backend behind this yet, so the transport controls
 * are honestly inert (disabled, with a plain note) rather than faking a
 * play/pause toggle with nothing playing. "Become a curator" opens the real
 * `SubmitPlaylistModal` flow; the old "past playlists" link had nothing
 * behind it, so it's gone rather than left dead.
 */
export function CultureRadioPanel() {
  const { t } = useTranslation();
  const [curating, setCurating] = useState(false);

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
              <button type="button" onClick={() => setCurating(true)}>
                {t("culture:radio.becomeCurator")}
              </button>
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
                disabled
                aria-label={t("culture:radio.previousTrack")}
              >
                <FiSkipBack size={18} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.rPlay}
                disabled
                aria-label={t("culture:radio.play")}
              >
                <FiPlay size={22} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.rBtn}
                disabled
                aria-label={t("culture:radio.nextTrack")}
              >
                <FiSkipForward size={18} aria-hidden />
              </button>
              <div style={{ flex: 1 }} />
              <span className={styles.radioTime}>{RADIO.now.time}</span>
            </div>
            <p className={styles.radioNote}>{t("culture:radio.playbackNote")}</p>
            <div className={styles.radioQueue}>
              <div className={styles.rqLabel}>{t("culture:radio.upNext")}</div>
              {RADIO.queue.map((item) => (
                <div key={item.number} className={styles.rqItem}>
                  <div className={styles.rqN}>{item.number}</div>
                  <div className={styles.rqInfo}>
                    <div className={styles.rqTrack}>{item.track}</div>
                    <div className={styles.rqArtist}>{item.artist}</div>
                  </div>
                  <div className={styles.rqDur}>{item.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {curating && <SubmitPlaylistModal onClose={() => setCurating(false)} />}
    </div>
  );
}
