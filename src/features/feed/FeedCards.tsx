import { Link } from 'react-router-dom'
import { Avatar, AvatarStack } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import styles from './FeedPage.module.css'

export function GatheringCard() {
  return (
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
            <AvatarStack size={24} avatars={[
              { initials: 'AK', tint: 'jade' },
              { initials: 'JP', tint: 'coral' },
              { initials: 'TM', tint: 'plum' },
            ]} />
            <span className={styles.attLabel}>+9 going</span>
          </div>
          <span className={styles.goingChip}>✓ You're going</span>
        </div>
      </div>
    </article>
  )
}

export function NewMemberCard() {
  const { showToast } = useToast()
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.tag}><span className={styles.dot} /> New member</div>
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
            <button className={styles.btnOutline} onClick={() => showToast('Request sent to Kai', 'success')}>Connect</button>
            <Link to="/profile/kai" className={styles.linkBtn}>View profile →</Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function PostCard() {
  const { showToast } = useToast()
  return (
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
        <button className={styles.postAction} onClick={() => showToast('Replied', 'success')}>↩ Reply · 4</button>
        <button className={styles.postAction} onClick={() => showToast('Post saved', 'success')}>⚑ Save</button>
      </div>
    </article>
  )
}

export function SavedArticleCard() {
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.savedEyebrow}>From your saves</div>
      <div className={styles.savedTitle}>The Quiet Politics of Chosen Family</div>
      <div className={styles.savedSource}>QueerPulse Magazine · Issue 17 · 6 min read</div>
      <Link className={styles.savedLink} to={routes.article}>Continue reading →</Link>
    </article>
  )
}

export function RecapCard() {
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.recapEyebrow}>Gathering recap</div>
      <div className={styles.savedTitle}>Pride Brunch — June Edition</div>
      <div className={styles.savedSource}>You attended · 3 days ago · 38 people were there</div>
      <Link className={styles.savedLink} to={routes.gatheringRecap}>Read the recap →</Link>
    </article>
  )
}
