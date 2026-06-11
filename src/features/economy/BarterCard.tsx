import { Avatar } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { type Barter, BADGE } from './barter.data'
import { memberProfiles } from '../members/data/memberProfiles'
import type { AvatarTint } from '../../shared/components/ui/Avatar'
import styles from './BarterPage.module.css'

function getMemberInfo(b: Barter): { name: string; initials: string; tint: AvatarTint; hood: string } {
  if (b.member && memberProfiles[b.member]) {
    const m = memberProfiles[b.member]
    return { name: `${m.first} ${m.last}`, initials: m.initials, tint: m.tint, hood: m.hood }
  }
  return { name: b.name ?? '—', initials: b.initials ?? '?', tint: (b.tint ?? 'jade') as AvatarTint, hood: b.hood ?? '' }
}

interface Props {
  barter: Barter
}

export function BarterCard({ barter: b }: Props) {
  const { showToast } = useToast()
  const info = getMemberInfo(b)

  return (
    <article className={styles.bc}>
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
        <button className={styles.bcReach} onClick={() => showToast(`Message sent to ${info.name}`, 'success')}>
          Propose a swap →
        </button>
      </div>
    </article>
  )
}
