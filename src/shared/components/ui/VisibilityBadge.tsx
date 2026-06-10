import type { HTMLAttributes } from 'react'
import styles from './VisibilityBadge.module.css'

export type VisibilityMode = 'open' | 'network' | 'private'

const labels: Record<VisibilityMode, string> = {
  open: 'Open to connect',
  network: 'Network only',
  private: 'Private',
}

interface VisibilityBadgeProps extends HTMLAttributes<HTMLDivElement> {
  mode?: VisibilityMode
}

export function VisibilityBadge({
  mode = 'open',
  className,
  ...rest
}: VisibilityBadgeProps) {
  return (
    <div
      className={[styles.badge, styles[mode], className].filter(Boolean).join(' ')}
      title={`Visibility: ${labels[mode]}`}
      {...rest}
    >
      <span className={styles.dot} aria-hidden />
      {labels[mode]}
    </div>
  )
}
