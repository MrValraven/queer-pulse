import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminPageHeader, AdminTabs } from './ui'
import {
  EMERGENCY_REPORTS,
  OTHER_REPORTS,
  APPEALS,
  RESOLVED,
  type ModReport,
} from './adminModeration.data'
import {
  ReportCard,
  EmergencyBand,
  SectionLabel,
  CaughtUpPanel,
  AppealCard,
  ResolvedRow,
} from './AdminModerationCards'
import { AdminReportDrawer } from './AdminReportDrawer'
import styles from './AdminModerationPage.module.css'

type TabId = 'open' | 'appeals' | 'resolved'

const FILTERS = [
  { id: 'all', label: 'All severities' },
  { id: 'emergencies', label: 'Emergencies' },
  { id: 'mine', label: 'My communities' },
] as const
type FilterId = (typeof FILTERS)[number]['id']

const MY_COMMUNITIES = new Set(['Queer Runners', 'Rainbow Parents'])

export function AdminModerationPage() {
  const [searchParams] = useSearchParams()
  const deepLink = searchParams.get('tab')
  const [tab, setTab] = useState<TabId>(
    deepLink === 'appeals' ? 'appeals' : deepLink === 'resolved' ? 'resolved' : 'open',
  )
  const [filter, setFilter] = useState<FilterId>(
    deepLink === 'emergencies' ? 'emergencies' : 'all',
  )
  const [open, setOpen] = useState<ModReport[]>([...EMERGENCY_REPORTS, ...OTHER_REPORTS])
  const [leaving, setLeaving] = useState<string | null>(null)
  const [selected, setSelected] = useState<ModReport | null>(null)
  const { showToast } = useToast()

  const handleReplay = () => {
    setLeaving(null)
    setOpen([...EMERGENCY_REPORTS, ...OTHER_REPORTS])
  }

  const matchesFilter = (r: ModReport) => {
    if (filter === 'emergencies') return r.severity === 'emergency'
    if (filter === 'mine') return !!r.community && MY_COMMUNITIES.has(r.community)
    return true
  }

  const visible = open.filter(matchesFilter)
  const emergencies = visible.filter((r) => r.severity === 'emergency')
  const others = visible.filter((r) => r.severity !== 'emergency')

  const handleResolve = (id: string) => {
    setLeaving(id)
    window.setTimeout(() => {
      setOpen((q) => q.filter((r) => r.id !== id))
      setLeaving(null)
    }, 340)
  }

  const openReport = (r: ModReport) => {
    if (!r.detail) {
      showToast('No detailed thread for this report yet — actioning from the queue.', 'info')
      handleResolve(r.id)
      return
    }
    setSelected(r)
  }

  const renderReport = (r: ModReport, i: number) => (
    <FadeIn key={r.id} delay={Math.min(i, 6) * 55}>
      <ReportCard report={r} leaving={leaving === r.id} onOpen={openReport} />
    </FadeIn>
  )

  return (
    <AdminShell title={<>Moderation · <em>triage</em></>}>
      <FadeIn>
        <AdminPageHeader
          eyebrow="Moderation queue"
          title={<>Two need you <em>first</em>.</>}
          sub="Reports are ordered by who's most at risk — not by what arrived first. Outing and doxxing always rise to the top. Every action you take is recorded with a reason, and the member is told what happened and why."
        />
      </FadeIn>

      <div className={styles.toolbar}>
        <AdminTabs
          tabs={[
            { id: 'open', label: 'Open', count: 23 },
            { id: 'appeals', label: 'Appeals', count: 4 },
            { id: 'resolved', label: 'Resolved' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
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
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Open queue ───────────────────────────────────────────────── */}
      {tab === 'open' && (
        <div className={styles.pane}>
          {open.length === 0 ? (
            <FadeIn>
              <CaughtUpPanel
                onBack={() => showToast('Heading back to the overview.', 'info')}
                onReplay={handleReplay}
              />
            </FadeIn>
          ) : (
            <>
              {emergencies.length > 0 && (
                <FadeIn>
                  <EmergencyBand count={emergencies.length}>
                    {emergencies.map((r, i) => renderReport(r, i))}
                  </EmergencyBand>
                </FadeIn>
              )}

              {others.length > 0 && (
                <>
                  <SectionLabel>Everything else</SectionLabel>
                  <div className={styles.list}>{others.map((r, i) => renderReport(r, i))}</div>
                </>
              )}

              {visible.length === 0 && (
                <p className={styles.filterEmpty}>
                  No open reports match this filter. Try “All severities”.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Appeals ──────────────────────────────────────────────────── */}
      {tab === 'appeals' && (
        <div className={styles.pane}>
          {APPEALS.map((a, i) => (
            <FadeIn key={a.id} delay={Math.min(i, 6) * 55}>
              <AppealCard appeal={a} />
            </FadeIn>
          ))}
        </div>
      )}

      {/* ── Resolved ─────────────────────────────────────────────────── */}
      {tab === 'resolved' && (
        <div className={styles.pane}>
          <SectionLabel>Recently resolved</SectionLabel>
          <div className={styles.list}>
            {RESOLVED.map((item, i) => (
              <FadeIn key={item.id} delay={Math.min(i, 6) * 55}>
                <ResolvedRow item={item} />
              </FadeIn>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <AdminReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onResolve={handleResolve}
        />
      )}
    </AdminShell>
  )
}
