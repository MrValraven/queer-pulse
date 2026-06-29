import { useRef } from 'react'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import { MON, MONFULL } from './myEvents.data'
import { CalendarGrid } from './CalendarGrid'
import { CalendarSubscribe } from './CalendarSubscribe'
import { InsightsCard } from './InsightsCard'
import type { CalView } from './myEvents.types'

const VIEWS: { key: CalView; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'year', label: 'Year' },
]

function monthLabel(calView: CalView, viewY: number, viewM: number, weekStart: Date): string {
  if (calView === 'year') return String(viewY)
  if (calView === 'week') {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return `${weekStart.getDate()} ${MON[weekStart.getMonth()]} – ${end.getDate()} ${MON[end.getMonth()]}`
  }
  return `${MONFULL[viewM]} ${viewY}`
}

/** The right-hand calendar aside: nav, grid, legend, subscribe, insights. */
export function CalendarCard() {
  const c = useMyEvents()
  const cardRef = useRef<HTMLElement>(null)
  const label = monthLabel(c.calView, c.viewY, c.viewM, c.weekStart)

  return (
    <aside className={sx('cal-card')} ref={cardRef}>
      <div className={sx('cal-top')}>
        <div className={sx('cal-month')}>{label}</div>
        <div className={sx('cal-controls')}>
          <button type="button" className={sx('cal-today-btn')} onClick={c.goToday}>Today</button>
          <button type="button" className={sx('cal-arrow')} onClick={() => c.shiftMonth(-1)} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className={sx('cal-arrow')} onClick={() => c.shiftMonth(1)} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className={sx('cal-views')}>
        {VIEWS.map((v) => (
          <button key={v.key} type="button" className={sx(`cal-view-btn${c.calView === v.key ? ' on' : ''}`)} onClick={() => c.setCalView(v.key)}>{v.label}</button>
        ))}
      </div>

      <CalendarGrid cardRef={cardRef} />

      <div className={sx('cal-legend')}>
        <div className={sx('cal-leg')}><span className={sx('ld hosting')} /> Hosting</div>
        <div className={sx('cal-leg')}><span className={sx('ld going')} /> Going</div>
        <div className={sx('cal-leg')}><span className={sx('ld pending')} /> Saved · waitlist · invite</div>
      </div>

      <CalendarSubscribe />
      <InsightsCard />
    </aside>
  )
}
