import type { ReactNode } from 'react'
import styles from './DocPreview.module.css'

/**
 * The printable "paper" surface. Renders its children inside a
 * `[data-print-root]` A4-proportioned white card — this element is both the
 * on-screen preview and the only thing printed (see tools.print.css).
 */
export function DocPreview({ children }: { children: ReactNode }) {
  return (
    <div className={styles.sheet} data-print-root>
      {children}
    </div>
  )
}
