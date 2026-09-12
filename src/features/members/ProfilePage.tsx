import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useProfile } from "../../app/providers/useProfile";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { currentUserSlug } from "./data/memberProfiles";
import { isMemberMissingError, useMemberProfile } from "./api/useMemberProfile";
import { profileBelowHeroNodes } from "./ProfileBelowHeroGroup";
import { ProfileLayoutSwitch } from "./ProfileLayoutSwitch";
import { ProfileBackBar, ProfilePreviewBanner } from "./ProfilePageChrome";
import { ProfileEditBar } from "./ProfileEditBar";
import { ProfileInviteCard } from "./ProfileInviteCard";
import { ProfileLimitedNote } from "./ProfileLimitedNote";
import { ProfileMovedNote } from "./ProfileMovedNote";
import { ProfileOwnerSheets } from "./ProfileOwnerSheets";
import { useMovedHandleRedirect } from "./useMovedHandleRedirect";
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
  // mobile header render for the owner. These used to be desktop-only, which
  // put every visibility toggle, per-person hiding, report receipt, data export
  // and DSAR out of reach for anyone on a phone.
  const sheets = useProfilePageSheets();

  // Where the page was scrolled when the editor was opened. Read at the click
  // (rather than in an effect after the hero has already swapped) so it is the
  // member's real reading position, before entering edit mode moves anything.
  // `useProfileEditGuard` scrolls back to it when they save, discard or go back.
  const scrollBeforeEdit = useRef<number | null>(null);

  function enterEdit(focus = false) {
    scrollBeforeEdit.current = window.scrollY;
    setFocusLinks(focus);
    startEditing();
    // Opening the editor starts at the top of the page: the hero swaps for a
    // form whose first fields are above whatever the member happened to be
    // reading, so staying put left them editing off-screen. `behavior:
    // "instant"`, not "auto" (which defers to the global
    // `html { scroll-behavior: smooth }` in base.css): the landing has to snap,
    // never animate the page past them. Skipped for the "edit links" entry,
    // which lands on the links field instead (see useEnterEditFocus).
    if (!focus) window.scrollTo({ top: 0, behavior: "instant" });
  }

  // In live mode, an unauthenticated visitor has no slug, so never fall back to
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
  // PRD-204: a username its owner renamed away from still forwards to them for
  // the reclaim cooldown. Called on every render so the guard below can hold the
  // page back while the forwarding navigation runs from its effect.
  const isRedirectingToMovedSlug = useMovedHandleRedirect(
    slug,
    otherMemberError,
  );
  const otherMember = data?.member ?? null;
  const limited = data?.limited ?? false;

  const profile = isSelf ? liveProfile : otherMember;

  const selfView = isSelf && !previewing;

  useProfileEditGuard({ isEditing, isDirty, cancelEditing, scrollBeforeEdit });
  // Hooks must run unconditionally on every render, so this is read here,
  // above the early-return guards below, even though it's only consumed
  // after them.
  const isMobile = useMediaQuery(mediaMax("md"));

  if (isSelf && isProfileLoading) return <ProfileLoadingState />;
  if (isSelf && isProfileError) {
    return <ProfileErrorState onRetry={retryProfile} />;
  }
  if (!isSelf && isLoading) return <ProfileLoadingState />;
  if (blocked) return <ProfileBlockedState />;
  // The order here is the contract. A forwarded username must never flash the
  // "no such member" wall on its way through, so this sits ABOVE both branches
  // below, which would otherwise both claim a PROFILE_MOVED 404 as an absence.
  if (isRedirectingToMovedSlug) return <ProfileLoadingState />;
  // A 5xx, a timeout or an offline browser is an outage, not an absence. It
  // used to fall through to the "no such member" wall, which reads as "this
  // person left" and offers no retry, so a transient failure sent people away
  // for good. Only a real 404/403 gets that wall now.
  if (
    !isSelf &&
    isOtherMemberError &&
    !isMemberMissingError(otherMemberError)
  ) {
    return <ProfileErrorState onRetry={() => void refetchOtherMember()} />;
  }
  if (!isSelf && !otherMember) return <ProfileNotFoundState />;

  // Non-null by the guards above: isSelf → liveProfile (ProfileProvider always
  // has one), !isSelf → otherMember. The adapter has already zeroed out
  // bio/work/openTo for a limited card, so the sections below render empty and
  // `ProfileLimitedNote` says whose choice that was (PRD-203).
  const resolvedProfile = profile!;

  // Mobile Instagram-style layout applies to both the view and edit states:
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

  const { restBelowHero, belowHero } = profileBelowHeroNodes({
    profile: resolvedProfile,
    isSelf,
    selfView,
    previewing,
    isEditing,
    otherMember: isSelf ? null : otherMember,
    ownerSlug,
    draft,
    updateDraft,
  });

  return (
    <PageShell>
      {/* The way back out belongs to the editor while the editor is open: the
          sticky bar at the foot of the screen already offers Go back / Discard
          next to Save. A second exit above the form pointed at wherever the
          member came from ("Back to the feed"), which reads as an escape from a
          page they are in the middle of filling in. */}
      {!isEditing && <ProfileBackBar />}
      <ProfileMovedNote />

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

      {/* PRD-203: a limited card is a hero and then nothing, which reads as
          an abandoned account until something says whose choice it was. Sits
          right under the hero because everything after it is empty here, and
          never appears in demo, where `limited` is always false. */}
      {!isSelf && limited && otherMember && (
        <ProfileLimitedNote
          slug={otherMember.slug}
          firstName={otherMember.first}
          visibility={otherMember.visibility}
        />
      )}

      {/* ACQ-08: owner-only, and last on the page so it pushes nothing down.
          Hidden while editing (the sticky save bar owns the foot of the screen
          then) and silent unless there are invites actually left to give. */}
      {selfView && !isEditing && <ProfileInviteCard />}

      {selfView && <ProfileEditBar />}

      {isSelf && previewing && (
        <ProfilePreviewBanner onExit={() => setPreviewing(false)} />
      )}

      <ProfileOwnerSheets sheets={sheets} ownerSlug={ownerSlug} />
    </PageShell>
  );
}
