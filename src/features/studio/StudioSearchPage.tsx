import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { FILTERS, RECENT, RESULTS } from './studioSearch.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

export function StudioSearchPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Everything')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RESULTS.filter((result) => {
      const matchFilter = filter === 'Everything' || result.kind === filter
      const matchQuery =
        !q || `${result.pre}${result.em ?? ''}${result.post ?? ''} ${result.meta}`.toLowerCase().includes(q)
      return matchFilter && matchQuery
    })
  }, [query, filter])

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>Search the catalogue</div>
        <h1>
          Find the <em>sound.</em>
        </h1>
      </div>

      <div className={s.searchBar}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx={11} cy={11} r={7} />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Artists, albums, sets, sheet music…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
      </div>

      <div className={s.chips}>
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={`${s.chip} ${filter === option ? s.chipOn : ''}`}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {!query && (
        <div className={s.chips}>
          {RECENT.map((term) => (
            <button key={term} type="button" className={s.chip} onClick={() => setQuery(term)}>
              {term}
            </button>
          ))}
        </div>
      )}

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            {query ? <>Results for <em>{query}</em></> : <>Featured <em>now</em></>}
          </h2>
        </div>
        {results.length === 0 ? (
          <p className={s.empty}>Nothing matched that — try a different word or filter.</p>
        ) : (
          <div className={ss.rowGrid}>
            {results.map((result) => (
              <Link key={result.pre + result.meta} to={result.to} className={ss.card}>
                <div className={ss.cardCov}>
                  <ImageSlot tint={result.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
                </div>
                <h4>
                  {result.pre}
                  {result.em && <em>{result.em}</em>}
                  {result.post}
                </h4>
                <div className={ss.meta}>{result.meta}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  )
}
