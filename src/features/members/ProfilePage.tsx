import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useProfile } from '../../app/providers/ProfileProvider'
import { currentUserSlug, memberProfiles } from './data/memberProfiles'
import { ProfileHero, ProfileContent } from './ProfileSections'
import { EditableProfileHero } from './EditableProfileHero'
import { ProfileEditBar } from './ProfileEditBar'
import styles from './ProfilePage.module.css'
import editStyles from './ProfileEdit.module.css'

export function ProfilePage() {
  const { slug } = useParams()
  const { profile: liveProfile, isEditing, startEditing } = useProfile()
  const [previewing, setPreviewing] = useState(false)

  // Your own profile is /account/profile (no slug) or /members/<your-slug>.
  const isSelf = !slug || slug === currentUserSlug
  const profile = isSelf
    ? liveProfile
    : memberProfiles[slug] || memberProfiles[currentUserSlug]

  const selfView = isSelf && !previewing

  return (
    <PageShell>
      <div className={`${styles.backBar} wrap`}>
        <Link to={routes.members} className={styles.backLink}>
          ← Back to the room
        </Link>
      </div>

      {selfView && isEditing ? (
        <EditableProfileHero />
      ) : (
        <ProfileHero
          profile={profile}
          asVisitor={isSelf && previewing}
          onEdit={startEditing}
          onPreview={() => setPreviewing(true)}
        />
      )}
      <ProfileContent profile={profile} isSelf={selfView} />

      {selfView && <ProfileEditBar />}

      {isSelf && previewing && (
        <div className={editStyles.previewBar}>
          <span className={editStyles.previewText}>
            You’re previewing your profile as a <strong>visitor</strong>.
          </span>
          <Button variant="ghost-dark" onClick={() => setPreviewing(false)}>
            Exit preview
          </Button>
        </div>
      )}
    </PageShell>
  )
}
