import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useProfile } from '../../app/providers/ProfileProvider'
import { useAuth } from '../../app/providers/authContext'
import { currentUserSlug } from './data/memberProfiles'
import { useMemberProfile } from './api/useMemberProfile'
import { ProfileHero, ProfileContent } from './ProfileSections'
import { EditableProfileHero } from './EditableProfileHero'
import { ProfileEditBar } from './ProfileEditBar'
import styles from './ProfilePage.module.css'
import editStyles from './ProfileEdit.module.css'

export function ProfilePage() {
  const { slug } = useParams()
  const { profile: liveProfile, isEditing, startEditing } = useProfile()
  const { user } = useAuth()
  const [previewing, setPreviewing] = useState(false)

  const selfSlug = user?.profile.slug ?? currentUserSlug
  const isSelf = !slug || slug === selfSlug

  const { data, isLoading } = useMemberProfile(isSelf ? undefined : slug)
  const otherMember = data?.member ?? null
  const limited = data?.limited ?? false

  const profile = isSelf ? liveProfile : otherMember

  const selfView = isSelf && !previewing

  if (!isSelf && isLoading) {
    return (
      <PageShell>
        <div className="wrap" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--ink)' }}>
          Loading profile…
        </div>
      </PageShell>
    )
  }

  if (!isSelf && !otherMember) {
    return (
      <PageShell>
        <div className="wrap" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink)' }}>This profile isn&apos;t available.</p>
          <Button to={routes.members} variant="ghost">Back to the room</Button>
        </div>
      </PageShell>
    )
  }

  // At this point: isSelf → profile = liveProfile (always non-null from ProfileProvider);
  // !isSelf → otherMember is non-null (guarded by the not-found early-return above).
  // limited: adapter already zeros out bio/work/openTo; ProfileHero/ProfileContent don't
  // accept a `limited` prop, so we rely on the sparse fields the adapter returns.
  void limited
  // profile is non-null here by the invariant above; assert to satisfy ProfileHero/ProfileContent.
  const resolvedProfile = profile!

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
          profile={resolvedProfile}
          asVisitor={isSelf && previewing}
          onEdit={startEditing}
          onPreview={() => setPreviewing(true)}
        />
      )}
      <ProfileContent profile={resolvedProfile} isSelf={selfView} />

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
