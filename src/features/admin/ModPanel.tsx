import { useState } from 'react'
import { EmptyState } from '../../shared/components/ui'
import { LIVING } from '../communities/livingCommunities.data'
import { RequestsTab, ReportsTab, MembersTab, SettingsTab } from './ModPanelTabs'
import styles from './ModPanel.module.css'

const TABS = [
  ['requests', 'Requests'],
  ['reports', 'Reports'],
  ['members', 'Members'],
  ['settings', 'Settings'],
] as const

export function ModPanel({ slug }: { slug: string }) {
  const living = LIVING[slug]
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('requests')

  if (!living) {
    return (
      <EmptyState
        title="Community not found"
        description="We couldn't find that community. It may have been archived."
      />
    )
  }

  return (
    <div>
      <div className={styles.tabs}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={[styles.tab, tab === id && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'requests' && <RequestsTab living={living} />}
      {tab === 'reports' && <ReportsTab living={living} />}
      {tab === 'members' && <MembersTab living={living} />}
      {tab === 'settings' && <SettingsTab living={living} />}
    </div>
  )
}
