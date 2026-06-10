import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Avatar, Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { directoryMembers, type ConnectState } from './data/membersDirectory'
import styles from './MembersPage.module.css'

const PRONOUN_OPTIONS = ['he/him', 'she/her', 'they/them', 'she/they', 'he/they', 'any/all']
const LOCATIONS = ['Lisbon', 'Porto', 'Remote', 'Other']
const ACTIVE_FILTERS = ['she/her', 'Lisbon', 'Open to mentorship']

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
                <div className={styles.title}>
                  <em>Members</em>
                </div>
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
                <button className={styles.chipRemove} aria-label={`Remove ${filter}`}>
                  ×
                </button>
              </span>
            ))}
            <button className={styles.clearAll} onClick={() => setQuery('')}>
              Clear all
            </button>
          </div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.searchWrap}>
                <svg
                  className={styles.searchIcon}
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                  aria-hidden
                >
                  <circle cx={6.5} cy={6.5} r={5} stroke="currentColor" strokeWidth={1.5} />
                  <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
                <input
                  className={styles.search}
                  type="text"
                  placeholder="Search members…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <FilterSection label="Pronouns">
                {PRONOUN_OPTIONS.map((pronoun, index) => (
                  <label key={pronoun} className={styles.checkItem}>
                    <input type="checkbox" defaultChecked={index < 2} />
                    {pronoun}
                  </label>
                ))}
              </FilterSection>

              <FilterSection label="Location">
                <div className={styles.locChips}>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      className={[
                        styles.locChip,
                        activeLocations.includes(loc) && styles.locChipActive,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleLocation(loc)}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection label="Open to">
                {['Mentorship', 'Collaboration', 'Coffee chats', 'Hiring', 'Being hired'].map(
                  (item, index) => (
                    <label key={item} className={styles.checkItem}>
                      <input type="checkbox" defaultChecked={index === 0} />
                      {item}
                    </label>
                  ),
                )}
              </FilterSection>
            </aside>

            <div>
              <div className={styles.grid}>
                {visible.map((member) => {
                  const state = connectStates[member.slug]
                  return (
                    <article key={member.slug} className={styles.card}>
                      <div className={styles.cover} style={{ background: member.cover }} />
                      <div className={styles.avWrap}>
                        <Avatar
                          className={styles.av}
                          initials={member.initials}
                          tint={member.tint}
                          size={44}
                        />
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
                            <span key={skill} className={styles.skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className={styles.actions}>
                          {state === 'connected' ? (
                            <span className={`${styles.connect} ${styles.connected}`}>
                              ✓ Connected
                            </span>
                          ) : state === 'pending' ? (
                            <span className={`${styles.connect} ${styles.pending}`}>
                              Request sent
                            </span>
                          ) : (
                            <button
                              className={styles.connect}
                              onClick={() => connect(member.slug, member.name)}
                            >
                              Connect
                            </button>
                          )}
                          <Link to={`/profile/${member.slug}`} className={styles.view}>
                            View profile →
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  onClick={() => showToast('Loading more members…', 'info')}
                >
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

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={[styles.filterSection, collapsed && styles.collapsed].filter(Boolean).join(' ')}>
      <button className={styles.fsHead} onClick={() => setCollapsed((c) => !c)}>
        <span className={styles.fsLabel}>{label}</span>
        <span className={styles.fsChevron}>▾</span>
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  )
}
