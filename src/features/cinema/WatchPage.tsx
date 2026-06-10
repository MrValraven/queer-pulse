import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ImageSlot } from '../../shared/components/ui'
import { films } from './data'
import styles from './WatchPage.module.css'

const CONTENT_NOTES = [
  { k: 'Grief', detail: 'Throughout', tc: '—' },
  { k: 'Dementia', detail: 'Act two · care', tc: '42:18 – 51:04' },
  { k: 'A slur, once', detail: 'Reclaimed · in context', tc: '28:11' },
]
const FACTS = [
  ['Director', 'Maria Vasconcelos'],
  ['Runtime', '92 min'],
  ['Year', 'Portugal · 2025'],
  ['Captions', 'EN · PT · LGP'],
]
const LOBBY = [
  { name: 'Sara M.', badge: 'curator', when: 'now', body: 'The bean-shelling shot at 1:07 is the whole film. Watch her hands.' },
  { name: 'André Q.', badge: '', when: '2m', body: 'Watching this for the third time and Dona Ilda still gets me every time.' },
  { name: 'Kai L.', badge: '', when: '5m', body: 'The window between the two apartments — such a quiet image of community.' },
]
const TABS = ['Film info', 'Lobby', 'Live Q&A'] as const
const nextUp = films.filter((f) => f.id !== 'cascais').slice(0, 3)

