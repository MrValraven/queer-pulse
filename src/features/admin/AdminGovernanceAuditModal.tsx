import { FiShield } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { AdminModal, AdminChip, AdminAvatar } from './ui'
import { portrait } from './adminPeople.data'
import type { AuditEntry } from './adminGovernance.data'
import styles from './AdminGovernancePage.module.css'

export function AdminGovernanceAuditModal({
  entry,
  onClose,
}: {
  entry: AuditEntry
  onClose: () => void
}) {
  return (
    <AdminModal
      eyebrow="Audit entry"
      title={entry.action}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" to={entry.link.to} onClick={onClose}>
            Open {entry.link.label} →
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className={styles.entryMod}>
        <AdminAvatar
          initials={entry.modInitials}
          tone={entry.modTone}
          size="md"
          src={portrait(entry.modName)}
        />
        <div className={styles.entryModTx}>
          <span className={styles.entryModName}>{entry.modName}</span>
          <span className={styles.entryModWhen}>acted {entry.when}</span>
        </div>
        <AdminChip tone={entry.actionTone}>{entry.action}</AdminChip>
      </div>

      <dl className={styles.entryDl}>
        <dt className={styles.entryDt}>Subject</dt>
        <dd className={styles.entryDd}>{entry.subject}</dd>

        <dt className={styles.entryDt}>Reason given to the member</dt>
        <dd>
          <blockquote className={styles.entryQuote}>{entry.reason}</blockquote>
        </dd>
      </dl>

      <p className={styles.entryNote}>
        <FiShield className={styles.entryNoteIco} aria-hidden />
        The affected member was shown this reason and given the right to appeal. This entry can never
        be edited or deleted.
      </p>
    </AdminModal>
  )
}
