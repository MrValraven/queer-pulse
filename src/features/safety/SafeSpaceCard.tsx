import { Link } from 'react-router-dom'
import { FiStar, FiFlag } from 'react-icons/fi'
import { FadeIn } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import type { VerifiedSpace } from './safeSpaces'
import { TYPE_CLASS } from './safeSpacesPage.data'
import styles from './SafeSpacesPage.module.css'

export function SafeSpaceCard({ s, onFlag, delay = 0 }: { s: VerifiedSpace; onFlag: () => void; delay?: number }) {
  const flag = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFlag()
  }
  return (
    <FadeIn as={Link} to={`${routes.safeSpaces}/${s.slug}`} className={styles.card} delay={delay}>
      <div className={styles.cardHead}>
        <div className={`${styles.venueType} ${styles[TYPE_CLASS[s.cat]]}`}>{s.typeLabel}</div>
        <div className={styles.verifiedBadge}>
          <div className={styles.vbDot} />
          Verified
        </div>
      </div>
      <div className={styles.name}>{s.name}</div>
      <div className={styles.hood}>
        <span className={styles.pin} />
        {s.hood}
      </div>
      <div className={styles.desc}>{s.desc}</div>
      <div className={styles.tags}>
        {s.tags.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
      <div className={styles.cardFoot}>
        <div className={styles.reviews}>
          <FiStar /> <strong>{s.rating}</strong> · {s.reviews}
        </div>
        <span
          role="button"
          tabIndex={0}
          className={styles.flag}
          onClick={flag}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') flag(e)
          }}
        >
          <FiFlag /> Flag
        </span>
      </div>
    </FadeIn>
  )
}
