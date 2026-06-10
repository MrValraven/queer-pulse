import { Link, useLocation } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button } from '../../shared/components/ui'
import { memberProfiles } from '../members/data/memberProfiles'
import { defaultGatheringSlug, gatheringDetails } from './data'

import styles from './GatheringPage.module.css'

export function GatheringPage() {
  const { hash } = useLocation()
  const slug = hash.replace('#', '') || defaultGatheringSlug
  const gathering = gatheringDetails[slug] ?? gatheringDetails[defaultGatheringSlug]
  const host = gathering.hostSlug ? memberProfiles[gathering.hostSlug] : null
  const spotsNum = parseInt(gathering.spots, 10)
  const connectTo = gathering.hostSlug ? `/connect/${gathering.hostSlug}` : '/connect'

  const others = Object.values(gatheringDetails).filter((g) => g.slug !== gathering.slug)

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.back}>
            <Link to="/calendar" className={styles.backLink}>
              ← Gatherings
            </Link>
          </div>

          <div className={styles.grid}>
            <div>
              <div className={styles.type}>{gathering.type}</div>
              <h1 className={styles.title}>{gathering.title}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.day} {gathering.month} 2026
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.hood}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  Hosted by {gathering.host}
                </span>
              </div>
              <p className={styles.body}>{gathering.body}</p>
              <div className={styles.cta}>
                <Button size="lg" to={connectTo}>
                  {gathering.cta} →
                </Button>
                <Button size="lg" variant="ghost" to="/calendar">
                  See all gatherings
                </Button>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.dateDisplay}>
                <div className={styles.dd}>{gathering.day}</div>
                <div className={styles.dm}>{gathering.month} 2026</div>
              </div>

              {Number.isFinite(spotsNum) ? (
                <div className={styles.spotsRow}>
                  <div className={styles.spotsNum}>{spotsNum}</div>
                  <div className={styles.spotsLbl}>
                    spots remaining
                    <br />
                    <span>Move quickly if this speaks to you</span>
                  </div>
                </div>
              ) : (
                <div className={styles.spotsRow}>
                  <div className={styles.hostName} style={{ color: 'var(--ink-60)' }}>
                    {gathering.spots}
                  </div>
                </div>
              )}

              <div className={styles.sh}>Hosted by</div>
              {host ? (
                <div className={styles.hostRow}>
                  <Avatar initials={host.initials} tint={host.tint} size={44} />
                  <div>
                    <div className={styles.hostName}>
                      <Link to={`/profile/${host.slug}`} style={{ color: 'var(--ink)' }}>
                        {host.first} {host.last}
                      </Link>
                    </div>
                    <div className={styles.hostRole}>{host.role.split('·')[0].trim()}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.hostRow}>
                  <div className={styles.hostName}>Hosted by QueerPulse</div>
                </div>
              )}

              <Button className={styles.fullBtn} to={connectTo}>
                {gathering.cta}
              </Button>
              <div className={styles.sidebarNote}>
                The location is shared with confirmed guests on the day of the event.
              </div>
            </aside>
          </div>

          <div className={styles.other}>
            <h2>
              More <em>gatherings</em>
            </h2>
            <div className={styles.cards}>
              {others.map((other) => (
                <Link key={other.slug} to={`/gathering#${other.slug}`} className={styles.card}>
                  <div className={styles.dateMini}>
                    <div className={styles.gd}>{other.day}</div>
                    <div className={styles.gm}>{other.month}</div>
                  </div>
                  <div>
                    <div className={styles.cardType}>{other.type}</div>
                    <h3 className={styles.cardTitle}>{other.title}</h3>
                    <div className={styles.cardHood}>
                      {other.hood} · {other.spots}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
