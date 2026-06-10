import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Avatar, AvatarStack, Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { linkToPath } from '../../app/routeMap'
import styles from './FeedPage.module.css'

const TABS = ['All', 'Gatherings', 'People', 'Posts'] as const

const newThisWeek = [
  { initials: 'KL', tint: 'plum', name: 'Kai Larsson', slug: 'kai' },
  { initials: 'BK', tint: 'jade', name: 'Bilal Kaya', slug: 'bilal' },
  { initials: 'IF', tint: 'coral', name: 'Ines Fonseca', slug: 'ines' },
  { initials: 'DO', tint: 'plum', name: 'Daniel Oliveira', slug: 'daniel' },
] as const

export function FeedPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All')

  return (
    <AppShell unreadCount={3}>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.greetingRow}>
            <div>
              <div className={styles.greeting}>
                Good morning, <em>Sofia</em>
              </div>
              <div className={styles.greetingDate}>Saturday · Lisbon · 21 June 2026</div>
            </div>
            <Link to="/messages" className={styles.msgChip}>
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M1 2.5h11v7H1zM1 2.5l5.5 4 5.5-4" stroke="var(--jade)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              2 new messages
            </Link>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={styles.tabs}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={[styles.tab, activeTab === tab && styles.tabActive]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={styles.list}>
                {/* Gathering */}
                <article className={styles.card}>
                  <div className={styles.accent} style={{ background: 'var(--jade)' }} />
                  <div className={styles.pad}>
                    <div className={styles.eyebrow} style={{ color: 'var(--jade)' }}>
                      <span className={styles.dot} style={{ background: 'var(--jade)' }} />
                      Upcoming · 5 days
                    </div>
                    <div className={styles.gcTitle}>Queer Book Club — July</div>
                    <div className={styles.gcMeta}>
                      <span>Sat 19 July · 18:00–20:00</span>
                      <span>LX Factory, Alcântara, Lisbon</span>
                    </div>
                    <div className={styles.gcFooter}>
                      <div className={styles.attStack}>
                        <AvatarStack
                          size={24}
                          avatars={[
                            { initials: 'AK', tint: 'jade' },
                            { initials: 'JP', tint: 'coral' },
                            { initials: 'TM', tint: 'plum' },
                          ]}
                        />
                        <span className={styles.attLabel}>+9 going</span>
                      </div>
                      <span className={styles.goingChip}>✓ You're going</span>
                    </div>
                  </div>
                </article>

                {/* New member */}
                <article className={`${styles.card} ${styles.pad}`}>
                  <div className={styles.tag}>
                    <span className={styles.dot} /> New member
                  </div>
                  <div className={styles.nmRow}>
                    <Avatar initials="KL" tint="plum" size={46} />
                    <div className={styles.nmInfo}>
                      <div className={styles.nmName}>Kai Larsson</div>
                      <div className={styles.nmMeta}>they/them · Lisbon · Joined today</div>
                      <div className={styles.nmBio}>
                        Filmmaker making a documentary about queer nightlife in southern Europe.
                        Looking for interviewees and collaborators.
                      </div>
                      <div className={styles.nmChips}>
                        <span className={styles.nmChip}>Film</span>
                        <span className={styles.nmChip}>Queer Lisbon</span>
                      </div>
                      <div className={styles.nmActions}>
                        <button
                          className={styles.btnOutline}
                          onClick={() => showToast('Request sent to Kai', 'success')}
                        >
                          Connect
                        </button>
                        <Link to="/profile/kai" className={styles.linkBtn}>
                          View profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Post */}
                <article className={`${styles.card} ${styles.pad}`}>
                  <div className={styles.postAuthor}>
                    <Avatar initials="AK" tint="coral" size={36} />
                    <div>
                      <div className={styles.paName}>Anika Kovač</div>
                      <div className={styles.paTime}>2 hours ago · Trans &amp; Non-Binary Network</div>
                    </div>
                  </div>
                  <div className={styles.postBody}>
                    Anyone have recommendations for a queer-friendly GP in Lisbon? Preferably someone
                    familiar with trans healthcare — I'm tired of having to explain myself from
                    scratch every visit. Grateful for any leads, DM or reply here.
                  </div>
                  <div className={styles.postFooter}>
                    <button className={styles.postAction} onClick={() => showToast('Replied', 'success')}>
                      ↩ Reply · 4
                    </button>
                    <button className={styles.postAction} onClick={() => showToast('Post saved', 'success')}>
                      ⚑ Save
                    </button>
                  </div>
                </article>

                {/* Saved */}
                <article className={`${styles.card} ${styles.pad}`}>
                  <div className={styles.savedEyebrow}>From your saves</div>
                  <div className={styles.savedTitle}>The Quiet Politics of Chosen Family</div>
                  <div className={styles.savedSource}>QueerPulse Magazine · Issue 17 · 6 min read</div>
                  <Link className={styles.savedLink} to={linkToPath('QueerPulse Article.html')}>
                    Continue reading →
                  </Link>
                </article>

                {/* Recap */}
                <article className={`${styles.card} ${styles.pad}`}>
                  <div className={styles.recapEyebrow}>Gathering recap</div>
                  <div className={styles.savedTitle}>Pride Brunch — June Edition</div>
                  <div className={styles.savedSource}>You attended · 3 days ago · 38 people were there</div>
                  <Link className={styles.savedLink} to={linkToPath('QueerPulse Gathering Recap.html')}>
                    Read the recap →
                  </Link>
                </article>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbTitle}>Upcoming</div>
                <div className={styles.upcomingRow}>
                  <span className={styles.datePill}>22 Jun</span>
                  <div>
                    <div className={styles.upName}>Queer Night Swim</div>
                    <div className={styles.upVenue}>Piscina Municipal</div>
                  </div>
                </div>
                <div className={styles.upcomingRow}>
                  <span className={styles.datePill}>19 Jul</span>
                  <div>
                    <div className={styles.upName}>Queer Book Club</div>
                    <div className={styles.upVenue}>LX Factory</div>
                  </div>
                </div>
                <Link to={linkToPath('QueerPulse Calendar.html')} className={styles.sbLink}>
                  See full calendar →
                </Link>
              </div>

              <div className={styles.sbCard}>
                <div className={styles.sbTitle}>New this week</div>
                {newThisWeek.map((person) => (
                  <div key={person.name} className={styles.sbMemberRow}>
                    <Avatar initials={person.initials} tint={person.tint} size={30} />
                    <span className={styles.sbMemberName}>{person.name}</span>
                    <button
                      className={styles.linkBtn}
                      onClick={() => showToast('Request sent', 'success')}
                    >
                      Connect
                    </button>
                  </div>
                ))}
                <Link to="/members" className={styles.sbLink}>
                  Browse all members →
                </Link>
              </div>

              <div className={styles.sbCard}>
                <div className={styles.sbTitle}>Your connections</div>
                <div className={styles.connWidget}>
                  <AvatarStack
                    size={28}
                    avatars={[
                      { initials: 'SR', tint: 'jade' },
                      { initials: 'AK', tint: 'coral' },
                      { initials: 'JP', tint: 'plum' },
                      { initials: 'TM', tint: 'jade' },
                      { initials: 'MF', tint: 'coral' },
                      { initials: 'KL', tint: 'plum' },
                    ]}
                  />
                  <div>
                    <div className={styles.connCount}>42 connections</div>
                    <Link to="/profile" style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 600 }}>
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
