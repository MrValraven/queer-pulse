import { Avatar, Button, VisibilityBadge, type VisibilityMode } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useWorkProfile } from '../../app/providers/WorkProfileProvider'
import { workIdentity } from './work.data'
import styles from './WorkHubPage.module.css'

/** Maps the out-at-work spectrum to the shared VisibilityBadge modes. */
const OUT_TO_MODE: Record<string, VisibilityMode> = {
  out: 'open',
  verified: 'network',
  private: 'private',
}

/** The Work Profile summary module — identity at the centre of the workspace. */
export function WorkProfileCard() {
  const { outAtWork } = useWorkProfile()
  const mode = OUT_TO_MODE[outAtWork] ?? 'network'
  return (
    <div className={styles.pCard}>
      <div className={styles.pHead}>
        <Avatar initials={workIdentity.initials} tint="coral" size={52} />
        <div className={styles.pId}>
          <div className={styles.pName}>
            {workIdentity.name}
            <span className={styles.pPronouns}>{workIdentity.pronouns}</span>
          </div>
          <div className={styles.pHeadline}>{workIdentity.headline}</div>
          <div className={styles.pLocation}>{workIdentity.location}</div>
        </div>
        <VisibilityBadge mode={mode} className={styles.pBadge} />
      </div>

      <div className={styles.pMeterRow}>
        <span className={styles.pMeterLabel}>Profile {workIdentity.completeness}% complete</span>
        <div className={styles.meter}>
          <div className={styles.meterFill} style={{ width: `${workIdentity.completeness}%` }} />
        </div>
      </div>

      <div className={styles.pFoot}>
        <p className={styles.pNote}>
          This controls how you appear to employers — and what stays yours.
        </p>
        <Button variant="primary" to={routes.workProfile}>
          Edit work profile
        </Button>
      </div>
    </div>
  )
}
