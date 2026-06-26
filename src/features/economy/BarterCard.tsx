import type { SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { type Barter, BADGE, getMemberInfo } from './barter.data'
import styles from './BarterPage.module.css'

interface Props {
  barter: Barter
}

export function BarterCard({ barter: b }: Props) {
  const { showToast } = useToast()
  const info = getMemberInfo(b)

  function propose(e: SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
    showToast(`Message sent to ${info.name}`, 'success')
  }

  return (
    <Link to={`${routes.barter}/${b.id}`} className={styles.bc}>
      <div className={styles.bcHead}>
        <Avatar initials={info.initials} tint={info.tint} size={40} />
        <div className={styles.bcMeta}>
          <div className={styles.bcName}>{info.name}</div>
          <div className={styles.bcHood}>{info.hood}</div>
        </div>
        <span className={`${styles.bcBadge} ${styles[b.mode]}`}>{BADGE[b.mode]}</span>
      </div>
      {b.offer && (
        <div className={`${styles.bcBlock} ${styles.bcOffer}`}>
          <div className={styles.bcLabel}>Offering</div>
          <div className={styles.bcSkill}>{b.offer}</div>
          <div className={styles.bcDesc}>{b.offerDetail}</div>
        </div>
      )}
      {b.want && (
        <div className={`${styles.bcBlock} ${styles.bcWant}`}>
          <div className={styles.bcLabel}>Looking for</div>
          <div className={styles.bcSkill}>{b.want}</div>
          <div className={styles.bcDesc}>{b.wantDetail}</div>
        </div>
      )}
      <div className={styles.btags}>
        {b.tags.map((tag) => (
          <span key={tag} className={styles.btag}>{tag}</span>
        ))}
      </div>
      <div className={styles.bcFoot}>
        <span className={styles.bcDays}>{b.days === 1 ? 'Today' : `${b.days} days ago`}</span>
        <span
          role="button"
          tabIndex={0}
          className={styles.bcReach}
          onClick={propose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') propose(e)
          }}
        >
          Propose a swap →
        </span>
      </div>
    </Link>
  )
}
