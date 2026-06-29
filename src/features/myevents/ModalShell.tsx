import { useEffect, type ReactNode } from 'react'
import { useScrollLock } from '../../shared/hooks'
import { sx } from './myEvents.styles'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  label: string
  narrow?: boolean
  children: ReactNode
}

/** Shared overlay + card for the My Events modals (stays mounted so the
 *  open/close transition plays; locks scroll only while open). */
export function ModalShell({ open, onClose, label, narrow, children }: ModalShellProps) {
  useScrollLock(open)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`${sx('modal-overlay')} ${open ? sx('show') : ''}`}
      aria-hidden="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`${sx('modal')} ${narrow ? sx('narrow') : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  )
}
