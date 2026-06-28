import { FiUsers } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { AdminModal } from './ui'
import { routes } from '../../app/routeMap'
import { CARE_DIFF, type DiffLine } from './adminGovernance.data'
import styles from './AdminGovernancePage.module.css'

const SIGN: Record<DiffLine['kind'], string> = {
  ctx: ' ',
  removed: '−',
  added: '+',
}

export function AdminGovernanceDiffModal({ onClose }: { onClose: () => void }) {
  return (
    <AdminModal
      wide
      eyebrow="Policy change"
      title={<>v4.1 → <em>v4.2</em></>}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" to={routes.governance} onClick={onClose}>
            Read full v4.2 →
          </Button>
        </>
      }
    >
      <p className={styles.diffIntro}>
        <strong>Section 3 — Harm we treat as urgent.</strong> Ratified 12 Jun 2026, 89% in favour.
      </p>

      <div className={styles.diff} role="list">
        {CARE_DIFF.map((line, i) => (
          <div
            key={i}
            role="listitem"
            className={[styles.diffLine, styles[`diff_${line.kind}`]].join(' ')}
          >
            <span className={styles.diffSign} aria-hidden>
              {SIGN[line.kind]}
            </span>
            <span className={styles.diffText}>{line.text}</span>
          </div>
        ))}
      </div>

      <p className={styles.diffNote}>
        <FiUsers className={styles.diffNoteIco} aria-hidden />
        Proposed by the Trans &amp; Friends moderators · voted on by the whole community at the
        Annual Assembly.
      </p>
    </AdminModal>
  )
}
