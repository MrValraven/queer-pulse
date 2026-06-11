import type { Grant } from './microGrants.data'
import styles from './MicroGrantsPage.module.css'

export function GrantCard({ g }: { g: Grant }) {
  return (
    <div className={styles.gc}>
      <div className={styles.gcAmount}>{g.amount}</div>
      <div className={styles.gcBody}>
        <div className={styles.gcName}>{g.name}</div>
        <div className={styles.gcDesc}>{g.desc}</div>
        <div className={styles.gcFoot}>
          {g.tags.map((t) => (
            <span key={t} className={styles.gtag}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <span
        className={[styles.gcStatus, g.status === 'awarded' ? styles.gsAwarded : styles.gsInProgress].join(' ')}
      >
        {g.statusLabel}
      </span>
    </div>
  )
}
