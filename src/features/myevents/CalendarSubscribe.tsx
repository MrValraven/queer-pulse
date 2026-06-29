import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import { MONFULL } from './myEvents.data'
import { parseDate } from './myEvents.helpers'
import { downloadICS } from './myEvents.ics'

/** Subscribe-to-feed and export-this-month buttons under the calendar. */
export function CalendarSubscribe() {
  const { toast, viewM, events } = useMyEvents()
  const exportMonth = () => {
    const monthEvents = events.filter((e) => parseDate(e.date).getMonth() === viewM)
    downloadICS(`queerpulse-${MONFULL[viewM].toLowerCase()}.ics`, monthEvents)
    toast(`${MONFULL[viewM]} events downloaded as .ics`, 'success')
  }
  return (
    <div className={sx('cal-sub')}>
      <button type="button" className={sx('cal-sub-btn')} onClick={() => toast('Feed link copied — add it in Google or Apple Calendar', 'success')}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden><circle cx="3.5" cy="12.5" r="1.3" fill="currentColor" stroke="none" /><path d="M3 8.2a4.8 4.8 0 0 1 4.8 4.8M3 4.2a8.8 8.8 0 0 1 8.8 8.8" /></svg>
        <span className={sx('csb-t')}>Subscribe to your feed<span className={sx('csb-sub')}>Auto-syncs with Google or Apple Calendar</span></span>
      </button>
      <button type="button" className={sx('cal-sub-btn')} onClick={exportMonth}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8 2.5v8M5 7.5 8 10.5l3-3M3 13h10" /></svg>
        <span className={sx('csb-t')}>Export this month<span className={sx('csb-sub')}>Download a one-time .ics file</span></span>
      </button>
    </div>
  )
}
