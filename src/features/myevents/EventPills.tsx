import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import type { Pill } from './myEvents.types'

const PILLS: { key: Pill; label: string }[] = [
  { key: 'upcoming', label: 'All upcoming' },
  { key: 'going', label: 'Going' },
  { key: 'hosting', label: 'Hosting' },
  { key: 'waitlisted', label: 'Waitlisted' },
  { key: 'past', label: 'Past' },
  { key: 'saved', label: 'Saved & invites' },
]

/** The primary bucket pills with live counts. */
export function EventPills() {
  const { pill, setPill, counts } = useMyEvents()
  return (
    <div className={sx('pill-row')}>
      {PILLS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={sx(`pill${pill === p.key ? ' active' : ''}`)}
          onClick={() => setPill(p.key)}
        >
          {p.label} <span className={sx('pc')}>{counts[p.key] || ''}</span>
        </button>
      ))}
    </div>
  )
}
