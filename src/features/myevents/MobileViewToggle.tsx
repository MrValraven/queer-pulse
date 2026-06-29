import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

/** List / Calendar switch — only visible on narrow screens (CSS-gated). */
export function MobileViewToggle() {
  const { mobileView, setMobileView } = useMyEvents()
  return (
    <div className={sx('mview')}>
      <button type="button" className={sx(`mview-btn${mobileView === 'list' ? ' on' : ''}`)} onClick={() => setMobileView('list')}>
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden><path d="M2 3.5h10M2 7h10M2 10.5h10" /></svg>List
      </button>
      <button type="button" className={sx(`mview-btn${mobileView === 'cal' ? ' on' : ''}`)} onClick={() => setMobileView('cal')}>
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden><rect x="2" y="2.5" width="10" height="9" rx="1.5" /><path d="M2 5.5h10M5 1.5v2M9 1.5v2" /></svg>Calendar
      </button>
    </div>
  )
}
