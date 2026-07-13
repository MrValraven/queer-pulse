import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiUserX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Spinner } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/SocialProvider";
import { currentUserSlug } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { ProfileHero, ProfileContent } from "./ProfileSections";
import { MyPlacesSection } from "./MyPlacesSection";
import { PublicProfileControl } from "./PublicProfileControl";
import { EditableProfileHero } from "./EditableProfileHero";
import { ProfileEditBar } from "./ProfileEditBar";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

export function ProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    profile: liveProfile,
    isEditing,
    startEditing,
    draft,
    updateDraft,
  } = useProfile();
  const { user } = useAuth();
  const { isBlocked } = useSocial();
  const [previewing, setPreviewing] = useState(false);

  const selfSlug = user?.profile.slug ?? currentUserSlug;
  const isSelf = !slug || slug === selfSlug;
  // A blocked member's profile is walled off. (The blocked-by direction is
  // enforced server-side in live mode: the fetch 403s → the not-found wall.)
  const blocked = !isSelf && !!slug && isBlocked(slug);

  const { data, isLoading } = useMemberProfile(isSelf ? undefined : slug);
  const otherMember = data?.member ?? null;
  const limited = data?.limited ?? false;

  const profile = isSelf ? liveProfile : otherMember;

  const selfView = isSelf && !previewing;

  if (!isSelf && isLoading) {
    return (
      <PageShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>Loading profile…</span>
        </div>
      </PageShell>
    );
  }

  if (blocked) {
    return (
      <PageShell>
        <div className={styles.stateWrap}>
          <EmptyState
            className={styles.stateEmpty}
            icon={<FiUserX />}
            title="This profile isn't available"
            description="You've blocked this member, so their profile is hidden. You can unblock them from your connections at any time."
            action={{ label: "Manage blocked members", to: routes.connections }}
            secondaryAction={{
              label: "← Go back",
              onClick: () => navigate(-1),
            }}
          />
        </div>
      </PageShell>
    );
  }

  if (!isSelf && !otherMember) {
    return (
      <PageShell>
        <div className={styles.stateWrap}>
          <EmptyState
            className={styles.stateEmpty}
            icon={<FiUserX />}
            title="This profile isn't here"
            description="It may have been set to private, the member might have left, or this link could be out of date. Nothing's wrong on your end."
            action={{ label: "Back to Members", to: routes.members }}
            secondaryAction={{
              label: "← Go back",
              onClick: () => navigate(-1),
            }}
          />
        </div>
      </PageShell>
    );
  }

  // At this point: isSelf → profile = liveProfile (always non-null from ProfileProvider);
  // !isSelf → otherMember is non-null (guarded by the not-found early-return above).
  // limited: adapter already zeros out bio/work/openTo; ProfileHero/ProfileContent don't
  // accept a `limited` prop, so we rely on the sparse fields the adapter returns.
  void limited;
  // profile is non-null here by the invariant above; assert to satisfy ProfileHero/ProfileContent.
  const resolvedProfile = profile!;

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
          self={isSelf}
          asVisitor={isSelf && previewing}
          onEdit={startEditing}
          onPreview={() => setPreviewing(true)}
        />
      )}
      <ProfileContent
        profile={resolvedProfile}
        isSelf={selfView}
        workEdit={
          selfView && isEditing
            ? {
                work: draft.work,
                onChange: (work) => updateDraft({ work }),
              }
            : undefined
        }
      />

      {selfView && !isEditing && <PublicProfileControl />}

      {isSelf && <MyPlacesSection memberSlug={selfSlug} />}

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
  );
}
