import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { communities } from '../homepage/data/communities'
import { memberProfiles } from '../members/data/memberProfiles'
import { JoinModal } from './JoinModal'
import { getCommunityDetail, membersFor, type Thread as ThreadData, type Tint } from './communityDetails'
import { AboutTab, ForumTab, MembersTab } from './CommunityTabs'
import { CommunitySidebar } from './CommunitySidebar'
import styles from './CommunityDetailPage.module.css'

const HERO_AV: Record<Tint, { background: string; color: string }> = {
  coral: { background: 'rgba(232,119,90,.22)', color: 'var(--accent-soft)' },
  jade: { background: 'rgba(74,140,111,.22)', color: 'var(--jade-soft)' },
  plum: { background: 'rgba(247,243,238,.18)', color: 'rgba(247,243,238,.8)' },
}

type Tab = 'about' | 'members' | 'forum'

export function CommunityDetailPage() {
  const { slug } = useParams()
  const [tab, setTab] = useState<Tab>('about')
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  const community = communities.find((c) => c.slug === slug)
  const detail = getCommunityDetail(slug)
  if (!community || !detail) return <Navigate to={routes.communities} replace />

  const memberNum = parseInt(community.count, 10)
  const hasCount = !Number.isNaN(memberNum)
  const members = membersFor(slug!.length, 8)
  const heroAvatars = members.slice(0, 5)

  const welcome: ThreadData = {
    votes: 38,
    title: `Welcome, new members — introduce yourself`,
    author: detail.organiser,
    time: '2 weeks ago',
    replyCount: 18,
    post: `New to ${community.name}? Say hello here. Tell us your name, where you're from, and what brought you here. We read every one.`,
    replies: [
      { initials: members[6].initials, name: members[6].name, tint: members[6].tint, text: "Hello! Just moved to Lisbon and this is the first thing I've joined. Already feels like the right call." },
      { initials: members[4].initials, name: members[4].name, tint: members[4].tint, text: 'Welcome! Come to the next one — easiest way in is just to show up.' },
    ],
  }
  const threads = [detail.topicThread, welcome]
  const related = communities.filter((c) => c.slug !== slug && !c.privateBadge).slice(0, 3)

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <Link to={routes.communities} className={styles.breadcrumb}>
            ← Communities
          </Link>
          <div className={styles.typeBadge}>
            <span className={styles.dot} />
            {detail.badge}
          </div>
          <h1 className={styles.h1}>{community.name}</h1>
          <p className={styles.heroSub}>{community.description}</p>
          <div className={styles.heroMeta}>
            <span>{community.count}</span>
            <span className={styles.metaSep} />
            <span>{detail.founded}</span>
            <span className={styles.metaSep} />
            <span>{detail.cadence}</span>
          </div>
          <div className={styles.actRow}>
            <Button variant={joined ? 'jade' : 'primary'} onClick={() => (joined ? setJoined(false) : setJoining(true))}>
              {joined ? <><FiCheck /> Joined</> : community.privateBadge ? 'Request access' : 'Join community'}
            </Button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={styles.avStrip}>
                {heroAvatars.map((m, i) => {
                  const photo = m.slug ? memberProfiles[m.slug]?.photo : undefined
                  const inner = (
                    <>
                      <span className={styles.heroAvTip}>{m.name}</span>
                      <span className={styles.sav} style={HERO_AV[m.tint]}>
                        {photo ? <img src={photo} alt={m.name} /> : m.initials}
                      </span>
                    </>
                  )
                  return m.slug ? (
                    <Link
                      key={i}
                      to={`/members/${m.slug}`}
                      className={styles.heroAv}
                      style={{ zIndex: heroAvatars.length - i }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <span key={i} className={styles.heroAv} style={{ zIndex: heroAvatars.length - i }}>
                      {inner}
                    </span>
                  )
                })}
              </div>
              {hasCount && <span className={styles.stripNote}>and {memberNum - 5} more</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
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

              {tab === 'about' && <AboutTab detail={detail} />}
              {tab === 'members' && <MembersTab members={members} hasCount={hasCount} memberNum={memberNum} />}
              {tab === 'forum' && <ForumTab threads={threads} />}
            </div>

            <CommunitySidebar detail={detail} related={related} />
          </div>
        </div>
      </div>

      {joining && (
        <JoinModal
          community={{
            name: community.name,
            typeLabel: detail.badge,
            count: community.count,
            description: community.description,
            tags: detail.tags,
          }}
          onClose={() => setJoining(false)}
          onJoined={() => setJoined(true)}
        />
      )}
    </PageShell>
  )
}
