import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiUserX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/SocialProvider";
import { currentUserSlug } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { ProfileHero, ProfileContent } from "./ProfileSections";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import { PlacesSection } from "./PlacesSection";
import { PublicProfileControl } from "./PublicProfileControl";
import { EditableProfileHero } from "./EditableProfileHero";
import { ProfileEditBar } from "./ProfileEditBar";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

export function ProfilePage() {
  const { t } = useTranslation();
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

  if (!isSelf && isLoading) {
    return (
      <PageShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>{t("members:profile.loading")}</span>
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
            title={t("members:profile.blocked.title")}
            description={t("members:profile.blocked.description")}
            action={{
              label: t("members:profile.blocked.manageAction"),
              to: routes.connections,
            }}
            secondaryAction={{
              label: t("members:profile.goBack"),
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
            title={t("members:profile.notFound.title")}
            description={t("members:profile.notFound.description")}
            action={{
              label: t("members:profile.notFound.backAction"),
              to: routes.members,
            }}
            secondaryAction={{
              label: t("members:profile.goBack"),
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

      {/* "Also as…" — the owner's linked + published personas. Public viewers see
          only linked personas (the hook enforces this); self view adds a manage
          link and a create prompt when empty. Preview counts as a public view. */}
      <ProfileSubprofilesSection
        ownerSlug={isSelf ? selfSlug : (slug ?? "")}
        isSelf={selfView}
      />

      {selfView && !isEditing && <PublicProfileControl />}

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
