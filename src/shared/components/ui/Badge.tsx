import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'danger' | 'coral' | 'amber' | 'jade' | 'violet' | 'plum' | 'ghost'

/** Tone-based status pill, optionally with a leading dot. */
export function Badge({
  tone = 'plum',
  dot = false,
  children,
  className,
}: {
  tone?: BadgeTone
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span className={[styles.badge, styles[`badge_${tone}`], className].filter(Boolean).join(' ')}>
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  )
}

/** Stronger, square-cornered category label. */
export function CategoryLabel({
  tone = 'coral',
  children,
}: {
  tone?: 'danger' | 'coral' | 'jade'
  children: ReactNode
}) {
  return <span className={[styles.cat, styles[`cat_${tone}`]].join(' ')}>{children}</span>
}
