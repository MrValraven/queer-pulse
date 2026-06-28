import { FadeIn } from '../../shared/components/ui'
import {
  ReportCard,
  BulkBar,
  EmergencyBand,
  SectionLabel,
  CaughtUpPanel,
  AppealCard,
  ResolvedRow,
} from './AdminModerationCards'
import { RESOLVED } from './adminModeration.data'
import styles from './AdminModerationPage.module.css'
import type { useModerationQueue } from './useModerationQueue'

type Queue = ReturnType<typeof useModerationQueue>

const EMERGENCY_SUB =
  '· outing & doxxing are treated as urgent harm, on a 1-hour clock. Handle these before anything else.'

export function OpenPane({ q }: { q: Queue }) {
  const { open, visible, emergencies, others, picked, leaving, oldest } = q

  const renderReport = (r: (typeof open)[number], i: number) => (
    <FadeIn key={r.id} delay={Math.min(i, 6) * 55}>
      <ReportCard
        report={r}
        leaving={leaving.has(r.id)}
        selected={picked.has(r.id)}
        onToggle={q.togglePick}
        onOpen={q.openReport}
      />
    </FadeIn>
  )

  if (open.length === 0) {
    return (
      <div className={styles.pane}>
        <FadeIn>
          <CaughtUpPanel
            onBack={() => q.showToast('Heading back to the overview.', 'info')}
            onReplay={q.replayOpen}
          />
        </FadeIn>
      </div>
    )
  }

  return (
    <div className={styles.pane}>
      {picked.size > 0 && (
        <BulkBar
          count={picked.size}
          onDismiss={() => q.bulkAct('dismissed')}
          onSpam={() => q.bulkAct('removed as spam')}
          onReassign={() => q.bulkAct('reassigned')}
          onCancel={q.clearPicked}
        />
      )}

      {emergencies.length > 0 && (
        <FadeIn>
          <EmergencyBand count={emergencies.length} sub={EMERGENCY_SUB}>
            {emergencies.map((r, i) => renderReport(r, i))}
          </EmergencyBand>
        </FadeIn>
      )}

      {others.length > 0 && (
        <>
          <SectionLabel>Everything else</SectionLabel>
          {oldest && (
            <p className={styles.countNote}>
              Showing {visible.length} open {visible.length === 1 ? 'report' : 'reports'} · oldest{' '}
              {oldest}
            </p>
          )}
          <div className={styles.list}>{others.map((r, i) => renderReport(r, i))}</div>
        </>
      )}

      {visible.length === 0 && (
        <p className={styles.filterEmpty}>
          No open reports match this filter. Try “All severities”.
        </p>
      )}
    </div>
  )
}

export function AppealsPane({ q }: { q: Queue }) {
  const { appeals, leaving } = q

  if (appeals.length === 0) {
    return (
      <div className={styles.pane}>
        <FadeIn>
          <CaughtUpPanel
            onBack={() => q.showToast('Heading back to the overview.', 'info')}
            onReplay={q.resetAppeals}
          />
        </FadeIn>
      </div>
    )
  }

  return (
    <div className={styles.pane}>
      <p className={styles.appealsIntro}>
        An appeal is a member asking you to look again. Read the original decision, hear them out,
        then <em>uphold or overturn</em> — with a reason of your own. Overturning a
        colleague&rsquo;s call is normal and healthy.
      </p>
      <div className={styles.list}>
        {appeals.map((a, i) => (
          <FadeIn key={a.id} delay={Math.min(i, 6) * 55}>
            <AppealCard appeal={a} leaving={leaving.has(a.id)} onOpen={q.setAppeal} />
          </FadeIn>
        ))}
      </div>
    </div>
  )
}

export function ResolvedPane() {
  return (
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
  )
}
