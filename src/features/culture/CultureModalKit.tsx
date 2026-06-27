import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import styles from './CultureModals.module.css'

/** Spinner + label shown inside a submit button while a flow is sending. */
export function Sending({ label }: { label: string }) {
  return (
    <span className={styles.loading}>
      <span className={styles.spinner} aria-hidden /> {label}
    </span>
  )
}

type FlowStatus = 'idle' | 'sending' | 'done'

/** Drives the idle → sending → done transition that powers loading + success. */
export function useSubmitFlow() {
  const [status, setStatus] = useState<FlowStatus>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const submit = (ms = 950) => {
    setStatus('sending')
    timer.current = window.setTimeout(() => setStatus('done'), ms)
  }
  return { sending: status === 'sending', done: status === 'done', submit }
}

/** Shared bottom-sheet frame: backdrop, close button, scroll lock. */
export function ModalShell({
  onClose,
  success,
  children,
}: {
  onClose: () => void
  success?: boolean
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
      <div className={[styles.modal, success && styles.modalSuccess].filter(Boolean).join(' ')}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

/** Plum-panel confirmation with a jade tick, serif title and optional next steps. */
export function SuccessPanel({
  title,
  em,
  children,
  steps,
  onClose,
}: {
  title: string
  em: string
  children: ReactNode
  steps?: ReactNode[]
  onClose: () => void
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
      {steps && steps.length > 0 && (
        <ul className={styles.steps}>
          {steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <FiCheck size={16} aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

/** Multi-select pill row used inside the modal forms. */
export function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[]
  selected: Set<string>
  onToggle: (value: string) => void
}) {
  return (
    <div className={styles.chips} role="group">
      {options.map((opt) => {
        const on = selected.has(opt)
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            className={[styles.chip, on && styles.chipOn].filter(Boolean).join(' ')}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/** Small hook for the chip-select Set state. */
export function useChipSet() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = (value: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  return { selected, toggle }
}
