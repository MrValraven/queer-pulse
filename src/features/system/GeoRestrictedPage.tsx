import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { SystemStateShell } from '../../shared/components/layout'
import styles from './GeoRestrictedPage.module.css'

const CAN_DO = [
  {
    label: 'Read all public articles & the magazine',
    detail: <>The full editorial archive is open · <Link to={routes.magazine}>browse →</Link></>,
  },
  {
    label: 'Access crisis & safety resources',
    detail: <>Crisis chat, emergency guides, and harm-reduction docs · <Link to={routes.crisisChat}>open crisis chat →</Link></>,
  },
  {
    label: 'Browse vetted international resources',
    detail: <>Hotlines, queer-friendly legal aid, and emergency contacts in 14 other countries · <Link to={routes.resources}>resource library →</Link></>,
  },
  {
    label: 'Ask us to open access here',
    detail: <>Tell us where you are (no need for your name) and what would help · <Link to={routes.contact + '?topic=region'}>write to the team →</Link></>,
  },
]

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function GeoRestrictedPage() {
  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.ic}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
          </svg>
        </div>

        <div className={styles.eyebrow}>Region restricted</div>
        <h1 className={styles.h1}>QueerPulse isn't <em>fully available</em> here yet.</h1>
        <p className={styles.lead}>
          It looks like you're connecting from a country where some QueerPulse features are
          restricted — most often because we don't have moderators in your timezone, or because
          we're working through local legal review.{' '}
          <em>Crisis support and safety resources are still open to you.</em>
        </p>

        <div className={styles.why}>
          <h4>Why this happens</h4>
          <p>
            We open access to a new region only when we have{' '}
            <em>at least one moderator in-country</em> and have reviewed the local legal framework
            for queer expression. It is intentionally slow. We don't want to advertise queer
            community to a place where members would be put at risk by joining.
          </p>
        </div>

        <div className={styles.can}>
          <h3 className={styles.canTitle}>What you can still do · right now</h3>
          <div className={styles.canList}>
            {CAN_DO.map((item, i) => (
              <div key={i} className={styles.canRow}>
                <div className={styles.canIc}><CheckIcon /></div>
                <div>
                  <b>{item.label}</b>
                  <span>{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detect}>
          <div className={styles.flag} aria-hidden />
          <span>Detected: <b>Portugal · Lisbon</b> · this is a demo of the region-restricted view.</span>
          <Link to={routes.homepage}>Go home →</Link>
        </div>
      </div>
    </SystemStateShell>
  )
}
