import { useState } from 'react'
import { FiCheck, FiInfo } from 'react-icons/fi'
import { FadeIn } from '../../shared/components/ui'
import { AdminChip } from './ui'
import { CARE_VERSIONS, PRINCIPLES, type CareVersion } from './adminGovernance.data'
import { AdminGovernanceDiffModal } from './AdminGovernanceDiffModal'
import styles from './AdminGovernancePage.module.css'

export function AdminGovernancePolicy() {
  const [diffOpen, setDiffOpen] = useState(false)

  return (
    <FadeIn>
      <div className={styles.govGrid}>
        <VersionTimeline onSeeDiff={() => setDiffOpen(true)} />
        <div className={styles.policyRail}>
          <PrinciplesCard />
          <TransparencyNote />
        </div>
      </div>
      {diffOpen && <AdminGovernanceDiffModal onClose={() => setDiffOpen(false)} />}
    </FadeIn>
  )
}

function VersionTimeline({ onSeeDiff }: { onSeeDiff: () => void }) {
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          Code of Care <em>versions</em>
        </h2>
        <p className={styles.cardSub}>Every change to how we keep each other safe, dated and open.</p>
      </div>
      <ol className={styles.timeline}>
        {CARE_VERSIONS.map((v) => (
          <TimelineItem key={v.version} v={v} onSeeDiff={onSeeDiff} />
        ))}
      </ol>
    </div>
  )
}

function TimelineItem({ v, onSeeDiff }: { v: CareVersion; onSeeDiff: () => void }) {
  return (
    <li className={[styles.tlItem, v.current && styles.tlItemOn].filter(Boolean).join(' ')}>
      <span className={[styles.tlDot, v.current && styles.tlDotOn].filter(Boolean).join(' ')} aria-hidden />
      <div className={styles.tlBody}>
        <div className={styles.tlHead}>
          <span className={styles.tlVersion}>{v.version}</span>
          {v.badge && <AdminChip tone={v.badgeTone}>{v.badge}</AdminChip>}
          <span className={styles.tlDate}>{v.date}</span>
        </div>
        <p className={styles.tlNote}>{v.note}</p>
        {v.current && (
          <button type="button" className={styles.tlDiffLink} onClick={onSeeDiff}>
            See what changed →
          </button>
        )}
      </div>
    </li>
  )
}

function PrinciplesCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          Our <em>principles</em>
        </h2>
      </div>
      <ul className={styles.principles}>
        {PRINCIPLES.map((p) => (
          <li key={p} className={styles.principle}>
            <span className={styles.principleIco} aria-hidden>
              <FiCheck />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TransparencyNote() {
  return (
    <div className={styles.transpCard}>
      <FiInfo className={styles.transpIco} aria-hidden />
      <p className={styles.transpText}>
        Policy changes are proposed in the open and ratified at the community assembly. Anyone can
        read the full edit history &mdash; nothing here is decided behind closed doors.
      </p>
    </div>
  )
}
