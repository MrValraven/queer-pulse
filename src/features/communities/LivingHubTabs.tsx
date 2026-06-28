import { useState } from 'react'
import { FadeIn } from '../../shared/components/ui'
import type { Community } from '../homepage/data/types'
import type { CommunityDetail, Thread as ThreadData } from './communityDetails'
import type { LivingCommunity } from './community.model'
import type { CommunityRole } from './membership.types'
import { PulseTab } from './PulseTab'
import { DiscussionTab } from './DiscussionTab'
import { RosterTab } from './RosterTab'
import { EventsTab } from './EventsTab'
import { AboutResourcesTab } from './AboutResourcesTab'
import { ModToolsTab } from './ModToolsTab'
import styles from './CommunityDetailPage.module.css'

type Tab = 'pulse' | 'discussion' | 'members' | 'events' | 'about' | 'modtools'

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: 'pulse', label: 'Pulse' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'members', label: 'Members' },
  { id: 'events', label: 'Events' },
  { id: 'about', label: 'About' },
]

export function LivingHubTabs({
  community,
  info,
  living,
  threads,
  isMember,
  role,
}: {
  community: Community
  info: CommunityDetail
  living: LivingCommunity
  threads: ThreadData[]
  isMember: boolean
  role: CommunityRole | null
}) {
  const [tab, setTab] = useState<Tab>('pulse')

  const isMod = role === 'owner' || role === 'mod'
  const tabs = isMod ? [...BASE_TABS, { id: 'modtools' as Tab, label: 'Mod tools' }] : BASE_TABS
  // If a mod opens Mod tools then leaves (role drops), fall back to Pulse.
  const active: Tab = tab === 'modtools' && !isMod ? 'pulse' : tab

  const count: Partial<Record<Tab, number>> = {
    pulse: living.pinned.length + living.pulse.length,
    discussion: threads.length,
    members: living.stats.members,
    events: living.events.filter((e) => !e.past).length,
    modtools: (living.joinRequests?.length ?? 0) + (living.reports?.length ?? 0),
  }

  return (
    <div>
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={[styles.tab, active === t.id && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {count[t.id] != null && <span className={styles.tabCount}>{count[t.id]}</span>}
          </button>
        ))}
      </div>

      <FadeIn key={active}>
        {active === 'pulse' && <PulseTab community={living} name={community.name} isMember={isMember} />}
        {active === 'discussion' && <DiscussionTab threads={threads} />}
        {active === 'members' && <RosterTab roster={living.roster} total={living.stats.members} slug={living.slug} />}
        {active === 'events' && <EventsTab events={living.events} />}
        {active === 'about' && <AboutResourcesTab info={info} living={living} />}
        {active === 'modtools' && <ModToolsTab living={living} />}
      </FadeIn>
    </div>
  )
}
