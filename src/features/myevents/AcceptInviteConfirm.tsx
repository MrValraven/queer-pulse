import { useEffect, useRef } from 'react'
import { Button } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

/** Plum confirmation panel shown after accepting an invite. */
export function AcceptInviteConfirm() {
  const { confirm, closeConfirm, toast } = useMyEvents()
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!confirm.open) return
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeConfirm() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [confirm.open, closeConfirm])

  return (
    <div className={`${sx('confirm-overlay')} ${confirm.open ? sx('show') : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeConfirm() }}>
      <div ref={panelRef} tabIndex={-1} className={sx('confirm-panel')} role="dialog" aria-modal="true" aria-label="You're going">
        <div className={sx('confirm-check')}>
          <svg viewBox="0 0 28 28" aria-hidden><path d="M5 14l6 6 12-13" /></svg>
        </div>
        <div className={sx('confirm-eyebrow')}>You're going</div>
        <h1 className={sx('confirm-h')}>You said <em>yes.</em></h1>
        <p className={sx('confirm-name')}>{confirm.title}</p>
        <p className={sx('confirm-meta')}>{confirm.meta}</p>
        <div className={sx('confirm-actions')}>
          <Button variant="jade" onClick={() => toast('Added to your calendar', 'success')}>Add to calendar</Button>
          <Button variant="ghost-dark" onClick={closeConfirm}>Done</Button>
        </div>
      </div>
    </div>
  )
}
