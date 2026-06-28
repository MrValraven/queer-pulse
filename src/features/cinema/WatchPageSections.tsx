import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ImageSlot } from '../../shared/components/ui'
import { films } from './data'
import {
  CONTENT_NOTES,
  FACTS,
  LOBBY,
  NEXT_UP_STILL_BY_ID,
  TABS,
  type WatchTab,
} from './watchPage.data'
import styles from './WatchPage.module.css'
import { routes } from '../../app/routeMap'

const nextUp = films.filter((f) => f.id !== 'cascais').slice(0, 3)

export function WatchOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
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
          <Button size="lg" onClick={onDismiss}>
            I'm ready · play the film
          </Button>
          <Button variant="ghost-dark" to={routes.film}>
            Go back to film page
          </Button>
        </div>
      </div>
    </div>
  )
}

export function WatchPlayState() {
  return (
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
  )
}

export function WatchControls({
  cc,
  ad,
  onCcToggle,
  onAdToggle,
}: {
  cc: boolean
  ad: boolean
  onCcToggle: () => void
  onAdToggle: () => void
}) {
  return (
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
        <span
          className={[styles.ctrlPill, cc && styles.ctrlPillOn].filter(Boolean).join(' ')}
          onClick={onCcToggle}
        >
          CC EN
        </span>
        <span
          className={[styles.ctrlPill, ad && styles.ctrlPillOn].filter(Boolean).join(' ')}
          onClick={onAdToggle}
        >
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
  )
}

interface ChatLine {
  id: string
  name: string
  badge: string
  when: string
  body: string
  mine?: boolean
}

const SEED_CHAT: ChatLine[] = LOBBY.map((m, i) => ({ id: `seed-${i}`, ...m }))

export function WatchSidePanel() {
  const [tab, setTab] = useState<WatchTab>('Film info')
  const [messages, setMessages] = useState<ChatLine[]>(SEED_CHAT)
  const [draft, setDraft] = useState('')

  function send() {
    const body = draft.trim()
    if (!body) return
    setMessages((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, name: 'You', badge: '', when: 'now', body, mine: true },
    ])
    setDraft('')
  }

  return (
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
            "A patient, generous film about Lisbon's working-class queer elders.{' '}
            <em>Stay for the second hour.</em>"
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
            {messages.map((m) => (
              <div key={m.id} className={styles.lobbyMsg}>
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
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={
                tab === 'Live Q&A' ? 'Ask Maria a question…' : 'Say something to the lobby…'
              }
            />
            <Button style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={send} disabled={!draft.trim()}>
              Send
            </Button>
          </div>
        </>
      )}
    </aside>
  )
}

export function WatchBelow() {
  return (
    <section className={styles.below}>
      <div className={`wrap ${styles.belowGrid}`}>
        <div>
          <h2>
            Next <em>up</em>
          </h2>
          <div className={styles.nextGrid}>
            {nextUp.map((film) => (
              <Link key={film.id} to={routes.film} className={styles.nf}>
                <div className={styles.nfPoster}>
                  <ImageSlot
                    src={NEXT_UP_STILL_BY_ID[film.id] ?? film.image}
                    tint={film.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder="poster"
                    style={{ position: 'absolute', inset: 0 }}
                  />
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
              <span className="v">
                <em>80%</em>
              </span>
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
  )
}
