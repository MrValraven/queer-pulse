import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { currentUser } from "../../features/members/data/demoCurrentUser";
import type { Member } from "../../features/members/data/members";
import { useAuth } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";
import type { AuthUser } from "../../features/auth/api/auth.api";
import { useUpdateProfile } from "../../features/members/api/useUpdateProfile";
import {
  useUpdateProfileLists,
  type ProfileLists,
} from "../../features/members/api/useUpdateProfileLists";
import { useMemberProfile } from "../../features/members/api/useMemberProfile";
import type { ProfileDTO } from "../../features/members/api/members.api";
import { useSessionBootstrapSettled } from "../../shared/api/useSessionBootstrap";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ProfileDataContext,
  ProfileEditContext,
  toDraft,
  draftToUpdateDto,
  isDraftDirty,
  type ProfileDataValue,
  type ProfileEditValue,
  type ProfileDraft,
} from "./useProfile";

/**
 * The logged-in member's profile: the authenticated user's identity fields (real
 * name, pronouns, photo, slug) layered over a `base` member. In live mode `base`
 * is the member's own full profile fetched from the backend (bio, tags, role,
 * hood, work, …); in demo mode it's the mock `currentUser`. Auth identity fields
 * win where present so the hero stays consistent with the session even before
 * the profile fetch resolves.
 */
