import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import type { Community } from '../homepage/data/types'
import type { CommunityDetail, Tint } from './communityDetails'
import { AV_CLASS } from './CommunityThread'
import styles from './CommunityDetailPage.module.css'

const GATHERING = routes.gathering

const relTint = (t: string): Tint =>
  t === 'sports' || t === 'social' || t === 'support' ? 'jade' : t === 'arts' || t === 'professional' ? 'coral' : 'plum'

export function CommunitySidebar({ detail, related }: { detail: CommunityDetail; related: Community[] }) {
  const { showToast } = useToast()
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Organiser</div>
        <div className={[styles.sbOrgAv, AV_CLASS[detail.organiser.tint]].join(' ')}>{detail.organiser.initials}</div>
        <div className={styles.sbOrgName}>{detail.organiser.name}</div>
        <div className={styles.sbBadge}>{detail.organiser.role}</div>
        <p className={styles.sbOrgBio}>{detail.organiser.bio}</p>
        <Button variant="ghost" className={styles.sbFull} onClick={() => showToast(`Message sent to ${detail.organiser.name.split(' ')[0]}.`, 'success')}>
          Send a message
        </Button>
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Next gathering</div>
        <div className={styles.sbEvDate}>
          <div className={styles.sbEDd}>{detail.nextEvent.dd}</div>
          <div className={styles.sbEDm}>{detail.nextEvent.mm}</div>
        </div>
        <div className={styles.sbETitle}>{detail.nextEvent.title}</div>
        <div className={styles.sbEMeta}>{detail.nextEvent.meta}</div>
        <div className={styles.sbESpots}>
          <span className={styles.sbESdot} />
          {detail.nextEvent.spots}
        </div>
        <Button variant="primary" to={GATHERING} className={styles.sbFull} style={{ marginTop: 14 }}>
          RSVP →
        </Button>
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Related communities</div>
        {related.map((c) => (
          <Link key={c.slug} to={`/community/${c.slug}`} className={styles.sbRelItem}>
            <div className={[styles.sbRelIc, AV_CLASS[relTint(c.type)]].join(' ')}>
              {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className={styles.sbRelName}>{c.name}</div>
              <div className={styles.sbRelCt}>{c.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
