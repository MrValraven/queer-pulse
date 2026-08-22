import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useProfile } from "../../app/providers/useProfile";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { currentUserSlug } from "./data/memberProfiles";
import {
  isMemberMissingError,
  useMemberProfile,
} from "./api/useMemberProfile";
import { ProfileBelowHeroSections } from "./ProfileBelowHeroSections";
import { ProfileLayoutSwitch } from "./ProfileLayoutSwitch";
import { ProfileBackBar, ProfilePreviewBanner } from "./ProfilePageChrome";
import { ProfileSubprofilesSection } from "./ProfileSubprofilesSection";
import { ProfileEditBar } from "./ProfileEditBar";
import { WhoSeesWhatSheet } from "./WhoSeesWhatSheet";
import { AccountDataSheet } from "./AccountDataSheet";
import { useProfileEditGuard } from "./useProfileEditGuard";
import { useProfilePageSheets } from "./useProfilePageSheets";
import {
  ProfileLoadingState,
  ProfileErrorState,
  ProfileBlockedState,
  ProfileNotFoundState,
} from "./ProfileStateScreens";

export function ProfilePage() {
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
  // Owner-only sheets ("Who sees what", "Your data") and the 24h hide toggle.
  // Reachable from `ProfileSettingsMenu`, which both the desktop hero and the
  // mobile header render for the owner — these used to be desktop-only, which
  // put every visibility toggle, per-person hiding, report receipt, data export
  // and DSAR out of reach for anyone on a phone.
  const sheets = useProfilePageSheets({ updateDraft, save });

  function enterEdit(focus = false) {
    setFocusLinks(focus);
    startEditing();
  }

  // In live mode, an unauthenticated visitor has no slug — never fall back to
  // the demo persona (`currentUserSlug` === "tiago"), or a logged-out visitor
  // to /members/tiago would be mis-detected as viewing their own profile.
  const selfSlug =
    user?.profile.slug ?? (demoMode ? currentUserSlug : undefined);
  const isSelf = !slug || slug === selfSlug;
  // A blocked member's profile is walled off. (The blocked-by direction is
  // enforced server-side in live mode: the fetch 403s → the not-found wall.)
  const blocked = !isSelf && !!slug && isBlocked(slug);

  const {
    data,
    isLoading,
    isError: isOtherMemberError,
    error: otherMemberError,
    refetch: refetchOtherMember,
  } = useMemberProfile(isSelf ? undefined : slug);
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
  // A 5xx, a timeout or an offline browser is an outage, not an absence. It
  // used to fall through to the "no such member" wall, which reads as "this
  // person left" and offers no retry, so a transient failure sent people away
  // for good. Only a real 404/403 gets that wall now.
  if (!isSelf && isOtherMemberError && !isMemberMissingError(otherMemberError)) {
    return <ProfileErrorState onRetry={() => void refetchOtherMember()} />;
  }
  if (!isSelf && !otherMember) return <ProfileNotFoundState />;

  // Non-null by the guards above: isSelf → liveProfile (ProfileProvider always
  // has one), !isSelf → otherMember. `limited` needs no prop: the adapter has
  // already zeroed out bio/work/openTo for a limited card.
  void limited;
  const resolvedProfile = profile!;

  // Mobile Instagram-style layout applies to both the view and edit states —
  // phone-width editing renders the centered mobile editor instead of the
  // desktop inline editor.
  const useMobileLayout = isMobile;
  const ownerSlug = isSelf ? (selfSlug ?? "") : (slug ?? "");

  // The settings menu is reachable only when `isSelf && !previewing &&
  // !isEditing`, i.e. exactly when the read-mode hero (not
  // `EditableProfileHero`) is on screen. `useProfileEditGuard`'s
  // dirty-navigation warning only activates when `isEditing && isDirty`, and
  // the provider defines `isDirty` itself as `isEditing && isDraftDirty(...)`,
  // so with `isEditing` always false here the hide toggle's direct draft/save
  // cycle can never trip it.
  const toggleHidden = () => sheets.toggleHidden(resolvedProfile.hiddenUntil);

  // The work/board/skills/groups + communities + places sections, excluding
  // "Also working as" — desktop read-mode renders that section separately,
  // full-width, between the two rail grids (see below).
  const restBelowHero = (
    <ProfileBelowHeroSections
      profile={resolvedProfile}
      isSelf={isSelf}
      selfView={selfView}
      previewing={previewing}
      otherMember={isSelf ? null : otherMember}
      ownerSlug={ownerSlug}
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
  );

  // Shared below-hero sections — rendered after the hero on both the phone-
  // width edit layout and the desktop edit layout. Neither has the rail
  // grid, so "Also working as" stays inline with the rest here (desktop
  // read-mode below breaks it out separately).
  const belowHero = (
    <>
      <ProfileSubprofilesSection
        ownerSlug={ownerSlug}
        isSelf={selfView}
        previewing={isSelf && previewing}
      />
      {restBelowHero}
    </>
  );

  return (
    <PageShell>
      <ProfileBackBar />

      <ProfileLayoutSwitch
        profile={resolvedProfile}
        isSelf={isSelf}
        selfView={selfView}
        previewing={previewing}
        isEditing={isEditing}
        focusLinks={focusLinks}
        useMobileLayout={useMobileLayout}
        otherMember={isSelf ? null : otherMember}
        ownerSlug={ownerSlug}
        restBelowHero={restBelowHero}
        belowHero={belowHero}
        onEdit={() => enterEdit(false)}
        onEditLinks={() => enterEdit(true)}
        onPreview={() => {
          setPreviewing(true);
          window.scrollTo({ top: 0 });
        }}
        onOpenWhoSeesWhat={sheets.openWhoSeesWhat}
        onOpenAccountData={sheets.openAccountData}
        onToggleHidden={toggleHidden}
      />

      {selfView && <ProfileEditBar />}

      {isSelf && previewing && (
        <ProfilePreviewBanner onExit={() => setPreviewing(false)} />
      )}

      {/* Owner sheets — `SideSheet` already portals to `document.body`, so
          placement here doesn't matter for layout. Both are opened from
          `ProfileSettingsMenu`, which the desktop hero and the mobile header
          each render for the owner; the `!useMobileLayout` guard that used to
          sit here was what made every setting inside them unreachable on a
          phone. */}
      {sheets.isWhoSeesWhatOpen && (
        <WhoSeesWhatSheet onClose={sheets.closeWhoSeesWhat} />
      )}
      {sheets.isAccountDataOpen && (
        <AccountDataSheet
          onClose={sheets.closeAccountData}
          ownerSlug={ownerSlug}
        />
      )}
    </PageShell>
  );
}
