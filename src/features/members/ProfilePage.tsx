import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/useProfile";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { currentUserSlug } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { ProfileHero, ProfileContent } from "./ProfileSections";
import { ProfileCommunitiesSection } from "./ProfileCommunitiesSection";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import { PlacesSection } from "./PlacesSection";
import { EditableProfileHero } from "./EditableProfileHero";
import { ProfileEditBar } from "./ProfileEditBar";
import { useProfileEditGuard } from "./useProfileEditGuard";
import {
  ProfileLoadingState,
  ProfileErrorState,
  ProfileBlockedState,
  ProfileNotFoundState,
} from "./ProfileStateScreens";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

export function ProfilePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const {
    profile: liveProfile,
    isEditing,
    startEditing,
    cancelEditing,
    draft,
    updateDraft,
    isDirty,
    isProfileLoading,
    isProfileError,
    retryProfile,
  } = useProfile();
  const { user } = useAuth();
  const { isBlocked } = useSocial();
  const [previewing, setPreviewing] = useState(false);
  // When entering edit mode from the "Add/Edit links" affordance, jump the editor
  // straight to the Links section instead of landing at the top of the form.
  const [focusLinks, setFocusLinks] = useState(false);

  function enterEdit(focus = false) {
    setFocusLinks(focus);
    startEditing();
  }

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

  useProfileEditGuard({ isEditing, isDirty, cancelEditing });

  if (isSelf && isProfileLoading) return <ProfileLoadingState />;
  if (isSelf && isProfileError) {
    return <ProfileErrorState onRetry={retryProfile} />;
  }
  if (!isSelf && isLoading) return <ProfileLoadingState />;
  if (blocked) return <ProfileBlockedState />;
  if (!isSelf && !otherMember) return <ProfileNotFoundState />;

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
          {t("members:profile.backToRoom")}
        </Link>
      </div>

      {selfView && isEditing ? (
        <EditableProfileHero focusLinks={focusLinks} />
      ) : (
        <ProfileHero
          profile={resolvedProfile}
          self={isSelf}
          asVisitor={isSelf && previewing}
          onEdit={() => enterEdit(false)}
          onEditLinks={() => enterEdit(true)}
          onPreview={() => {
            setPreviewing(true);
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {/* "Also as…" — the owner's linked + published personas, surfaced right
          after the hero as the second thing on the profile. Public viewers see
          only linked personas (the hook enforces this); self view adds a manage
          link and a create prompt when empty. Preview counts as a public view. */}
      <ProfileSubprofilesSection
        ownerSlug={isSelf ? selfSlug : (slug ?? "")}
        isSelf={selfView}
      />

      <ProfileContent
        profile={resolvedProfile}
        isSelf={selfView}
        edit={
          selfView && isEditing
            ? {
                work: draft.work,
                skills: draft.skills,
                groups: draft.groups,
                board: draft.board,
                update: (patch) => updateDraft(patch),
              }
            : undefined
        }
      />

      <ProfileCommunitiesSection
        isSelf={isSelf}
        previewing={previewing}
        otherMember={isSelf ? null : otherMember}
        firstName={resolvedProfile.first}
      />

      <PlacesSection
        memberSlug={isSelf ? selfSlug : (slug ?? "")}
        isSelf={selfView}
        firstName={resolvedProfile.first}
      />

      {selfView && <ProfileEditBar />}

      {isSelf && previewing && (
        <div className={editStyles.previewBar}>
          <span className={editStyles.previewText}>
            <Translation
              i18nKey="members:profile.previewBanner"
              components={{ strong: <strong /> }}
            />
          </span>
          <Button variant="ghost-dark" onClick={() => setPreviewing(false)}>
            {t("members:profile.exitPreview")}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