export function WatchPage() {
  const [showOverlay, setShowOverlay] = useState(true)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Film info')
  const [cc, setCc] = useState(true)
  const [ad, setAd] = useState(false)

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link to="/film" className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<em style={{ fontStyle: 'italic' }}>Pulse</em>
          <span className={styles.cin}>Cinema</span>
        </Link>
        <div className={styles.navLinks}>
          <Link to="/film">← Film info</Link>
          <Link to="/cinema">Cinema home</Link>
        </div>
        <div className={styles.navRight}>
          <span>
            Watching as <strong>Anon</strong>
          </span>
          <Button variant="ghost-dark" to="/sign-in" style={{ padding: '8px 16px' }}>
            Sign in to save progress
          </Button>
        </div>
      </nav>

      <div className={styles.stage}>
        <div className={styles.zone}>
          <div className={styles.screen}>
            <ImageSlot tint="plum" width="100%" height="100%" radius={0} placeholder="film frame · cinematic still" style={{ position: 'absolute', inset: 0 }} />

            {showOverlay ? (
              <div className={styles.overlay}>
                <div className={styles.overlayCard}>
                  <div className={styles.overlayIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                      <circle cx={12} cy={12} r={10} />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>
                  </div>
                  <div className={styles.overlayHead}>
                    Before you <em>watch</em>
                  </div>
                  <div className={styles.overlaySub}>
                    This film has 3 content notes. Take a moment — then decide when you're ready.
                  </div>
                  <div className={styles.overlayNotes}>
                    {CONTENT_NOTES.map((n) => (
                      <div key={n.k} className={styles.overlayRow}>
                        <span className="k">{n.k}</span>
                        <span>{n.detail}</span>
                        <span className="t">{n.tc}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.overlayActions}>
                    <Button size="lg" onClick={() => setShowOverlay(false)}>
                      I'm ready · play the film
                    </Button>
                    <Button variant="ghost-dark" to="/film">
                      Go back to film page
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.playState}>
                <div className={styles.playBtn}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
                <div className={styles.psTitle}>
                  The light <em>between</em> rooms
                </div>
                <div className={styles.psMeta}>Paused at 31:44 · 60 min remaining</div>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <div className={styles.progress}>
              <div className={styles.progressFill} />
              <div className={styles.cnMarker} style={{ left: '31.1%' }} />
              <div className={styles.cnMarker} style={{ left: '46.5%', background: 'rgba(247,243,238,.3)' }} />
              <div className={styles.cnMarker} style={{ left: '55.2%', background: 'rgba(247,243,238,.3)' }} />
            </div>
            <div className={styles.controlsRow}>
              <span className={styles.ctrlBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1={5} y1={19} x2={5} y2={5} />
                </svg>
              </span>
              <span className={`${styles.ctrlBtn} ${styles.primary}`}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
              <span className={styles.ctrlBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1={19} y1={5} x2={19} y2={19} />
                </svg>
              </span>
              <span className={styles.ctrlTime}>
                <span className="cur">31:44</span> / 1:32:18
              </span>
              <div className={styles.ctrlSpace} />
              <span className={[styles.ctrlPill, cc && styles.ctrlPillOn].filter(Boolean).join(' ')} onClick={() => setCc((v) => !v)}>
                CC EN
              </span>
              <span className={[styles.ctrlPill, ad && styles.ctrlPillOn].filter(Boolean).join(' ')} onClick={() => setAd((v) => !v)}>
                AD
              </span>
              <select className={styles.ctrlLang} defaultValue="EN subs">
                <option>PT subs</option>
                <option>EN subs</option>
                <option>ES subs</option>
                <option>No subs</option>
              </select>
            </div>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.spTabs}>
            {TABS.map((t) => (
              <div
                key={t}
                className={[styles.spTab, tab === t && styles.spTabActive].filter(Boolean).join(' ')}
                onClick={() => setTab(t)}
              >
                {t}
                {t === 'Live Q&A' && <span className={styles.spDot} />}
              </div>
            ))}
          </div>

          {tab === 'Film info' && (
            <div className={styles.spBody}>
              <div className={styles.spTitle}>
                The light <em>between</em> rooms
              </div>
              <div className={styles.spMeta}>Maria Vasconcelos · Portugal, 2025 · 92 min</div>
              <div className={styles.spNote}>
                "A patient, generous film about Lisbon's working-class queer elders. <em>Stay for
                the second hour.</em>"
                <span className="who">— João Ribeiro, programmer</span>
              </div>
              <div className={styles.spFacts}>
                {FACTS.map(([k, v]) => (
                  <div key={k} className={styles.spFact}>
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(tab === 'Lobby' || tab === 'Live Q&A') && (
            <>
              <div className={styles.spBody}>
                {LOBBY.map((m, i) => (
                  <div key={i} className={styles.lobbyMsg}>
                    <div className={styles.lobbyHead}>
                      <span className="name">{m.name}</span>
                      {m.badge && <span className="badge">{m.badge}</span>}
                      <span className="when">{m.when}</span>
                    </div>
                    <div className={styles.lobbyBody}>{m.body}</div>
                  </div>
                ))}
              </div>
              <div className={styles.spInput}>
                <input placeholder={tab === 'Live Q&A' ? 'Ask Maria a question…' : 'Say something to the lobby…'} />
                <Button style={{ padding: '8px 14px', fontSize: 12.5 }}>Send</Button>
              </div>
            </>
          )}
        </aside>
      </div>

      <section className={styles.below}>
        <div className={`wrap ${styles.belowGrid}`}>
          <div>
            <h2>
              Next <em>up</em>
            </h2>
            <div className={styles.nextGrid}>
              {nextUp.map((film) => (
                <Link key={film.id} to="/film" className={styles.nf}>
                  <div className={styles.nfPoster}>
                    <ImageSlot tint={film.tint} width="100%" height="100%" radius={10} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
                  </div>
                  <div className={styles.nfTitle}>
                    {film.titlePre}
                    {film.titleEm && <em>{film.titleEm}</em>}
                    {film.titlePost}
                  </div>
                  <div className={styles.nfMeta}>{film.meta}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.split}>
            <div className={styles.splitHead}>Your watch · where the money goes</div>
            <div className={styles.splitBar}>
              <div className={`${styles.splitSeg} ${styles.fm}`} />
              <div className={`${styles.splitSeg} ${styles.py}`} />
              <div className={`${styles.splitSeg} ${styles.hs}`} />
            </div>
            <div className={styles.splitLegend}>
              <div>
                <span className="v"><em>80%</em></span>
                Filmmaker
              </div>
              <div>
                <span className="v">12%</span>
                Payments
              </div>
              <div>
                <span className="v">8%</span>
                Hosting
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
