import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { EmptyState, FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { REPORT_QUEUE, APPEALS, ACTION_LOG } from './adminModeration.data'
import { ReportCard, AppealCard, ActionLogTable, ActionConfirm } from './AdminModerationCards'
import styles from './AdminModerationPage.module.css'

const TABS = [
  { key: 'queue', label: 'Queue' },
  { key: 'appeals', label: 'Appeals' },
  { key: 'log', label: 'Action log' },
] as const

type TabKey = (typeof TABS)[number]['key']

const VALID_TABS = TABS.map((t) => t.key)

function isValidTab(v: string | null): v is TabKey {
  return VALID_TABS.includes(v as TabKey)
}

export function AdminModerationPage() {
  const [searchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const [tab, setTab] = useState<TabKey>(isValidTab(rawTab) ? rawTab : 'queue')
  const [queue, setQueue] = useState(REPORT_QUEUE)
  const [appeals, setAppeals] = useState(APPEALS)
  const [pending, setPending] = useState<{ id: string; action: string; target: string } | null>(null)
  const { showToast } = useToast()

  const handleResolveReport = (id: string, action: string, target: string) => {
    setPending({ id, action, target })
  }

  const handleConfirm = (_note: string) => {
    if (!pending) return
    setQueue((q) => q.filter((r) => r.id !== pending.id))
    showToast(`${pending.action} applied to ${pending.target}. Note saved.`)
    setPending(null)
  }

  const handleResolveAppeal = (id: string, decision: 'uphold' | 'overturn' | 'more-time') => {
    const labels = { uphold: 'Upheld', overturn: 'Overturned', 'more-time': 'More time requested' }
    setAppeals((a) => a.filter((ap) => ap.id !== id))
    showToast(`Appeal ${labels[decision].toLowerCase()}.`)
  }

  return (
    <AdminShell title={<>Moderation</>}>
      <div className={styles.tabs}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
            {key === 'queue' && queue.length > 0 && ` (${queue.length})`}
            {key === 'appeals' && appeals.length > 0 && ` (${appeals.length})`}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <>
          <ActionConfirm
            open={!!pending}
            action={pending?.action ?? ''}
            target={pending?.target ?? ''}
            onConfirm={handleConfirm}
            onCancel={() => setPending(null)}
          />
          {queue.length === 0 ? (
            <EmptyState
              compact
              title="Queue is clear"
              description="No open reports — nice work."
            />
          ) : (
            <div className={styles.queueList}>
              {queue.map((report, i) => (
                <FadeIn key={report.id} delay={Math.min(i, 8) * 55}>
                  <ReportCard report={report} onResolve={handleResolveReport} />
                </FadeIn>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'appeals' && (
        <>
          {appeals.length === 0 ? (
            <EmptyState
              compact
              title="No open appeals"
              description="All appeals have been resolved."
            />
          ) : (
            <div>
              {appeals.map((appeal, i) => (
                <FadeIn key={appeal.id} delay={Math.min(i, 8) * 55}>
                  <AppealCard appeal={appeal} onResolve={handleResolveAppeal} />
                </FadeIn>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'log' && (
        <>
          {ACTION_LOG.length === 0 ? (
            <EmptyState compact title="No actions logged yet" description="" />
          ) : (
            <ActionLogTable rows={ACTION_LOG} />
          )}
        </>
      )}
    </AdminShell>
  )
}
