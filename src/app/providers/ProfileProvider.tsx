import { useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";
import { useMemberProfile } from "../../features/members/api/useMemberProfile";
import { useSessionBootstrapSettled } from "../../shared/api/useSessionBootstrap";
import { profileFromAuth, resolveProfileBase } from "./profileSeed";
import { useProfileDraftState } from "./useProfileDraftState";
import {
  ProfileDataContext,
  ProfileEditContext,
  type ProfileDataValue,
} from "./useProfile";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const bootstrapSettled = useSessionBootstrapSettled();
  // Fetch the logged-in member's own full profile (bio, tags, role, hood, work)
  // in live mode — auth alone only carries identity fields. Disabled in demo
  // mode (the mock `currentUser` already has the rich fields), and held off
  // until the session bootstrap settles: bootstrap seeds this exact
  // `["profile", false, slug]` cache key, so waiting lets a successful
  // bootstrap warm it and skip this fetch, while a failed/inapplicable
  // bootstrap still opens the gate so this falls back to its own endpoint.
  // `useMemberProfile` itself stays untouched — it's also used to fetch OTHER
  // members' profiles app-wide, and gating it globally would needlessly delay
  // every profile page; passing `undefined` here only holds off this
  // own-profile call, since the hook already disables on a falsy slug.
  const {
    data: ownProfile,
    isError: ownProfileErrored,
    refetch: refetchOwnProfile,
  } = useMemberProfile(
    demoMode || !bootstrapSettled ? undefined : user?.profile.slug,
  );
  // Live mode never falls back to the demo persona: see `resolveProfileBase`
  // and `emptyLiveProfileBase` in profileSeed.ts.
  const ownProfileMember = ownProfile?.member ?? undefined;

  // Live mode only: the own-profile fetch hasn't landed yet (and hasn't
  // errored), so `base` is still the empty placeholder. The page uses this to
  // skeleton the self view instead of rendering blank fields as if they were
  // real. Demo mode is never "loading" — the mock IS the source of truth there.
  const isProfileLoading =
    !demoMode && !ownProfileErrored && !ownProfile?.member;
  const isProfileError = !demoMode && ownProfileErrored;
  /** True once the committed profile is the member's real one (see the hook). */
  const isProfileReady = demoMode || Boolean(ownProfile?.member);

  // The base member and the auth identity, merged. Memoized on the three inputs
  // that actually decide it, because `resolveProfileBase` is NOT referentially
  // stable: on the live path where the own-profile fetch has not landed (logged
  // out, still loading, or the backend unreachable) it returns a freshly built
  // `emptyLiveProfileBase(user)` object every call. Computing that inline gave
  // `seed` a brand-new identity on every render, and the re-seed effect inside
  // `useProfileDraftState` compares seeds by reference: it set state after every
  // commit, which re-rendered, which rebuilt the seed, forever. That was an
  // infinite render loop ("Maximum update depth exceeded") for every visitor
  // without a loaded own profile.
  const seed = useMemo(
    () =>
      profileFromAuth(
        user,
        resolveProfileBase(demoMode, ownProfileMember, user),
      ),
    [user, demoMode, ownProfileMember],
  );

  const { profile, edit } = useProfileDraftState({ seed, isProfileReady });

  const retryProfile = useCallback(() => {
    void refetchOwnProfile();
  }, [refetchOwnProfile]);

  // Split into two memoized values, each behind its OWN context — see
  // `useProfile.ts`'s `ProfileDataValue`/`ProfileEditValue` doc comments. A
  // display-only consumer that calls `useProfileData()` now only re-renders
  // when `dataValue`'s own deps change (the committed profile + fetch
  // status) — NOT on every `updateDraft` keystroke of an unrelated
  // in-progress edit elsewhere in the tree, which used to force a re-render
  // through the single combined context both halves shared before.
  const dataValue = useMemo<ProfileDataValue>(
    () => ({
      profile,
      isProfileLoading,
      isProfileError,
      retryProfile,
    }),
    [profile, isProfileLoading, isProfileError, retryProfile],
  );

  return (
    <ProfileDataContext.Provider value={dataValue}>
      <ProfileEditContext.Provider value={edit}>
        {children}
      </ProfileEditContext.Provider>
    </ProfileDataContext.Provider>
  );
}
