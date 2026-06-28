import { FiLock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { SEALED_IDENTITY, type ModerationEntry } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

/* ── Moderation history — for & against ──────────────────── */

export function ModerationTimeline({ entries }: { entries: ModerationEntry[] }) {
  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>Moderation history — for &amp; against</h3>
      <ul className={styles.timeline}>
        {entries.map((e, i) => (
          <li key={i} className={`${styles.timelineItem} ${styles[`tl_${e.tone}`]}`}>
            <span className={styles.timelineMarker} aria-hidden />
            <div className={styles.timelineTx}>
              <span className={styles.timelineTitle}>{e.title}</span>
              <span className={styles.timelineMeta}>
                {e.meta}
                {e.metaLink && (
                  <Link className={styles.timelineLink} to={routes.adminGovernance}>
                    {e.metaLink}
                  </Link>
                )}
              </span>
              {e.note && <span className={styles.timelineNote}>{e.note}</span>}
            </div>
          </li>
        ))}
      </ul>
      <Link className={styles.auditLink} to={routes.adminGovernance}>
        Every entry in the audit log →
      </Link>
    </section>
  )
}

/* ── Identity & privacy (sealed-lock card) ───────────────── */

export function SealedIdentity() {
  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>Identity &amp; privacy</h3>
      <div className={styles.sealedCard}>
        <span className={styles.sealedIcon} aria-hidden>
          <FiLock />
        </span>
        <div>
          <div className={styles.sealedTitle}>{SEALED_IDENTITY.title}</div>
          <p className={styles.sealedBody}>{SEALED_IDENTITY.body}</p>
        </div>
      </div>
    </section>
  )
}
