import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ImageSlot } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved } from '../../app/providers/SavedProvider'
import { FACTS, FILM_POSTER, TIPS, WATCH_TABS } from './filmPage.data'
import styles from './FilmPage.module.css'
import { routes } from '../../app/routeMap'

const FILM_SAVED = {
  id: 'film:the-light-between-rooms',
  kind: 'film' as const,
  title: 'The light between rooms',
  href: '/film',
  meta: 'Maria Vasconcelos · 2025',
}

export function FilmHero() {
  const { showToast } = useToast()
  const { isSaved, toggleSave } = useSaved()
  const [tip, setTip] = useState(1)
  const [tab, setTab] = useState(0)

  const onWatchlist = isSaved(FILM_SAVED.id)
  function toggleWatchlist() {
    const next = toggleSave(FILM_SAVED)
    showToast(
      next ? 'Added to your watchlist' : 'Removed from your watchlist',
      next ? 'success' : 'info',
    )
  }

  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.posterCol}>
          <div className={styles.poster}>
            <ImageSlot src={FILM_POSTER} tint="plum" width="100%" height="100%" radius={18} placeholder="film poster · 3:4" style={{ position: 'absolute', inset: 0 }} />
            <Link to={routes.cinemaWatch} className={styles.playFab}>
              <span className={styles.playCircle}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
            </Link>
            <div className={styles.posterCaption}>Press play · trailer 1:42</div>
          </div>

          <div className={styles.tipjar}>
            <div className={styles.tipjarH}>↳ tip the filmmaker</div>
            <div className={styles.tipjarName}>
              Maria <em>Vasconcelos</em>
            </div>
            <div className={styles.tipjarSub}>100% goes to Maria. No fees skimmed.</div>
            <div className={styles.tipRow}>
              {TIPS.map((t, i) => (
                <button
                  key={t}
                  className={[styles.tipChip, tip === i && styles.tipChipOn].filter(Boolean).join(' ')}
                  onClick={() => {
                    setTip(i)
                    if (t !== '···') showToast(`Tipped ${t} to Maria`, 'success')
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.tipFoot}>
              <strong>187 members</strong> have tipped this week.
            </div>
          </div>
        </div>

        <div>
          <div className={styles.kicker}>
            <span>Cover film · week 23</span>
            <span className={styles.dot} />
            <span className={styles.by}>Programmed by João Ribeiro</span>
          </div>
          <h1 className={styles.title}>
            The light <em>between</em> rooms
          </h1>
          <div className={styles.meta}>Maria Vasconcelos · Portugal, 2025 · 92 min · documentary</div>

          <div className={styles.curatorPull}>
            <div className={styles.cpAv}>JR</div>
            <div className={styles.cpText}>
              “A patient, generous film about Lisbon's working-class queer elders, made over three
              years in the kitchens that raised them. <em>Stay for the second hour</em> — it's where
              the film stops being about loss and starts being about teaching.”
              <span className="who">— João Ribeiro · programming lead</span>
            </div>
          </div>

          <div className={styles.watchBlock}>
            <div className={styles.wbTabs}>
              {WATCH_TABS.map((t, i) => (
                <div
                  key={t.label}
                  className={[styles.wbTab, tab === i && styles.wbTabActive].filter(Boolean).join(' ')}
                  onClick={() => setTab(i)}
                >
                  <span>{t.label}</span>
                  <span className={styles.tw}>{t.sub}</span>
                </div>
              ))}
            </div>
            <div className={styles.wbActions}>
              <Button size="lg" to={routes.cinemaWatch}>
                ▶ &nbsp;Watch full film · 1h 32m
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={[styles.iconBtn, onWatchlist && styles.iconBtnOn].filter(Boolean).join(' ')}
                title={onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-pressed={onWatchlist}
                aria-label={onWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                onClick={toggleWatchlist}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleWatchlist()
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill={onWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span
                role="button"
                tabIndex={0}
                className={styles.iconBtn}
                title="Share"
                aria-label="Copy link to this film"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(window.location.href)
                    .then(() => showToast('Link copied', 'success'))
                    .catch(() => showToast('Could not copy link', 'error'))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    void navigator.clipboard
                      ?.writeText(window.location.href)
                      .then(() => showToast('Link copied', 'success'))
                      .catch(() => showToast('Could not copy link', 'error'))
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={18} cy={5} r={3} />
                  <circle cx={6} cy={12} r={3} />
                  <circle cx={18} cy={19} r={3} />
                  <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
                  <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
                </svg>
              </span>
            </div>
            <div className={styles.wbSplit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={12} cy={12} r={10} />
                <path d="M12 6v6l4 2" />
              </svg>
              <div>
                When you rent at €3, <strong>€2.40 goes to Maria.</strong> €0.36 covers payment
                processing. €0.24 covers hosting &amp; captions. The split is the same for every
                filmmaker. <Link to="/governance">Read the deed →</Link>
              </div>
            </div>
          </div>

          <div className={styles.liveStrip}>
            <span className="live" />
            <div>
              <strong>Live Q&amp;A with Maria · Wed 10 June, 21:00 Lisbon.</strong> Co-hosted with
              Casa do Comum. <em>Live captions in EN &amp; PT.</em>
            </div>
            <Link to="/rsvp">RSVP →</Link>
          </div>

          <div className={styles.facts}>
            {FACTS.map((f) => (
              <div key={f.k} className={styles.fact}>
                <div className="k">{f.k}</div>
                <div className="v">
                  {f.ok && (
                    <span className="ok">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  {f.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
