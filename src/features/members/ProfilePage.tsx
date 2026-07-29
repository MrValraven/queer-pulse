import { useContext, useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  UNSAFE_NavigationContext,
} from "react-router-dom";
import { FiAlertTriangle, FiUserX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Spinner } from "../../shared/components/ui";
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

  // Block in-app navigation away from a dirty edit; confirm before discarding.
  // The app mounts a plain <BrowserRouter> (not a data router), so react-router's
  // useBlocker isn't available — instead we wrap the router's navigator so a
  // push/replace mid-edit prompts first. (Hard unloads are covered separately below.)
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const guardActive = isEditing && isDirty;
  useEffect(() => {
    if (!guardActive) return;
    // View push/replace as reassignable function properties (not the interface's
    // bound methods) so we can wrap then restore them — the cast also sidesteps
    // the unbound-method / readonly-assignment lint on those method signatures.
    const historyNavigator = navigator as unknown as {
      push: (...args: unknown[]) => void;
      replace: (...args: unknown[]) => void;
    };
    const originalPush = historyNavigator.push;
    const originalReplace = historyNavigator.replace;
    const confirmLeave = () => {
      if (!window.confirm(t("members:profileEdit.discardConfirm"))) return false;
      cancelEditing();
      return true;
    };
    // Intentionally wrap + later restore the router navigator. This mutates a
    // value from useContext, which react-hooks/immutability forbids — but that's
    // the whole technique: UNSAFE_NavigationContext is React Router's sanctioned
    // escape hatch for blocking navigation under a plain <BrowserRouter>, and the
    // compiler can't model the wrap/restore. Scope the disable to this region.
    /* eslint-disable react-hooks/immutability */
    historyNavigator.push = (...args) => {
      if (confirmLeave()) originalPush.apply(historyNavigator, args);
    };
    historyNavigator.replace = (...args) => {
      if (confirmLeave()) originalReplace.apply(historyNavigator, args);
    };
    return () => {
      historyNavigator.push = originalPush;
      historyNavigator.replace = originalReplace;
    };
    /* eslint-enable react-hooks/immutability */
  }, [guardActive, navigator, cancelEditing, t]);

  // Warn on hard unload (tab close / refresh) while there are unsaved edits.
  useEffect(() => {
    if (!(isEditing && isDirty)) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isEditing, isDirty]);

  // Restore focus to the Edit CTA when leaving edit mode (the editable hero that
  // held focus unmounts, so focus would otherwise fall to <body>).
  const wasEditing = useRef(false);
  useEffect(() => {
    if (wasEditing.current && !isEditing) {
      document.getElementById("profileEditCta")?.focus();
    }
    wasEditing.current = isEditing;
  }, [isEditing]);

  if (isSelf && isProfileLoading) {
    return (
      <PageShell>
        <div className={styles.stateWrap} role="status" aria-live="polite">
          <Spinner />
          <span>{t("members:profile.loading")}</span>
        </div>
      </PageShell>
    );
  }

  if (isSelf && isProfileError) {
    return (
      <PageShell>
        <div className={styles.stateWrap}>
          <EmptyState
            className={styles.stateEmpty}
            icon={<FiAlertTriangle />}
            title={t("members:profile.loadError.title")}
            description={t("members:profile.loadError.description")}
            action={{
              label: t("members:profile.loadError.retryAction"),
              onClick: retryProfile,
            }}
            secondaryAction={{
              label: t("members:profile.goBack"),
              onClick: () => void navigate(-1),
            }}
          />
        </div>
      </PageShell>
    );
  }

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
              onClick: () => void navigate(-1),
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
              onClick: () => void navigate(-1),
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
