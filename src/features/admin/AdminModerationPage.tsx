import { AdminShell } from '../../shared/components/layout/AdminShell'
import { FadeIn } from '../../shared/components/ui'
import { AdminPageHeader, AdminTabs } from './ui'
import { AdminReportDrawer } from './AdminReportDrawer'
import { AdminAppealDrawer } from './AdminAppealDrawer'
import { OpenPane, AppealsPane, ResolvedPane } from './AdminModerationPanes'
import { useModerationQueue, type TabId, type FilterId } from './useModerationQueue'
import styles from './AdminModerationPage.module.css'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All severities' },
  { id: 'emergencies', label: 'Emergencies' },
  { id: 'mine', label: 'Assigned to me' },
]

export function AdminModerationPage() {
  const q = useModerationQueue()
  const { tab, filter } = q

  return (
    <AdminShell title={<>Moderation · <em>triage</em></>}>
      <FadeIn>
        <AdminPageHeader
          eyebrow="Moderation queue"
          title={<>Two need you <em>first</em>.</>}
          sub="Reports are ordered by who's most at risk — not by what arrived first. Outing and doxxing always rise to the top, with a tighter 1-hour clock. Every action records a reason the member will read."
        />
      </FadeIn>

      <div className={styles.toolbar}>
        <AdminTabs
          tabs={[
            { id: 'open', label: 'Open', count: 23 },
            { id: 'appeals', label: 'Appeals', count: 3 },
            { id: 'resolved', label: 'Resolved' },
          ]}
          active={tab}
          onChange={(id) => q.setTab(id as TabId)}
        />
        {tab === 'open' && (
          <div className={styles.filters} role="group" aria-label="Filter reports">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                className={[styles.filter, filter === f.id && styles.filterOn]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => q.setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'open' && <OpenPane q={q} />}
      {tab === 'appeals' && <AppealsPane q={q} />}
      {tab === 'resolved' && <ResolvedPane />}

      {q.selected && (
        <AdminReportDrawer
          report={q.selected}
          onClose={() => q.setSelected(null)}
          onResolve={(id) => q.resolveReport(id)}
        />
      )}

      {q.appeal && (
        <AdminAppealDrawer
          appeal={q.appeal}
          onClose={() => q.setAppeal(null)}
          onResolve={q.recordAppeal}
        />
      )}
    </AdminShell>
  )
}
