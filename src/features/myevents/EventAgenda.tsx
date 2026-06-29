import { useMemo } from 'react'
import { FadeIn } from '../../shared/components/ui'
import { Button } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import { buildAgenda } from './myEvents.agenda'
import { EventCard } from './EventCard'
import { EmptyState } from './EmptyState'
import { Discovery } from './Discovery'

function AgendaSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className={sx('sk-wrap')}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className={sx('sk-card')}>
          <div className={sx('sk-tile qp-skeleton')} />
          <div className={sx('sk-lines')}>
            <div className={sx('sk-line tall qp-skeleton')} />
            <div className={sx('sk-line qp-skeleton')} />
            <div className={sx('sk-line short qp-skeleton')} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** The left-hand agenda column: grouped event cards, empty states, discovery. */
export function EventAgenda() {
  const c = useMyEvents()
  const result = useMemo(
    () => buildAgenda(c.events, {
      pill: c.pill, selectedDate: c.selectedDate, searchTerm: c.searchTerm,
      activeFilters: c.activeFilters, sortBy: c.sortBy, viewM: c.viewM, viewY: c.viewY,
      pastShown: c.pastShown, hasSecondary: c.hasSecondary,
    }),
    [c.events, c.pill, c.selectedDate, c.searchTerm, c.activeFilters, c.sortBy, c.viewM, c.viewY, c.pastShown, c.hasSecondary],
  )

  if (c.loading) {
    return <div className={sx('agenda')}><AgendaSkeleton n={c.pill === 'saved' ? 3 : 4} /></div>
  }

  if (result.emptyKey) {
    return <div className={sx('agenda')}><EmptyState emptyKey={result.emptyKey} /></div>
  }

  let idx = 0
  return (
    <div className={sx('agenda')}>
      {result.groups.map((g) => (
        <div key={g.label ?? 'all'}>
          {g.label && <div className={sx('grp-label')}>{g.label}</div>}
          <div className={sx('ev-list')}>
            {g.events.map((ev) => (
              <FadeIn key={ev.id} delay={Math.min(idx++, 8) * 45}>
                <EventCard ev={ev} />
              </FadeIn>
            ))}
          </div>
        </div>
      ))}
      {result.loadMoreCount > 0 && (
        <div className={sx('load-more')}>
          <Button variant="ghost" onClick={c.loadMorePast}>Show {result.loadMoreCount} more</Button>
        </div>
      )}
      {result.showDiscovery && <Discovery />}
    </div>
  )
}
