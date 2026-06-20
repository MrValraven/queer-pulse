import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Avatar, Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { directoryMembers, type ConnectState } from './data/membersDirectory'
import { ACTIVE_FILTERS } from './members.data'
import { MembersSidebar } from './MembersSidebar'
import styles from './MembersPage.module.css'

export function MembersPage() {
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [activeLocations, setActiveLocations] = useState<string[]>(['Lisbon'])
  const [connectStates, setConnectStates] = useState<Record<string, ConnectState>>(() =>
    Object.fromEntries(directoryMembers.map((m) => [m.slug, m.connectState])),
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return directoryMembers
    return directoryMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q)),
    )
  }, [query])

  function toggleLocation(loc: string) {
    setActiveLocations((current) =>
      current.includes(loc) ? current.filter((l) => l !== loc) : [...current, loc],
    )
  }

  function connect(slug: string, name: string) {
    setConnectStates((current) => ({ ...current, [slug]: 'pending' }))
    showToast(`Request sent to ${name.split(' ')[0]}`, 'success')
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.headerRow}>
              <div>
                <div className={styles.title}><em>Members</em></div>
                <div className={styles.sub}>482 members in Lisbon and beyond</div>
              </div>
              <select className={styles.sortSelect} defaultValue="Newest">
                <option>Newest</option>
                <option>Active recently</option>
                <option>A–Z</option>
              </select>
            </div>
          </div>

          <div className={styles.filterBar}>
            <span className={styles.filterCount}>{visible.length} matches</span>
            {ACTIVE_FILTERS.map((filter) => (
              <span key={filter} className={styles.filterChip}>
                {filter}
                <button className={styles.chipRemove} aria-label={`Remove ${filter}`}>×</button>
              </span>
            ))}
            <button className={styles.clearAll} onClick={() => setQuery('')}>Clear all</button>
          </div>

          <div className={styles.layout}>
            <MembersSidebar
              query={query}
              onQueryChange={setQuery}
              activeLocations={activeLocations}
              onToggleLocation={toggleLocation}
            />

            <div>
              <div className={styles.grid}>
                {visible.map((member) => {
                  const state = connectStates[member.slug]
                  return (
                    <article key={member.slug} className={styles.card}>
                      <div className={styles.cover} style={{ background: member.cover }} />
                      <div className={styles.avWrap}>
                        <Avatar className={styles.av} initials={member.initials} tint={member.tint} size={44} />
                      </div>
                      <div className={styles.body}>
                        <div className={styles.name}>{member.name}</div>
                        <div className={styles.pronouns}>{member.pronouns}</div>
                        <div className={styles.loc}>
                          {member.location} · Member since {member.since}
                        </div>
                        <p className={styles.bio}>{member.bio}</p>
                        <div className={styles.skills}>
                          {member.skills.map((skill) => (
                            <span key={skill} className={styles.skill}>{skill}</span>
                          ))}
                        </div>
                        <div className={styles.actions}>
                          {state === 'connected' ? (
                            <span className={`${styles.connect} ${styles.connected}`}>✓ Connected</span>
                          ) : state === 'pending' ? (
                            <span className={`${styles.connect} ${styles.pending}`}>Request sent</span>
                          ) : (
                            <button className={styles.connect} onClick={() => connect(member.slug, member.name)}>
                              Connect
                            </button>
                          )}
                          <Link to={`/members/${member.slug}`} className={styles.view}>View profile →</Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className={styles.loadMore}>
                <Button variant="ghost" onClick={() => showToast('Loading more members…', 'info')}>
                  Load more members
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
