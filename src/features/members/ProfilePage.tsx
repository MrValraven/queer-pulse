import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { defaultProfileSlug, memberProfiles } from './data/memberProfiles'
import { ProfileHero, ProfileContent } from './ProfileSections'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { slug } = useParams()
  const profile =
    (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]

  return (
    <PageShell>
      <div className={`${styles.backBar} wrap`}>
        <Link to="/members" className={styles.backLink}>
          ← Back to the room
        </Link>
      </div>

      <ProfileHero profile={profile} />
      <ProfileContent profile={profile} isSelf={!slug} />
    </PageShell>
  )
}
