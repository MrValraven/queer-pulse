import { useEffect, useState } from 'react'
import { FadeIn } from '../../shared/components/ui'
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
      <div className={styles.tabs}>
        <button type="button" className={[styles.tab, tab === 'about' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('about')}>
          About
        </button>
        <button type="button" className={[styles.tab, tab === 'members' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('members')}>
          Members {hasCount && <span className={styles.tabCount}>{memberNum}</span>}
        </button>
        <button type="button" className={[styles.tab, tab === 'forum' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('forum')}>
          Forum <span className={styles.tabCount}>{threads.length}</span>
        </button>
      </div>

      <FadeIn key={tab}>
        {tab === 'about' && <AboutTab detail={detail} />}
        {tab === 'members' && <MembersTab members={members} hasCount={hasCount} memberNum={memberNum} loading={tabLoading} />}
        {tab === 'forum' && <ForumTab threads={threads} loading={tabLoading} />}
      </FadeIn>
    </div>
  )
}
