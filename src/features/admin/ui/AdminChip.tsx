import type { ReactNode } from 'react'
import styles from './adminUi.module.css'

export type AdminTone = 'danger' | 'coral' | 'amber' | 'jade' | 'violet' | 'plum' | 'ghost'

export function AdminChip({
  tone = 'plum',
  dot = false,
  children,
  className,
}: {
  tone?: AdminTone
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span className={[styles.chip, styles[`chip_${tone}`], className].filter(Boolean).join(' ')}>
      {dot && <span className={styles.chipDot} aria-hidden />}
      {children}
    </span>
  )
}

/** Stronger, square-cornered category label (ax-cat). */
export function AdminCat({
  tone = 'coral',
  children,
}: {
  tone?: 'danger' | 'coral' | 'jade'
  children: ReactNode
}) {
  return <span className={[styles.cat, styles[`cat_${tone}`]].join(' ')}>{children}</span>
}
