import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { AdminChip, AdminCat, AdminAvatar } from './ui'
import { portrait } from './adminPeople.data'
import { type Community, type QueueItem } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

const SHOWN = 2

// ── Scoped queue pane ───────────────────────────────────────────────────────

export function ScopedQueuePane({ community }: { community: Community }) {
  const { queue, resolvedPct } = community

  if (queue.length === 0) {
    return (
      <div className={styles.pane}>
        <div className={styles.calmPanel}>
          <span className={styles.calmCheck} aria-hidden>
            <FiCheck />
          </span>
          <h3 className={styles.calmTitle}>
            Nothing open, <em>nothing owed</em>.
          </h3>
          <p className={styles.calmText}>
            This community resolves everything itself — a {resolvedPct}% on-time record. Its
            moderators rarely need you.
          </p>
        </div>
      </div>
    )
  }

  const shown = queue.slice(0, SHOWN)
  const extra = queue.length - shown.length

  return (
    <div className={styles.pane}>
      {shown.map((r) => (
        <ReportRow key={r.title} item={r} />
      ))}
      {extra > 0 && (
        <div className={styles.queueMore}>
          + {extra} more being handled by the community's own moderators
        </div>
      )}
    </div>
  )
}

function ReportRow({ item }: { item: QueueItem }) {
  const catTone = item.catTone === 'danger' ? 'danger' : item.catTone === 'jade' ? 'jade' : 'coral'
  return (
    <div className={styles.reportRow}>
      <span className={`${styles.severity} ${styles[`sev_${item.sev}`]}`} aria-hidden />
      <div className={styles.reportBody}>
        <AdminCat tone={catTone}>{item.catLabel}</AdminCat>
        <div className={styles.reportTitle}>{item.title}</div>
        <div className={styles.reportMeta}>{item.meta}</div>
      </div>
      <Button variant="primary" to={routes.adminModeration}>
        Review →
      </Button>
    </div>
  )
}

// ── Members pane ────────────────────────────────────────────────────────────

export function MembersPane({ community }: { community: Community }) {
  return (
    <div className={styles.pane}>
      {community.mods.map((m) => (
        <div key={m.name} className={styles.memberRow}>
          <AdminAvatar
            initials={m.initials}
            tone={m.tone}
            size="md"
            verified
            src={portrait(m.name)}
            alt={m.name}
          />
          <div className={styles.memberMeta}>
            <div className={styles.memberName}>
              {m.name} <span className={styles.memberPronouns}>{m.pronouns}</span>
            </div>
            <div className={styles.memberDetail}>{m.role}</div>
          </div>
          <AdminChip tone="jade">Moderator</AdminChip>
        </div>
      ))}

      <Button variant="ghost" to={routes.adminMembers}>
        See all {community.members} members →
      </Button>
    </div>
  )
}
