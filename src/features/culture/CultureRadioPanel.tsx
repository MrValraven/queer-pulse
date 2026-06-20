import { useState } from 'react'
import { RADIO } from './culture.data'
import styles from './CulturePage.module.css'

/** Full-bleed plum radio player, shown only on the Radio tab. */
export function CultureRadioPanel() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={styles.radioFull}>
      <div className="wrap">
        <div className={styles.radioWrap}>
          <div>
            <div className={styles.curatorLabel}>{RADIO.curatorLabel}</div>
            <div className={styles.curatorTitle}>{RADIO.curatorTitle}</div>
            <div className={styles.curatedBy}>{RADIO.curatedBy}</div>
            <p className={styles.curatorQuote}>{RADIO.quote}</p>
            <div className={styles.curatorLinks}>
              <a href="#past">Past playlists</a>
              <a href="#curate">Become a curator</a>
            </div>
          </div>

          <div className={styles.radioPlayer}>
            <div className={styles.radioNow}>
              <span className={styles.rdot} aria-hidden />
              Now playing
            </div>
            <div className={styles.radioTrack}>{RADIO.now.track}</div>
            <div className={styles.radioArtist}>{RADIO.now.artist}</div>
            <div className={styles.radioBar}>
              <div className={styles.radioProg} style={{ width: `${RADIO.now.progress}%` }} />
            </div>
            <div className={styles.radioCtrls}>
              <button className={styles.rBtn} aria-label="Previous track">⏮</button>
              <button
                className={styles.rPlay}
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button className={styles.rBtn} aria-label="Next track">⏭</button>
              <div style={{ flex: 1 }} />
              <span className={styles.radioTime}>{RADIO.now.time}</span>
            </div>
            <div className={styles.radioQueue}>
              <div className={styles.rqLabel}>Up next</div>
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
  )
}
