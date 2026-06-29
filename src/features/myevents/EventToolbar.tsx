import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import type { FilterKey, SortBy } from './myEvents.types'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'inperson', label: 'In person' },
  { key: 'online', label: 'Online' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Ticketed' },
  { key: 'month', label: 'This calendar month' },
]

/** Search field, secondary filter chips, and the sort/density/select controls. */
export function EventToolbar() {
  const c = useMyEvents()
  return (
    <div className={sx('ev-toolbar')}>
      <div className={sx('ev-search-wrap')}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" strokeLinecap="round" /></svg>
        <input
          className={sx('ev-search')}
          type="search"
          placeholder="Search your events by name or place…"
          value={c.searchTerm}
          onChange={(e) => c.setSearch(e.target.value)}
          aria-label="Search your events"
        />
      </div>

      <div className={sx('ev-filters')}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={sx(`fchip${c.activeFilters[f.key] ? ' on' : ''}`)}
            onClick={() => c.toggleFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={sx('ev-controls')}>
        <select className={sx('ev-sort')} aria-label="Sort events" value={c.sortBy} onChange={(e) => c.setSort(e.target.value as SortBy)}>
          <option value="date">Sort: by date</option>
          <option value="community">Sort: by community</option>
          <option value="status">Sort: by status</option>
        </select>
        <button type="button" className={sx(`ctrl-btn${c.density === 'compact' ? ' on' : ''}`)} onClick={c.toggleDensity}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden><path d="M2 3h10M2 7h10M2 11h10" /></svg>
          <span>{c.density === 'compact' ? 'Compact' : 'Comfortable'}</span>
        </button>
        <button type="button" className={sx(`ctrl-btn${c.selectMode ? ' on' : ''}`)} onClick={c.toggleSelectMode}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 7.5 6 10.5 11 4" /></svg>
          <span>{c.selectMode ? 'Done' : 'Select'}</span>
        </button>
        <span className={sx('ctrl-spacer')} />
        <span className={sx('tz-note')}>Times shown in Lisbon (WEST)</span>
      </div>
    </div>
  )
}