function profileFromAuth(
  user: AuthUser | null,
  base: Member = currentUser,
): Member {
  if (!user) return base;
  const p = user.profile;
  const first = p.firstName?.trim() || base.first;
  const last = p.lastName?.trim() || base.last;
  const initials =
    ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || base.initials;
  return {
    ...base,
    slug: p.slug || base.slug,
    first,
    last,
    pronouns: p.pronouns?.trim() || base.pronouns,
    photo: p.avatarUrl ?? base.photo,
    initials,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
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
  const base = (!demoMode && ownProfile?.member) || currentUser;

  // Live mode only: the own-profile fetch hasn't landed yet (and hasn't errored),
  // so `base` is still the mock `currentUser`. The page uses this to skeleton the
  // self view instead of flashing mock bio/work/tags as if they were real. Demo
  // mode is never "loading" — the mock IS the source of truth there.
  const isProfileLoading =
    !demoMode && !ownProfileErrored && !ownProfile?.member;
  const isProfileError = !demoMode && ownProfileErrored;

  // The base member (mock vs fetched) and the auth identity, merged. Stable
  // across renders so the re-seed effect only fires when one actually changes.
  const seed = useMemo(() => profileFromAuth(user, base), [user, base]);

  const [profile, setProfile] = useState<Member>(seed);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(seed));
  const [justSaved, setJustSaved] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeed = useRef(seed);
  const { mutateAsync: persistProfile, isPending: isSaving } =
    useUpdateProfile();
  const { mutateAsync: persistLists } = useUpdateProfileLists();

  // The auth user resolves after mount (async /auth/me, or a later sign-in) and
  // the own-profile fetch lands later still. Re-seed whenever that merged seed
  // changes, but don't clobber unsaved local edits.
  useEffect(() => {
    if (seed === lastSeed.current) return;
    // Bail BEFORE advancing the ref: if we marked this seed "consumed" here and
    // then returned because of `isEditing`, a later non-editing render carrying
    // the same seed would short-circuit at the guard above and the seed would be
    // swallowed permanently. `isEditing` is a dependency, so this effect re-runs
    // when editing ends and picks the pending seed up then.
    if (isEditing) return;
    lastSeed.current = seed;
    // Re-seeds from the async /auth/me + own-profile fetch when it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(seed);
    setDraft(toDraft(seed));
  }, [seed, isEditing]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const startEditing = useCallback(() => {
    setDraft(toDraft(profile));
    setJustSaved(false);
    setSaveError(null);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setIsEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setDraft(toDraft(profile));
    setIsEditing(false);
  }, [profile]);

  const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    // Validate before persisting: a blank first name used to silently revert to
    // the previous value on save. Surface it instead so the member knows why.
    if (!draft.first.trim()) {
      setSaveError(t("members:profileEdit.validation.nameRequired"));
      return false;
    }
    // Set (live mode) once the PATCH resolves; stays undefined in demo mode,
    // where `persistProfile` is a no-op and never touches the network.
    let savedProfile: ProfileDTO | undefined;
    try {
      // Persist to the backend first (no-op in demo mode); only commit the live
      // profile and show the confirmation once it actually succeeds. The core
      // fields go through PATCH /profiles/me; each editable draft list persists
      // via its own PUT /profiles/me/* — but ONLY the lists the member actually
      // changed this session, so an untouched list is never full-replaced (which
      // also avoids re-deriving group slugs from names on every save).
      const sameAsCommitted = (next: unknown, committed: unknown) =>
        JSON.stringify(next) === JSON.stringify(committed);
      const changedLists: ProfileLists = {};
      if (!sameAsCommitted(draft.work, profile.work))
        changedLists.work = draft.work;
      if (!sameAsCommitted(draft.skills, profile.skills))
        changedLists.skills = draft.skills;
      if (!sameAsCommitted(draft.board, profile.board))
        changedLists.board = draft.board;
      if (!sameAsCommitted(draft.groups, profile.groups))
        changedLists.groups = draft.groups;
      if (!sameAsCommitted(draft.shapings, profile.shapings))
        changedLists.shapings = draft.shapings;
      if (!sameAsCommitted(draft.socials ?? [], profile.socials ?? []))
        changedLists.socials = draft.socials;

      savedProfile = await persistProfile(draftToUpdateDto(draft));
      await persistLists(changedLists);
    } catch (err) {
      setSaveError(
        reasonFor(err) ?? "We couldn't save your profile. Please try again.",
      );
      return false;
    }
    setProfile((prev) => ({
      ...prev,
      // `draft.photo` is a storage KEY (unfetchable by the browser), not a
      // URL — rendering it directly would show a broken image once the local
      // upload preview is gone. `persistProfile` resolves the PATCH response,
      // whose `avatarUrl` the backend has already turned into a fetchable
      // `${API_URL}/files/<key>` URL (or `null` after a removal) — mirrors how
      // `profileFromAuth` above seeds `photo` from `p.avatarUrl ?? base.photo`.
      // In demo mode `persistProfile` is a no-op and `savedProfile` stays
      // undefined, so this falls back to the pre-existing `draft.photo`
      // behaviour, which in that mode already holds a locally fetchable
      // object URL (see `useUploadImage`'s demo-mode branch).
      photo: savedProfile?.avatarUrl ?? draft.photo,
      first: draft.first.trim() || prev.first,
      last: draft.last.trim() || prev.last,
      role: draft.role.trim(),
      pronouns: draft.pronouns.trim() || undefined,
      hood: draft.hood.trim() || prev.hood,
      bio: draft.bio.trim() || prev.bio,
      now: draft.now.trim(),
      openTo: draft.openTo,
      tags: draft.tags,
      visibility: draft.visibility,
      socials: draft.socials.filter((s) => s.urlOrHandle.trim()),
      work: draft.work,
      skills: draft.skills,
      board: draft.board,
      groups: draft.groups,
      shapings: draft.shapings,
      identities: draft.identities,
      lookingFor: draft.lookingFor,
      lookingForPublic: draft.lookingForPublic,
      privateNetwork: draft.privateNetwork,
      featuredConsent: draft.featuredConsent,
      // Self display (Task 3) always reads live from `draft.featuredCommunities`,
      // so no ref rebuild is needed here — `useMyCommunityCards` is a hook and
      // can't be called inside `save`. Keep the prior resolved refs so this
      // field stays coherent and doesn't flash empty; live mode's next profile
      // refetch brings the real, freshly-resolved refs anyway.
      featuredCommunities: prev.featuredCommunities,
    }));
    setIsEditing(false);
    setJustSaved(true);
    setSavedVersion((n) => n + 1);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 5000);
    return true;
  }, [
    draft,
    persistProfile,
    persistLists,
    profile.work,
    profile.skills,
    profile.board,
    profile.groups,
    profile.shapings,
    profile.socials,
    t,
  ]);

  // Draft ≠ committed profile — drives the unsaved-changes indicator, the
  // navigation guard, and confirm-on-discard.
  const isDirty = useMemo(
    () => isEditing && isDraftDirty(draft, profile),
    [isEditing, draft, profile],
  );

  const requestCancel = useCallback(() => {
    if (isDirty && !window.confirm(t("members:profileEdit.discardConfirm")))
      return;
    cancelEditing();
  }, [isDirty, cancelEditing, t]);

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

  const editValue = useMemo<ProfileEditValue>(
    () => ({
      isEditing,
      draft,
      justSaved,
      savedVersion,
      isSaving,
      saveError,
      isDirty,
      startEditing,
      cancelEditing,
      requestCancel,
      save,
      updateDraft,
    }),
    [
      isEditing,
      draft,
      justSaved,
      savedVersion,
      isSaving,
      saveError,
      isDirty,
      startEditing,
      cancelEditing,
      requestCancel,
      save,
      updateDraft,
    ],
  );

  return (
    <ProfileDataContext.Provider value={dataValue}>
      <ProfileEditContext.Provider value={editValue}>
        {children}
      </ProfileEditContext.Provider>
    </ProfileDataContext.Provider>
  );
}
