import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import { currentUserSlug, memberProfiles } from './data/memberProfiles'
import { ProfileHero, ProfileContent } from './ProfileSections'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { slug } = useParams()
  const profile =
    (slug && memberProfiles[slug]) || memberProfiles[currentUserSlug]

  return (
    <PageShell>
      <div className={`${styles.backBar} wrap`}>
        <Link to={routes.members} className={styles.backLink}>
          ← Back to the room
        </Link>
      </div>

      <ProfileHero profile={profile} />
      <ProfileContent profile={profile} isSelf={!slug} />
    </PageShell>
  )
}
