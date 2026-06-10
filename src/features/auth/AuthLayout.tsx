import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './auth.module.css'

/** Centred auth card with floating brand mark and background orbs. */
export function AuthLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>
      <div className={[styles.card, wide && styles.cardWide].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  )
}
