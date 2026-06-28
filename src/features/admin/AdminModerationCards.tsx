import type { ReactNode } from 'react'
import { FiAlertTriangle, FiFlag, FiCheck, FiClock, FiUsers } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { AdminChip, AdminCat } from './ui'
import { SEVERITY, type ModReport, type Appeal, type ResolvedItem } from './adminModeration.data'
import styles from './AdminModerationPage.module.css'

/* ── Severity-striped report card ───────────────────────────────────────── */

export function ReportCard({
  report,
  leaving,
  selected,
  onToggle,
  onOpen,
}: {
  report: ModReport
  leaving?: boolean
  selected?: boolean
  onToggle?: (id: string) => void
  onOpen: (r: ModReport) => void
}) {
  const sev = SEVERITY[report.severity]
  return (
    <article
      className={[styles.report, selected && styles.reportSelected, leaving && styles.reportLeaving]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--stripe' as string]: sev.stripe }}
    >
      {onToggle && (
        <span
          role="checkbox"
          aria-checked={!!selected}
          aria-label={`Select report: ${report.title}`}
          tabIndex={0}
          className={[styles.selectBox, selected && styles.selectBoxOn].filter(Boolean).join(' ')}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(report.id)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onToggle(report.id)
            }
          }}
        >
          {selected && <FiCheck aria-hidden />}
        </span>
      )}

      <button
        type="button"
        className={[styles.reportMain, onToggle && styles.reportMainNudge]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onOpen(report)}
      >
        <span className={styles.reportTop}>
          <AdminCat tone={sev.cat}>{sev.label}</AdminCat>
          {report.chips.map((c) => (
            <AdminChip key={c.label} tone={c.tone} dot={c.dot}>
              {c.label}
            </AdminChip>
          ))}
        </span>

        <span className={styles.reportTitle}>
          {report.title} {report.titleEm && <em>{report.titleEm}</em>}{' '}
          {report.titleAfter}
        </span>
        <span className={styles.reportPreview}>{report.preview}</span>

        <span className={styles.reportMeta}>
          <span>
            Reported by <strong>{report.reporterName}</strong>
          </span>
          <span aria-hidden className={styles.metaDot}>
            ·
          </span>
          <span>
            About <strong>{report.reportedName}</strong>
          </span>
          {report.priorReports && (
            <span className={styles.priorFlag}>
              <FiFlag aria-hidden /> {report.priorReports}
            </span>
          )}
        </span>
      </button>

      <div className={styles.reportSide}>
        <span className={styles.reportAge}>
          <FiClock aria-hidden /> {report.age}
        </span>
        <AdminChip tone={report.risk.tone}>{report.risk.label}</AdminChip>
      </div>
    </article>
  )
}

/* ── Bulk-action bar (sticky, shown when ≥1 selected) ───────────────────── */

