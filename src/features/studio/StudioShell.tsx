import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import styles from './studio.module.css'

const RAIL_MAIN = [
  { label: 'Home', to: '/studio', end: true },
  { label: 'The Wednesday set', to: '/studio', end: true },
  { label: 'Browse', to: '/studio', end: true },
  { label: 'Sheet music', to: '/studio/sheet-store' },
  { label: 'Live broadcasts', to: '/studio/live' },
]
const CONTRIBUTE = [
  { label: 'Submit a set', to: '/studio/set-submission' },
  { label: 'Open calls', to: '/studio/calls' },
  { label: 'Solidarity fund', to: '/studio/solidarity-fund' },
]
const GOVERNANCE = [
  { label: 'Curation council', to: '/studio/council' },
  { label: 'Submission inbox', to: '/studio/triage' },
  { label: 'Flagged tracks', to: '/studio/flag-review' },
]
const PLAYER_ART = 'https://images.unsplash.com/photo-1654432673600-33ff123df18a?q=80&w=400&auto=format&fit=crop'
const LIBRARY: { name: string; em: string; meta: string; tint: 'coral' | 'plum' | 'jade'; to: string; image?: string }[] = [
  { name: 'Cidade dos ', em: 'santos', meta: 'Album · Mariana Sol', tint: 'coral' as const, to: '/studio/album', image: 'https://images.unsplash.com/photo-1629794138560-46d2815a6d79?q=80&w=400&auto=format&fit=crop' },
  { name: 'Vespertina ', em: 'vol. iv', meta: 'Set · Sara Marques', tint: 'plum' as const, to: '/studio', image: 'https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop' },
  { name: 'Lisbon dyke-bar ', em: 'standards', meta: 'Collection · 28 tracks', tint: 'jade' as const, to: '/studio', image: 'https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop' },
  { name: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', tint: 'plum' as const, to: '/studio', image: 'https://images.unsplash.com/photo-1566108253680-7c860e4633a3?q=80&w=800&auto=format&fit=crop' },
  { name: 'The Anjos ', em: 'tape', meta: 'Live · Casa do Comum', tint: 'coral' as const, to: '/studio', image: 'https://images.unsplash.com/photo-1585310808021-c2221275d7ad?q=80&w=800&auto=format&fit=crop' },
]

export function StudioShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <aside className={styles.rail}>
          <div className={styles.brandRow}>
            <span className={styles.pulseDot} aria-hidden />
            <Link to="/" className={styles.brand}>
              Queer<em>Pulse</em>
            </Link>
            <span className={styles.product}>Studio</span>
          </div>

          <div className={styles.railGrp}>
            {RAIL_MAIN.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) => [styles.railItem, isActive && styles.railItemOn].filter(Boolean).join(' ')}
              >
                <span className={styles.nm}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className={styles.railDivider} />

          <div className={styles.railGrp}>
            <h5>Contribute</h5>
            {CONTRIBUTE.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => [styles.railItem, isActive && styles.railItemOn].filter(Boolean).join(' ')}>
                <span className={styles.nm}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className={styles.railGrp}>
            <h5>Governance</h5>
            {GOVERNANCE.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => [styles.railItem, isActive && styles.railItemOn].filter(Boolean).join(' ')}>
                <span className={styles.nm}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className={styles.railDivider} />

          <div className={styles.railGrp}>
            <h5>In your library</h5>
            {LIBRARY.map((pl) => (
              <Link key={pl.name} to={pl.to} className={styles.plItem}>
                <span className={styles.plCov}>
                  <ImageSlot src={pl.image} tint={pl.tint} width={36} height={36} radius={5} placeholder="" />
                </span>
                <span>
                  <span className={styles.plName} style={{ display: 'block' }}>
                    {pl.name}
                    <em>{pl.em}</em>
                  </span>
                  <span className={styles.plMeta}>{pl.meta}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className={styles.railFoot}>
            <em>Sustained</em> by you since Feb 2026.
            <span className={styles.pay}>
              You've paid <b>€312</b> to 47 artists this year.
            </span>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.topbar}>
            <div className={styles.navs}>
              <button aria-label="Back" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M9 1L3 7l6 6" />
                </svg>
              </button>
              <button aria-label="Forward" onClick={() => navigate(1)}>
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M5 1l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className={styles.search}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx={11} cy={11} r={7} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="search artists, tracks, sheet music…" />
            </div>
            <div className={styles.topRight}>
              <Link to="/studio/dashboard" className={styles.creatorLink}>
                For artists →
              </Link>
              <Link to="/cinema/membership" className={styles.sustainPill}>
                Sustain · €7/mo
              </Link>
              <div className={styles.avatar}>RM</div>
            </div>
          </div>

          <div className={styles.content}>{children}</div>
        </main>
      </div>

      {/* Pinned player */}
      <div className={styles.fp}>
        <div className={styles.fpL}>
          <div className={styles.fpArt}>
            <ImageSlot src={PLAYER_ART} tint="coral" width={52} height={52} radius={8} placeholder="" />
          </div>
          <div className={styles.fpInfo}>
            <div className={styles.t}>
              Carta para a <em>santa</em>
            </div>
            <div className={styles.a}>Mariana Sol · Cidade dos santos</div>
          </div>
        </div>
        <div className={styles.fpC}>
          <div className={styles.fpTrans}>
            <button aria-label="Prev">
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1v12M13 1L4 7l9 6V1z" />
              </svg>
            </button>
            <button className={styles.play} aria-label="Play">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button aria-label="Next">
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M12 1v12M1 1l9 6-9 6V1z" />
              </svg>
            </button>
          </div>
          <div className={styles.fpBar}>
            <span className={styles.t}>1:42</span>
            <div className={styles.track}>
              <div className={styles.fill} />
            </div>
            <span className={styles.t}>4:18</span>
          </div>
        </div>
        <div className={styles.fpR}>
          <div className={styles.payMini}>
            <b>paying</b>€0.05 to Mariana
          </div>
          <button className={styles.tipMini}>Tip €2</button>
        </div>
      </div>
    </div>
  )
}
