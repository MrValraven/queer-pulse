import { Link } from 'react-router-dom'
import { Avatar, AvatarStack } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import { routes } from '../../app/routeMap'
import { gatheringPath } from '../gatherings/data'
import { NEW_THIS_WEEK } from './feed.data'
import styles from './FeedPage.module.css'

export function FeedSidebar() {
  const { openConnect } = useConnect()
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Upcoming</div>
        <Link to={gatheringPath('queer-night-swim')} className={styles.upcomingRow}>
          <span className={styles.datePill}>22 Jun</span>
          <div>
            <div className={styles.upName}>Queer Night Swim</div>
            <div className={styles.upVenue}>Piscina Municipal</div>
          </div>
        </Link>
        <Link to={gatheringPath('queer-book-club')} className={styles.upcomingRow}>
          <span className={styles.datePill}>19 Jul</span>
          <div>
            <div className={styles.upName}>Queer Book Club</div>
            <div className={styles.upVenue}>LX Factory</div>
          </div>
        </Link>
        <Link to={routes.calendar} className={styles.sbLink}>See full calendar →</Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>New this week</div>
        {NEW_THIS_WEEK.map((person) => (
          <div key={person.name} className={styles.sbMemberRow}>
            <Link to={`/members/${person.slug}`} className={styles.sbMemberLink}>
              <Avatar initials={person.initials} tint={person.tint} src={person.photo} size={30} />
              <span className={styles.sbMemberName}>{person.name}</span>
            </Link>
            <button className={styles.linkBtn} onClick={() => openConnect(person.slug)}>Connect</button>
          </div>
        ))}
        <Link to={routes.members} className={styles.sbLink}>Browse all members →</Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Your connections</div>
        <div className={styles.connWidget}>
          <AvatarStack size={28} avatars={[
            { initials: 'SR', tint: 'jade' },
            { initials: 'AK', tint: 'coral' },
            { initials: 'JP', tint: 'plum' },
            { initials: 'TM', tint: 'jade' },
            { initials: 'MF', tint: 'coral' },
            { initials: 'KL', tint: 'plum' },
          ]} />
          <div>
            <div className={styles.connCount}>42 connections</div>
            <Link to={routes.connections} style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 600 }}>Manage →</Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
