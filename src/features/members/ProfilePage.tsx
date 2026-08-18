import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/useProfile";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { currentUserSlug } from "./data/memberProfiles";
import { useMemberProfile } from "./api/useMemberProfile";
import { ProfileHero, ProfileContent } from "./ProfileSections";
import { ProfileRail } from "./ProfileRail";
import { ProfileCommunitiesSection } from "./ProfileCommunitiesSection";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import { PlacesSection } from "./PlacesSection";
import { EditableProfileHero } from "./EditableProfileHero";
import { ProfileEditBar } from "./ProfileEditBar";
import { WhoSeesWhatSheet } from "./WhoSeesWhatSheet";
import { AccountDataSheet } from "./AccountDataSheet";
import { useProfileEditGuard } from "./useProfileEditGuard";
import { MobileProfileView } from "./MobileProfileView";
import { MobileEditableProfileHero } from "./MobileEditableProfileHero";
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
    save,
    isDirty,
    isProfileLoading,
    isProfileError,
    retryProfile,
  } = useProfile();
  const { user } = useAuth();
  const { isBlocked } = useSocial();
  const { demoMode } = useDemoMode();
  const [previewing, setPreviewing] = useState(false);
  // When entering edit mode from the "Add/Edit links" affordance, jump the editor
  // straight to the Links section instead of landing at the top of the form.
  const [focusLinks, setFocusLinks] = useState(false);
  // Desktop-only rail sheets — "who sees what" visibility settings and the
  // account-data (export/step-away/DSAR) surface. See the guard on their
  // render below; unreachable on mobile since nothing there can open them.
  const [whoSeesWhatOpen, setWhoSeesWhatOpen] = useState(false);
  const [accountDataOpen, setAccountDataOpen] = useState(false);

  function enterEdit(focus = false) {
    setFocusLinks(focus);
    startEditing();
  }

  // The 24h-hide rail toggle persists immediately (its own copy says "takes
  // effect right away" — it must not sit staged behind the normal Save
  // button). `save()` is a `useCallback` closed over the CURRENT `draft`
  // (see `ProfileProvider.tsx`), so calling it in the same tick as
  // `updateDraft()` would ship the PRE-toggle draft — React hasn't
  // re-rendered between the two calls yet, so the `save` reference here is
  // still stale. This is the exact trap `useInstantVisibilitySave` (in
  // `WhoSeesWhatFieldToggles.tsx`) works around for the sheet's own instant
  // toggles: queue the intent, then let an effect keyed on the fresh `save`
  // identity — which only changes once the provider has committed the
  // patch — fire the actual persist on the next render.
  const pendingHiddenToggle = useRef(false);
  useEffect(() => {
    if (!pendingHiddenToggle.current) return;
    pendingHiddenToggle.current = false;
    void save();
  }, [save]);

  // In live mode, an unauthenticated visitor has no slug — never fall back to
  // the demo persona (`currentUserSlug` === "tiago"), or a logged-out visitor
  // to /members/tiago would be mis-detected as viewing their own profile.
  const selfSlug =
    user?.profile.slug ?? (demoMode ? currentUserSlug : undefined);
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
  // Hooks must run unconditionally on every render, so this is read here —
  // above the early-return guards below — even though it's only consumed
  // after them.
  const isMobile = useMediaQuery(mediaMax("md"));

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

  // Mobile Instagram-style layout applies to both the view and edit states —
  // phone-width editing renders the centered mobile editor instead of the
  // desktop inline editor.
  const useMobileLayout = isMobile;
  const ownerSlug = isSelf ? (selfSlug ?? "") : (slug ?? "");

  // Desktop-only settings-menu control (see `ProfileSettingsMenu`/
  // `ProfileHeroMain`'s `isSelf` gate) — only ever reachable when `isSelf && !previewing &&
  // !isEditing`, i.e. exactly when `ProfileHero` (not `EditableProfileHero`)
  // is on screen. `useProfileEditGuard`'s dirty-navigation warning only
  // activates when `isEditing && isDirty`, and the provider defines
  // `isDirty` itself as `isEditing && isDraftDirty(...)` — so with `isEditing`
  // always false here, this direct draft/save cycle can never trip it.
  function toggleHidden() {
    const nextValue =
      resolvedProfile.hiddenUntil &&
      new Date(resolvedProfile.hiddenUntil) > new Date()
        ? null
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    pendingHiddenToggle.current = true;
    updateDraft({ hiddenUntil: nextValue });
  }

  // Shared below-hero sections — rendered after the hero on both the desktop
  // layout and the phone-width edit layout, so mobile editing keeps access to
  // the same work/board/skills/groups editors as desktop.
  const belowHero = (
    <>
      <ProfileSubprofilesSection
        ownerSlug={ownerSlug}
        isSelf={selfView}
        previewing={isSelf && previewing}
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
                shapings: draft.shapings,
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
        memberSlug={ownerSlug}
        isSelf={selfView}
        firstName={resolvedProfile.first}
      />
    </>
  );

  return (
    <PageShell>
      <div className={`${styles.backBar} wrap`}>
        <Link to={routes.members} className={styles.backLink}>
          <FiArrowLeft aria-hidden /> {t("members:profile.backToRoom")}
        </Link>
      </div>

      {useMobileLayout ? (
        selfView && isEditing ? (
          <>
            <MobileEditableProfileHero focusLinks={focusLinks} />
            {belowHero}
          </>
        ) : (
          <MobileProfileView
            profile={resolvedProfile}
            isSelf={isSelf}
            selfView={selfView}
            previewing={previewing}
            otherMember={isSelf ? null : otherMember}
            ownerSlug={ownerSlug}
            onEdit={() => enterEdit(false)}
            onEditLinks={() => enterEdit(true)}
            onPreview={() => {
              setPreviewing(true);
              window.scrollTo({ top: 0 });
            }}
          />
        )
      ) : selfView && isEditing ? (
        <>
          <EditableProfileHero focusLinks={focusLinks} />
          {belowHero}
        </>
      ) : (
        // The sticky rail (portrait, trust signals, owner controls,
        // section-jump nav) runs alongside the WHOLE page — hero text plus
        // every below-hero section — not just the hero row, so it stays in
        // view via `position: sticky` as the visitor scrolls through
        // "Open to", "On the board", etc. Edit mode (above) skips this grid
        // entirely: `EditableProfileHero` is a self-contained form, not a
        // browsable profile, so it doesn't need the section-jump rail.
        <div className="wrap">
          <div className={styles.pageGrid}>
            <div className={styles.railCol}>
              <ProfileRail
                profile={resolvedProfile}
                self={isSelf}
                asVisitor={isSelf && previewing}
              />
            </div>
            <div className={styles.pageCol}>
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
                onOpenWhoSeesWhat={() => setWhoSeesWhatOpen(true)}
                onOpenAccountData={() => setAccountDataOpen(true)}
                onToggleHidden={toggleHidden}
                hiddenUntil={resolvedProfile.hiddenUntil ?? null}
              />

              {/* "Also as…" — the owner's linked + published personas, surfaced
                  right after the hero as the second thing on the profile.
                  Public viewers see only linked personas (the hook enforces
                  this); self view adds a manage link and a create prompt when
                  empty. Preview counts as a public view. */}
              {belowHero}
            </div>
          </div>
        </div>
      )}

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

      {/* Rail sheets — `SideSheet` already portals to `document.body`, so
          placement here doesn't matter for layout. Only ever opened from the
          desktop `ProfileHero`'s rail controls (mobile has no trigger for
          them), but guarded here too for defense-in-depth. */}
      {!useMobileLayout && whoSeesWhatOpen && (
        <WhoSeesWhatSheet onClose={() => setWhoSeesWhatOpen(false)} />
      )}
      {!useMobileLayout && accountDataOpen && (
        <AccountDataSheet
          onClose={() => setAccountDataOpen(false)}
          ownerSlug={ownerSlug}
        />
      )}
    </PageShell>
  );
}