export function BulkBar({
  count,
  onDismiss,
  onSpam,
  onReassign,
  onCancel,
}: {
  count: number
  onDismiss: () => void
  onSpam: () => void
  onReassign: () => void
  onCancel: () => void
}) {
  return (
    <div className={styles.bulkBar} role="region" aria-label="Bulk actions">
      <span className={styles.bulkCount}>{count} selected</span>
      <div className={styles.bulkActions}>
        <Button variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button variant="ghost" onClick={onSpam}>
          Remove as spam
        </Button>
        <Button variant="ghost" onClick={onReassign}>
          Reassign…
        </Button>
        <Button variant="ghost-dark" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

/* ── Emergency band wrapper ─────────────────────────────────────────────── */

export function EmergencyBand({
  children,
  count,
  sub,
}: {
  children: ReactNode
  count: number
  sub: ReactNode
}) {
  return (
    <section className={styles.emergBand} aria-label="Safety emergencies">
      <div className={styles.emergHead}>
        <span className={styles.emergIco} aria-hidden>
          <FiAlertTriangle />
        </span>
        <h2 className={styles.emergTitle}>
          {count} safety {count === 1 ? 'emergency' : 'emergencies'}
          <span className={styles.emergTitleSub}> {sub}</span>
        </h2>
      </div>
      <div className={styles.emergList}>{children}</div>
    </section>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={styles.sectionLabel}>{children}</p>
}

/* ── Caught-up plum success panel ───────────────────────────────────────── */

export function CaughtUpPanel({
  onBack,
  onReplay,
}: {
  onBack: () => void
  onReplay: () => void
}) {
  return (
    <div className={styles.caughtUp}>
      <span className={styles.caughtIco} aria-hidden>
        <FiCheck />
      </span>
      <h2 className={styles.caughtTitle}>
        You&rsquo;re <em>caught up</em>.
        <br />
        Nothing needs you right now.
      </h2>
      <p className={styles.caughtSub}>
        Every open report has a human decision attached to it, and every affected member has been
        told what happened and why. Go rest — the network is safe in your hands.
      </p>
      <div className={styles.caughtActions}>
        <Button variant="ghost-dark" onClick={onBack}>
          Back to overview
        </Button>
        <Button variant="jade" onClick={onReplay}>
          Replay the queue
        </Button>
      </div>
    </div>
  )
}

/* ── Appeals list (each card opens the appeal drawer) ───────────────────── */

export function AppealCard({
  appeal,
  leaving,
  onOpen,
}: {
  appeal: Appeal
  leaving?: boolean
  onOpen: (a: Appeal) => void
}) {
  const sev = SEVERITY[appeal.severity]
  return (
    <article
      className={[styles.report, leaving && styles.reportLeaving].filter(Boolean).join(' ')}
      style={{ ['--stripe' as string]: sev.stripe }}
      onClick={() => onOpen(appeal)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(appeal)
        }
      }}
    >
      <div className={styles.reportMain}>
        <div className={styles.reportTop}>
          {appeal.chips.map((c) => (
            <AdminChip key={c.label} tone={c.tone}>
              {c.label}
            </AdminChip>
          ))}
        </div>

        <h3 className={styles.reportTitle}>{appeal.title}</h3>
        <p className={styles.reportPreview}>{appeal.preview}</p>

        <div className={styles.reportMeta}>
          <span>
            Appeal by <strong>{appeal.appealBy}</strong>
          </span>
          <span aria-hidden className={styles.metaDot}>
            ·
          </span>
          <span>
            Decided by <strong>{appeal.original.by}</strong>
          </span>
          {appeal.community && (
            <>
              <span aria-hidden className={styles.metaDot}>
                ·
              </span>
              <span>{appeal.community}</span>
            </>
          )}
          {appeal.supporters.length > 0 && (
            <span className={styles.supportFlag}>
              <FiUsers aria-hidden /> {appeal.supporters.length} backing them
            </span>
          )}
        </div>
      </div>

      <div className={styles.reportSide}>
        <span className={styles.reportAge}>
          <FiClock aria-hidden /> {appeal.age}
        </span>
        <AdminChip tone={appeal.status.tone}>{appeal.status.label}</AdminChip>
      </div>
    </article>
  )
}

/* ── Resolved list ──────────────────────────────────────────────────────── */

export function ResolvedRow({ item }: { item: ResolvedItem }) {
  const sev = SEVERITY[item.severity]
  return (
    <article
      className={[styles.report, styles.reportStatic].join(' ')}
      style={{ ['--stripe' as string]: sev.stripe }}
    >
      <div className={styles.reportMain}>
        <div className={styles.reportTop}>
          {item.chips.map((c) => (
            <AdminChip key={c.label} tone={c.tone}>
              {c.label}
            </AdminChip>
          ))}
          <AdminCat tone={item.outcomeTone}>{item.outcome}</AdminCat>
        </div>

        <h3 className={styles.reportTitle}>{item.title}</h3>
        <p className={styles.reportPreview}>{item.preview}</p>

        <div className={styles.reportMeta}>
          <span>{item.closed}</span>
          {item.notified.map((line) => (
            <span key={line} className={styles.resolvedNotified}>
              <FiCheck aria-hidden />
              {line}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.reportSide}>
        <AdminChip tone={item.status.tone}>{item.status.label}</AdminChip>
      </div>
    </article>
  )
}
