import { useState } from 'react'
import { FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import {
  type ModReportItem,
  type AppealItem,
  type ActionLogRow,
  REPORT_TYPE_LABEL,
} from './adminModeration.data'
import styles from './AdminModerationPage.module.css'

// ── ActionConfirm ────────────────────────────────────────────────────────────

interface ActionConfirmProps {
  open: boolean
  action: string
  target: string
  onConfirm: (note: string) => void
  onCancel: () => void
}

export function ActionConfirm({ open, action, target, onConfirm, onCancel }: ActionConfirmProps) {
  const [note, setNote] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    if (!note.trim()) return
    onConfirm(note.trim())
    setNote('')
  }

  const handleCancel = () => {
    setNote('')
    onCancel()
  }

  return (
    <div className={styles.confirm}>
      <div className={styles.confirmTop}>
        <FiAlertCircle size={22} className={styles.confirmIcon} aria-hidden />
        <div>
          <h3 className={styles.confirmTitle}>
            Confirm <em>{action}</em> on {target}
          </h3>
          <p className={styles.confirmSub}>
            This action will be logged. Add a note explaining your decision (required).
          </p>
        </div>
      </div>
      <textarea
        className={styles.confirmNote}
        placeholder="Describe why you are taking this action…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        required
        aria-label="Moderator note"
      />
      <div className={styles.confirmActions}>
        <Button
          variant="jade"
          size="md"
          disabled={!note.trim()}
          onClick={handleConfirm}
        >
          Confirm action
        </Button>
        <Button variant="ghost-dark" size="md" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── ReportCard ───────────────────────────────────────────────────────────────

interface ReportCardProps {
  report: ModReportItem
  onResolve: (id: string, action: string, target: string) => void
}

export function ReportCard({ report, onResolve }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showSuspend, setShowSuspend] = useState(false)

  const sevClass =
    report.severity === 'critical'
      ? styles.sevCritical
      : report.severity === 'high'
        ? styles.sevHigh
        : styles.sevMedium

  const sevLabel =
    report.severity === 'critical' ? 'Critical' : report.severity === 'high' ? 'High' : 'Medium'

  const resolve = (action: string) => onResolve(report.id, action, report.reported)

  return (
    <div className={styles.reportCard}>
      <div className={styles.cardHead}>
        <span className={`${styles.sev} ${sevClass}`}>{sevLabel}</span>
        <span className={styles.typeLabel}>{REPORT_TYPE_LABEL[report.type]}</span>
        <span className={styles.cardId}>#{report.id}</span>
      </div>
      <blockquote className={styles.excerpt}>
        {expanded ? report.excerpt : `${report.excerpt.slice(0, 120)}…`}
      </blockquote>
      <button
        className={styles.expandBtn}
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? 'Collapse' : 'Read full excerpt'}
      </button>
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          Reporter: <strong>{report.reporter}</strong>
        </span>
        <span className={styles.metaItem}>
          Reported: <strong>{report.reported}</strong>
        </span>
        {report.community && (
          <span className={styles.metaItem}>
            Community: <strong>{report.community}</strong>
          </span>
        )}
        <span className={styles.metaItem}>{report.time}</span>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" size="md" onClick={() => resolve('Warning')}>
          Warn
        </Button>
        {showSuspend ? (
          <div className={styles.suspendOpts}>
            <span style={{ fontSize: 12, color: 'var(--ink-60)' }}>Suspend for:</span>
            {['1 day', '7 days', '30 days'].map((d) => (
              <Button
                key={d}
                variant="ghost"
                size="md"
                onClick={() => { setShowSuspend(false); resolve(`Suspension (${d})`) }}
              >
                {d}
              </Button>
            ))}
            <button
              type="button"
              className={styles.suspendOpt}
              aria-label="Cancel suspend"
              onClick={() => setShowSuspend(false)}
            >
              <FiX size={14} aria-hidden />
            </button>
          </div>
        ) : (
          <Button variant="ghost" size="md" onClick={() => setShowSuspend(true)}>
            Suspend
          </Button>
        )}
        <Button variant="primary" size="md" onClick={() => resolve('Ban')}>
          Ban
        </Button>
        <Button variant="ghost" size="md" onClick={() => resolve('Dismiss')}>
          Dismiss
        </Button>
        <Button variant="ghost" size="md" onClick={() => resolve('Escalate to council')}>
          Escalate
        </Button>
      </div>
    </div>
  )
}

// ── AppealCard ───────────────────────────────────────────────────────────────

interface AppealCardProps {
  appeal: AppealItem
  onResolve: (id: string, decision: 'uphold' | 'overturn' | 'more-time') => void
}

export function AppealCard({ appeal, onResolve }: AppealCardProps) {
  return (
    <div className={styles.appealCard}>
      <div className={styles.appealHead}>
        <div className={styles.appealAction}>{appeal.action}</div>
        <div className={styles.appealMeta}>
          {appeal.date} · by {appeal.moderator}
        </div>
      </div>
      <div className={styles.appealSection}>
        <div className={styles.appealSectionLabel}>Member statement</div>
        <p className={styles.appealText}>{appeal.statement}</p>
      </div>
      <div className={styles.appealSection}>
        <div className={styles.appealSectionLabel}>Moderator note</div>
        <p className={styles.appealText}>{appeal.modNote}</p>
      </div>
      {appeal.byMe && (
        <div className={styles.byMeNotice}>
          <FiInfo size={16} className={styles.byMeIcon} aria-hidden />
          <span>
            You took the original action — route this appeal to another moderator before deciding.
          </span>
        </div>
      )}
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="md"
          disabled={!!appeal.byMe}
          onClick={() => onResolve(appeal.id, 'uphold')}
        >
          Uphold
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!!appeal.byMe}
          onClick={() => onResolve(appeal.id, 'overturn')}
        >
          Overturn
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => onResolve(appeal.id, 'more-time')}
        >
          Request more time
        </Button>
      </div>
    </div>
  )
}

// ── ActionLogTable ───────────────────────────────────────────────────────────

interface ActionLogTableProps {
  rows: ActionLogRow[]
}

export function ActionLogTable({ rows }: ActionLogTableProps) {
  return (
    <table className={styles.logTable}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Moderator</th>
          <th>Action</th>
          <th>Target</th>
          <th>Community</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className={styles.logDate}>{row.date}</td>
            <td>{row.moderator}</td>
            <td className={styles.logAction}>{row.action}</td>
            <td>{row.target}</td>
            <td>{row.community ?? '—'}</td>
            <td className={styles.logNote}>{row.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
