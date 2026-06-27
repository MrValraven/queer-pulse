import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiFilm } from 'react-icons/fi'
import { EmptyState, ImageSlot } from '../../shared/components/ui'
import { CinemaShell } from './CinemaShell'
import { CinemaBrowseSidebar, SortDropdown } from './CinemaBrowseControls'
import {
  ACCESS_FILTERS,
  browsePoster,
  emptyFilters,
  filterFilms,
  sortFilms,
  type BrowseFilters,
  type SortKey,
} from './cinemaBrowse.data'
import type { Access, CinemaFilm } from './data'
import styles from './CinemaBrowsePage.module.css'
import { routes } from '../../app/routeMap'

const accessClass = { free: styles.free, member: styles.member, rent: styles.rent }

type SetKey = 'access' | 'madeBy' | 'country' | 'accessibility' | 'mood'

/** Returns a copy of the set without `value` (unchanged if absent). */
function dropFrom<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) return set
  const next = new Set(set)
  next.delete(value)
  return next
}

function FilmCard({ film }: { film: CinemaFilm }) {
  return (
    <Link to={routes.film} className={styles.fc}>
      <div className={styles.fcPoster}>
        <ImageSlot src={browsePoster(film)} tint={film.tint} width="100%" height="100%" radius={14} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
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
  )
}

export function CinemaBrowsePage() {
  const [filters, setFilters] = useState<BrowseFilters>(emptyFilters)
  const [sort, setSort] = useState<SortKey>('curated')

  const visible = useMemo(() => sortFilms(filterFilms(filters), sort), [filters, sort])

  function toggleSet(key: SetKey, value: string) {
    setFilters((cur) => {
      const next = new Set(cur[key])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...cur, [key]: next }
    })
  }

  function setFormat(value: string) {
    setFilters((cur) => ({ ...cur, format: cur.format === value ? null : value }))
  }

  function removeChip(label: string) {
    setFilters((cur) => {
      if (cur.format === label) return { ...cur, format: null }
      return {
        ...cur,
        madeBy: dropFrom(cur.madeBy, label),
        country: dropFrom(cur.country, label),
        accessibility: dropFrom(cur.accessibility, label),
        mood: dropFrom(cur.mood, label),
      }
    })
  }

  const clearAll = () => setFilters(emptyFilters())

  const activeChips = [
    ...[...filters.access].map((a) => ACCESS_FILTERS.find((x) => x.value === a)?.label ?? a),
    filters.format,
    ...filters.madeBy,
    ...filters.country,
    ...filters.accessibility,
    ...filters.mood,
  ].filter(Boolean) as string[]

  const accessLabelToValue = (label: string) =>
    ACCESS_FILTERS.find((x) => x.label === label)?.value as Access | undefined

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
            <CinemaBrowseSidebar filters={filters} toggleSet={toggleSet} setFormat={setFormat} onClear={clearAll} />

            <div>
              {activeChips.length > 0 && (
                <div className={styles.activeFilters}>
                  <span className={styles.afLabel}>Active:</span>
                  {activeChips.map((chip) => (
                    <span key={chip} className={styles.afChip}>
                      {chip}{' '}
                      <span
                        className={styles.x}
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${chip}`}
                        onClick={() => {
                          const accessVal = accessLabelToValue(chip)
                          if (accessVal) toggleSet('access', accessVal)
                          else removeChip(chip)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            const accessVal = accessLabelToValue(chip)
                            if (accessVal) toggleSet('access', accessVal)
                            else removeChip(chip)
                          }
                        }}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.sortBar}>
                <div className={styles.results} aria-live="polite">
                  Showing <strong>{visible.length} {visible.length === 1 ? 'film' : 'films'}</strong>
                  {activeChips.length > 0 ? ' matching your filters' : ' in the catalogue'}
                </div>
                <SortDropdown value={sort} onChange={setSort} />
              </div>

              {visible.length === 0 ? (
                <EmptyState
                  icon={<FiFilm />}
                  title="No films match these filters"
                  description="Try loosening a filter or two — the catalogue is broad, but these picks are specific."
                  action={{ label: 'Clear filters', onClick: clearAll }}
                />
              ) : (
                <div className={styles.grid}>
                  {visible.map((film) => (
                    <FilmCard key={film.id} film={film} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </CinemaShell>
  )
}
