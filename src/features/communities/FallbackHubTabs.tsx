import { useEffect, useState } from 'react'
import { FadeIn, Tabs } from '../../shared/components/ui'
import type { CommunityDetail, Person, Thread as ThreadData } from './communityDetails'
import { AboutTab, ForumTab, MembersTab } from './CommunityTabs'
import styles from './CommunityDetailPage.module.css'

type Tab = 'about' | 'members' | 'forum'

/**
 * The lighter three-tab layout for non-flagship communities (those without
 * enriched "living" data). Owns its own loading state so the effect never runs
 * on the flagship path.
 */
export function FallbackHubTabs({
  detail,
  members,
  hasCount,
  memberNum,
  threads,
}: {
  detail: CommunityDetail
  members: Person[]
  hasCount: boolean
  memberNum: number
  threads: ThreadData[]
}) {
  const [tab, setTab] = useState<Tab>('about')

  // Simulate a short fetch when opening a data-heavy tab so its grid/threads
  // can skeleton then fade in (the About tab is static — no load needed).
  const [tabLoading, setTabLoading] = useState(false)
  useEffect(() => {
    if (tab === 'about') {
      setTabLoading(false)
      return
    }
    setTabLoading(true)
    const t = setTimeout(() => setTabLoading(false), 500)
    return () => clearTimeout(t)
  }, [tab])

  return (
    <div>
      <Tabs
        className={styles.tabs}
        variant="underline"
        tabs={[
          { id: 'about', label: 'About' },
          { id: 'members', label: 'Members', count: hasCount ? memberNum : undefined },
          { id: 'forum', label: 'Forum', count: threads.length },
        ]}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <FadeIn key={tab}>
        {tab === 'about' && <AboutTab detail={detail} />}
        {tab === 'members' && <MembersTab members={members} hasCount={hasCount} memberNum={memberNum} loading={tabLoading} />}
        {tab === 'forum' && <ForumTab threads={threads} loading={tabLoading} />}
      </FadeIn>
    </div>
  )
}
