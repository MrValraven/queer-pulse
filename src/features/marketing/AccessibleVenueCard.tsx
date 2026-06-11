import type { Badge, Venue } from './accessibility.data'
import styles from './AccessibilityPage.module.css'

const BADGE_CLASS: Record<Badge, string> = {
  yes: styles.badgeYes,
  partial: styles.badgePartial,
  no: styles.badgeNo,
}

export function AccessibleVenueCard({ v, onFlag }: { v: Venue; onFlag: () => void }) {
  return (
    <div className={styles.venueCard}>
      <div className={styles.vcName}>{v.name}</div>
      <div className={styles.vcType}>{v.type}</div>
      <div className={styles.vcHood}>
        <span className={styles.vcHoodDot} />
        {v.hood}
      </div>
      <p className={styles.vcNote}>{v.note}</p>
      <div className={styles.vcFeatures}>
        {v.features.map((f) => (
          <span key={f.label} className={`${styles.vfBadge} ${BADGE_CLASS[f.cls]}`}>
            {f.label}
          </span>
        ))}
      </div>
      <div className={styles.vcFoot}>
        <span className={styles.vcReviewer}>{v.reviewer}</span>
        <button type="button" className={styles.flagBtn} onClick={onFlag}>
          Flag an issue
        </button>
      </div>
    </div>
  )
}
