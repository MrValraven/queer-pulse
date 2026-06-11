import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { CinemaShell } from './CinemaShell'
import { films, type Access } from './data'
import styles from './CinemaBrowsePage.module.css'
import { ACCESS_FILTERS, FORMATS, MADE_BY, COUNTRIES, ACCESSIBILITY, MOODS } from './cinemaBrowse.data'

const accessClass = { free: styles.free, member: styles.member, rent: styles.rent }

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <div className={styles.gLabel}>{label}</div>
      <div className={styles.gChips}>{children}</div>
    </div>
  )
}

export function CinemaBrowsePage() {
  const [access, setAccess] = useState<Set<Access>>(new Set())
  const [format, setFormat] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      films.filter((f) => {
        if (access.size > 0 && !access.has(f.access)) return false
        if (format && f.format !== format) return false
        return true
      }),
    [access, format],
  )

  function toggleAccess(value: Access) {
    setAccess((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const activeChips = [...[...access].map((a) => ACCESS_FILTERS.find((x) => x.value === a)?.label ?? a), format].filter(
    Boolean,
  ) as string[]

  return (
    <CinemaShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>The full catalogue</div>
          <h1>
            Browse <em>everything</em>
          </h1>
          <p>142 films, programmed by queer people and paid to queer people. Filter by access, format, language, and mood — never by an algorithm.</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sfHead}>
                <h3>
                  Filter <em>&amp;</em> sort
                </h3>
                <span
                  className={styles.clear}
                  onClick={() => {
                    setAccess(new Set())
                    setFormat(null)
                  }}
                >
                  Clear all
                </span>
              </div>

              <FilterGroup label="Access">
                {ACCESS_FILTERS.map((a) => (
                  <button
                    key={a.value}
                    className={[styles.chip, access.has(a.value) && styles.chipOn].filter(Boolean).join(' ')}
                    onClick={() => toggleAccess(a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </FilterGroup>

              <FilterGroup label="Format">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    className={[styles.chip, format === f && styles.chipOn].filter(Boolean).join(' ')}
                    onClick={() => setFormat((cur) => (cur === f ? null : f))}
                  >
                    {f}
                  </button>
                ))}
              </FilterGroup>

              <FilterGroup label="Made by">
                {MADE_BY.map((m) => (
                  <span key={m} className={styles.chip}>
                    {m}
                  </span>
                ))}
              </FilterGroup>

              <FilterGroup label="Country of origin">
                {COUNTRIES.map((c) => (
                  <span key={c} className={styles.chip}>
                    {c}
                  </span>
                ))}
              </FilterGroup>

              <FilterGroup label="Accessibility">
                {ACCESSIBILITY.map((a) => (
                  <span key={a} className={`${styles.chip} ${styles.chipJade}`}>
                    {a}
                  </span>
                ))}
              </FilterGroup>

              <FilterGroup label="Mood">
                {MOODS.map((m) => (
                  <span key={m} className={styles.chip}>
                    {m}
                  </span>
                ))}
              </FilterGroup>
            </aside>

            <div>
              {activeChips.length > 0 && (
                <div className={styles.activeFilters}>
                  <span className={styles.afLabel}>Active:</span>
                  {activeChips.map((chip) => (
                    <span key={chip} className={styles.afChip}>
                      {chip} <span className={styles.x}>×</span>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.sortBar}>
                <div className={styles.results}>
                  Showing <strong>{visible.length} films</strong> matching your filters
                </div>
                <span className={styles.sortSel}>
                  Curators' pick
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>

              <div className={styles.grid}>
                {visible.length === 0 && <div className={styles.empty}>No films match these filters.</div>}
                {visible.map((film) => (
                  <Link key={film.id} to="/film" className={styles.fc}>
                    <div className={styles.fcPoster}>
                      <ImageSlot tint={film.tint} width="100%" height="100%" radius={14} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
                      <span className={`${styles.fcBadge} ${accessClass[film.access]}`}>{film.accessLabel}</span>
                      <div className={styles.fcSaves}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.fcEb}>
                      {film.format} · {film.meta.split('·').pop()?.trim()}
                    </div>
                    <div className={styles.fcTitle}>
                      {film.titlePre}
                      {film.titleEm && <em>{film.titleEm}</em>}
                      {film.titlePost}
                    </div>
                    <div className={styles.fcMeta}>
                      {film.meta.split('·')[0].trim()} · {film.country} · {film.year}
                    </div>
                    <div className={styles.fcTags}>
                      {film.subs.map((s) => (
                        <span key={s} className={styles.fcTag}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className={styles.fcCurator}>
                      <span className={styles.by}>{film.by}</span> — {film.note.slice(0, 48)}…
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </CinemaShell>
  )
}
