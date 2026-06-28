import { FadeIn, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { AdminChip, AdminAvatar } from './ui'
import { AUDIT_ENTRIES, type AuditEntry } from './adminGovernance.data'
import styles from './AdminGovernancePage.module.css'

export function AdminGovernanceAudit() {
  const loading = useSimulatedLoad(1100)

  return (
    <FadeIn>
      <div className={styles.auditHead}>
        <h2 className={styles.cardTitle}>
          Every action, <em>on the record</em>
        </h2>
        <span className={styles.auditMeta}>14,206 entries · since 2023</span>
      </div>

      <div className={styles.auditCard}>
        <div className={styles.auditTable} role="table">
          <div className={styles.auditRowHead} role="row">
            <span role="columnheader">Moderator</span>
            <span role="columnheader">Action</span>
            <span role="columnheader">Subject</span>
            <span role="columnheader">Reason</span>
            <span role="columnheader">When</span>
          </div>

          {loading
            ? AUDIT_ENTRIES.map((e) => <SkeletonRow key={e.id} />)
            : AUDIT_ENTRIES.map((e, i) => (
                <FadeIn key={e.id} delay={i * 55}>
                  <AuditRow entry={e} />
                </FadeIn>
              ))}
        </div>
      </div>
    </FadeIn>
  )
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className={styles.auditRow} role="row">
      <span className={styles.auditMod} role="cell">
        <AdminAvatar initials={entry.modInitials} tone={entry.modTone} size="sm" />
        {entry.modName}
      </span>
      <span role="cell">
        <AdminChip tone={entry.actionTone}>{entry.action}</AdminChip>
      </span>
      <span className={styles.auditSubject} role="cell">
        {entry.subject}
      </span>
      <span className={styles.auditReason} role="cell">
        {entry.reason}
      </span>
      <span className={styles.auditWhen} role="cell">
        {entry.when}
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className={styles.auditRow} aria-hidden>
      <span className={styles.auditMod}>
        <SkeletonLine width={26} height={26} style={{ borderRadius: 999, flex: 'none' }} />
        <SkeletonLine width="60%" />
      </span>
      <SkeletonLine width={92} height={22} style={{ borderRadius: 999 }} />
      <SkeletonLine width="70%" />
      <SkeletonLine width="90%" />
      <SkeletonLine width="50%" />
    </div>
  )
}
