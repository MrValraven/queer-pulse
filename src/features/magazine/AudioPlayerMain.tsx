import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../shared/components/feedback/useToast'
import { HOME, MEMBER, SHOW, SPEEDS } from './audioPlayer.data'
import styles from './AudioPlayerPage.module.css'

export function AudioPlayerMain() {
  const { showToast } = useToast()
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState('1.0×')
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)

  const share = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(location.href)
    showToast('Link copied', 'success')
  }

  return (
    <>
      <div className={styles.topbar}>
        <Link to={SHOW} className={styles.back}>
          ← Back to show
        </Link>
        <Link to={HOME} className={styles.brand}>
          <span className={styles.brandDot} />
          Queer<span className={styles.brandItalic}>Pulse</span>
        </Link>
        <div className={styles.extra}>
          <button type="button" className={styles.iconBtn} title="Share" onClick={share}>
            <svg viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button type="button" className={styles.iconBtn} title="Cast / AirPlay" onClick={() => showToast('Looking for nearby devices', 'info')}>
            <svg viewBox="0 0 24 24">
              <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
              <line x1="2" y1="20" x2="2.01" y2="20" />
            </svg>
          </button>
        </div>
      </div>

      <main className={styles.wrap}>
        <div className={styles.cover}>The Back Room · cover art</div>
        <div className={styles.info}>
          <div className={styles.show}>
            <Link to={SHOW}>The Back Room</Link> · Episode <em>34</em>
          </div>
          <h1 className={styles.title}>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </h1>
          <p className={styles.guest}>
            In conversation with{' '}
            <Link to={MEMBER}>
              <b>Catarina Vaz</b>
            </Link>{' '}
            · recorded 6 May at Café Beirão · 52 min
          </p>

          <div>
            <div
              className={styles.bar}
              role="button"
              tabIndex={0}
              aria-label="Seek"
              onClick={() => showToast('Seeking…', 'info')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  showToast('Seeking…', 'info')
                }
              }}
            >
              <div className={styles.barFill} style={{ width: '38%' }} />
            </div>
            <div className={styles.times}>
              <span>
                <b>19:42</b>
              </span>
              <span>52:14</span>
            </div>
          </div>

          <div className={styles.controls}>
            <button type="button" className={styles.ctrl} title="Previous chapter" onClick={() => showToast('Previous chapter', 'info')}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" />
              </svg>
            </button>
            <button type="button" className={styles.ctrl} title="-15s" onClick={() => showToast('-15s', 'info')}>
              <svg viewBox="0 0 24 24">
                <path d="M2.5 2v6h6" />
                <path d="M21.5 12A9 9 0 1 1 6 5.3L2.5 8" />
              </svg>
            </button>
            <button type="button" className={styles.playBtn} onClick={() => setPlaying((p) => !p)}>
              {playing ? (
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <polygon points="6 4 20 12 6 20" />
                </svg>
              )}
            </button>
            <button type="button" className={styles.ctrl} title="+30s" onClick={() => showToast('+30s', 'info')}>
              <svg viewBox="0 0 24 24">
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 12A9 9 0 1 0 18 5.3L21.5 8" />
              </svg>
            </button>
            <button type="button" className={styles.ctrl} title="Next chapter" onClick={() => showToast('Next chapter', 'info')}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" />
              </svg>
            </button>
          </div>

          <div className={styles.secondary}>
            <div className={styles.speed}>
              {SPEEDS.map((sp) => (
                <button key={sp} type="button" className={[styles.speedBtn, speed === sp && styles.speedActive].filter(Boolean).join(' ')} onClick={() => setSpeed(sp)}>
                  {sp}
                </button>
              ))}
            </div>
            <div className={styles.actionsRow}>
              <button type="button" className={[styles.actionBtn, saved && styles.actionActive].filter(Boolean).join(' ')} onClick={() => setSaved((v) => !v)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save
              </button>
              <button type="button" className={[styles.actionBtn, liked && styles.actionActive].filter(Boolean).join(' ')} onClick={() => setLiked((v) => !v)}>
                <svg viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Like
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => showToast('Sleep timer · 30 min', 'info')}>
                <svg viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Sleep
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
