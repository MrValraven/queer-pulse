import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { AdminChip, AdminCat, AdminAvatar } from './ui'
import type { CommunityDetail } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

// ── Scoped queue pane ───────────────────────────────────────────────────────

export function ScopedQueuePane({ detail }: { detail: CommunityDetail }) {
  return (
    <div className={styles.pane}>
      {detail.scoped.map((r) => (
        <div key={r.title} className={styles.reportRow}>
          <span className={`${styles.severity} ${styles[`sev_${r.severity}`]}`} aria-hidden />
          <div className={styles.reportBody}>
            <AdminCat tone={r.tone === 'danger' ? 'danger' : r.tone === 'jade' ? 'jade' : 'coral'}>
              {r.category}
            </AdminCat>
            <div className={styles.reportTitle}>{r.title}</div>
            <div className={styles.reportMeta}>{r.meta}</div>
          </div>
          <Button variant="primary" to={routes.adminModeration}>
            Review →
          </Button>
        </div>
      ))}

      <div className={styles.calmPanel}>
        <span className={styles.calmCheck} aria-hidden>
          <FiCheck />
        </span>
        <h3 className={styles.calmTitle}>
          One report, then <em>calm</em>.
        </h3>
        <p className={styles.calmText}>
          This community resolves nearly everything itself. Its moderators have a 100% on-time
          record this quarter — they rarely need you.
        </p>
      </div>
    </div>
  )
}

// ── Members pane ────────────────────────────────────────────────────────────

export function MembersPane({ detail }: { detail: CommunityDetail }) {
  const { showToast } = useToast()

  return (
    <div className={styles.pane}>
      {detail.roster.map((m) => (
        <div key={m.name} className={styles.memberRow}>
          <AdminAvatar initials={m.initials} tone={m.tone} size="md" verified={m.verified} />
          <div className={styles.memberMeta}>
            <div className={styles.memberName}>
              {m.name} <span className={styles.memberPronouns}>{m.pronouns}</span>
            </div>
            <div className={styles.memberDetail}>{m.detail}</div>
          </div>
          {m.role ? (
            <AdminChip tone={m.role.tone}>{m.role.label}</AdminChip>
          ) : (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => showToast(`${m.name}'s profile would open`, 'info')}
            >
              {m.link}
            </button>
          )}
        </div>
      ))}

      <Button variant="ghost" to={routes.adminMembers}>
        See all {detail.totalMembers} members →
      </Button>
    </div>
  )
}

// ── Settings pane ───────────────────────────────────────────────────────────

export function SettingsPane({ detail }: { detail: CommunityDetail }) {
  const { showToast } = useToast()

  return (
    <div className={styles.pane}>
      {detail.settings.map((s) => (
        <div key={s.label} className={styles.setRow}>
          <div className={styles.setTop}>
            <div className={styles.setLabel}>{s.label}</div>
            {s.badge && <AdminChip tone={s.badge.tone}>{s.badge.label}</AdminChip>}
            {s.action && (
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => showToast(`${s.label} would open here`, 'info')}
              >
                {s.action}
              </button>
            )}
          </div>
          <div className={styles.setDetail}>{s.detail}</div>
          {s.chips && (
            <div className={styles.setChips}>
              {s.chips.map((c) => (
                <AdminChip key={c.label} tone={c.tone}>
                  {c.label}
                </AdminChip>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
