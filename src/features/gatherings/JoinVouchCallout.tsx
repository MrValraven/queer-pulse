import { FiShield, FiUserPlus } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './JoinVouchCallout.module.css'

/**
 * Small reusable callout for non-members who land on a gathering/event page.
 * Explains the invite/vouch flow and links to request an invite + safety info.
 * Plum-panel emphasis treatment so it reads as important, not a flimsy card.
 */
export function JoinVouchCallout() {
  return (
    <div className={styles.callout}>
      <span className={styles.icon} aria-hidden>
        <FiUserPlus />
      </span>
      <div className={styles.body}>
        <div className={styles.title}>
          New here? <em>Get vouched in.</em>
        </div>
        <p className={styles.text}>
          QueerPulse gatherings are members-only. To join, someone in the network vouches for you, or
          you request an invite and a member follows up. It keeps every room safe.
        </p>
        <div className={styles.actions}>
          <Button variant="ghost-dark" to={routes.requestInvite}>
            Request an invite
          </Button>
          <Button variant="ghost-dark" to={routes.safety}>
            <FiShield aria-hidden style={{ marginRight: 6 }} />
            How we keep it safe
          </Button>
        </div>
      </div>
    </div>
  )
}
