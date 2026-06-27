import { useEffect, type ReactNode } from 'react'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import styles from './CancelConfirmModal.module.css'

export function CancelConfirmModal({
  eyebrow,
  title,
  body,
  confirmLabel,
  icon,
  tone = 'plum',
  onConfirm,
  onClose,
}: {
  eyebrow: string
  title: ReactNode
  body: ReactNode
  confirmLabel: string
  icon: ReactNode
  tone?: 'jade' | 'accent' | 'plum'
  onConfirm: () => void
  onClose: () => void
}) {
  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={eyebrow}>
        <div className={`${styles.icon} ${styles[tone]}`}>{icon}</div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.body}>{body}</p>
        <div className={styles.btns}>
          <Button variant="ghost" onClick={onClose}>Not now</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
