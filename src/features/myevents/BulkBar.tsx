import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

/** Floating action bar shown while selecting events. */
export function BulkBar() {
  const { selectMode, selectedCount, bulkAddCal, bulkExport, bulkCancel, closeBulk } = useMyEvents()
  const show = selectMode && selectedCount > 0
  return (
    <div className={`${sx('bulkbar')} ${show ? sx('show') : ''}`}>
      <span className={sx('bulk-count')}>{selectedCount} selected</span>
      <div className={sx('bulk-actions')}>
        <button type="button" className={sx('bulk-act')} onClick={bulkAddCal}>Add to calendar</button>
        <button type="button" className={sx('bulk-act')} onClick={bulkExport}>Export</button>
        <button type="button" className={sx('bulk-act')} onClick={bulkCancel}>Cancel RSVPs</button>
      </div>
      <button type="button" className={sx('bulk-close')} aria-label="Done selecting" onClick={closeBulk}>×</button>
    </div>
  )
}
