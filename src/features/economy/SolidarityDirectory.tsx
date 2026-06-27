import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useConnect } from '../../app/providers/ConnectProvider'
import {
  PRACTITIONERS, FILTERS, TINT_BG, TINT_FG, initials, type Cat,
} from './solidarity.data'
import styles from './SolidarityPage.module.css'

export function SolidarityDirectory() {
  const [cat, setCat] = useState<Cat | 'all'>('all')
  const [query, setQuery] = useState('')
  const { openConnect } = useConnect()
  const q = query.toLowerCase()

  const items = PRACTITIONERS.filter((p) => {
    if (cat !== 'all' && p.cat !== cat) return false
    if (q) {
      const hay = `${p.name}${p.spec}${p.hood}${p.tags.join(' ')}${p.desc}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  return (
    <>
      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          <span className={styles.fbLabel}>Profession</span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, cat === f.id && styles.chipActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setCat(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <div className={styles.cbSearch}>
            <input
              type="text"
              placeholder="Search by name, area…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.count}>
            <b>{items.length}</b> practitioner{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <div className={styles.empty}>
                <p>No practitioners match — try different filters.</p>
              </div>
            )}
            {items.map((p) => (
              <article className={styles.pc} key={p.id}>
                <div className={styles.pcTop}>
                  <div
                    className={styles.pcAv}
                    style={{ background: TINT_BG[p.tint], color: TINT_FG[p.tint] }}
                  >
                    {initials(p.name)}
                  </div>
                  <div className={styles.pcMeta}>
                    <div className={styles.pcName}>{p.name}</div>
                    <div className={styles.pcSpec}>{p.spec} · {p.hood}</div>
                  </div>
                  <span className={[styles.pcBadge, p.isMember ? styles.badgeMember : styles.badgeVerified].join(' ')}>
                    {p.isMember ? 'Member' : 'Verified'}
                  </span>
                </div>
                <div className={styles.pcPricing}>
                  <div className={styles.pcPriceLabel}>Sliding scale</div>
                  <div className={styles.pcPriceRange}>{p.range}</div>
                  <div className={styles.pcPriceNote}>{p.scaleNote}</div>
                </div>
                <div className={styles.pcDesc}>{p.desc}</div>
                <div className={styles.pcTags}>
                  {p.tags.map((t) => (
                    <span key={t} className={styles.ptag}>{t}</span>
                  ))}
                </div>
                <div className={styles.pcFoot}>
                  <span className={styles.pcLang}>{p.langs.join(' · ')}</span>
                  <button
                    type="button"
                    className={styles.pcContact}
                    onClick={() => openConnect(p.id)}
                  >
                    Contact →
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.regStrip}>
            <div className={styles.rsText}>
              <h3>
                Do you offer<br />
                <em>solidarity pricing?</em>
              </h3>
              <p>
                If you are a professional in the community and already offer
                sliding-scale fees, add yourself to this list. It takes ten minutes
                and helps people find you.
              </p>
            </div>
            <div className={styles.rsCta}>
              <Button to={routes.requestInvite} variant="primary" size="lg">
                Register your practice
              </Button>
              <Link to={routes.contact} className={styles.rsCtaLink}>
                Questions first? Get in touch
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
