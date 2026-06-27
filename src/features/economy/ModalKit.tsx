import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FiCheck, FiFile } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import styles from './ApplicationModals.module.css'

/** Small file glyph used in attachment rows. */
export function FileIcon() {
  return <FiFile className={styles.attachIcon} size={16} aria-hidden />
}

/** Spinner + label shown inside a button while a flow is submitting. */
export function Sending({ label }: { label: string }) {
  return (
    <span className={styles.loading}>
      <span className={styles.spinner} aria-hidden /> {label}
    </span>
  )
}

export type FlowStatus = 'idle' | 'sending' | 'done'

/** Drives the idle → sending → done transition that powers loading + success. */
export function useSubmitFlow() {
  const [status, setStatus] = useState<FlowStatus>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const submit = (onComplete?: () => void, ms = 1000) => {
    setStatus('sending')
    timer.current = window.setTimeout(() => {
      onComplete?.()
      setStatus('done')
    }, ms)
  }
  return { status, submit, sending: status === 'sending', done: status === 'done' }
}

/** Shared bottom-sheet modal frame: backdrop, close button, scroll lock. */
export function ModalShell({
  onClose,
  success,
  wide,
  children,
}: {
  onClose: () => void
  success?: boolean
  wide?: boolean
  children: ReactNode
}) {
  useScrollLock()
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={[styles.modal, wide && styles.modalWide, success && styles.modalSuccess]
          .filter(Boolean)
          .join(' ')}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

/** Plum-panel confirmation shown after a flow completes. */
export function SuccessPanel({
  title,
  em,
  children,
  onClose,
  closeLabel = 'Close',
  footer,
}: {
  title: string
  em: string
  children: ReactNode
  onClose: () => void
  closeLabel?: string
  /** Optional extra content below the primary action — e.g. an undo affordance. */
  footer?: ReactNode
}) {
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        {title} <em>{em}</em>
      </h2>
      <p>{children}</p>
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
      {footer}
    </div>
  )
}
