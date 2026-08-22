import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Member } from "../../features/members/data/members";
import { useUpdateProfile } from "../../features/members/api/useUpdateProfile";
import {
  useUpdateProfileLists,
  type ProfileLists,
} from "../../features/members/api/useUpdateProfileLists";
import type { ProfileDTO } from "../../features/members/api/members.api";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mergeSavedProfile } from "./profileSeed";
import {
  toDraft,
  draftToUpdateDto,
  isDraftDirty,
  type ProfileEditValue,
  type ProfileDraft,
} from "./useProfile";

type DraftStateInput = {
  /**
   * Auth identity merged over the base member: the value to seed state from.
   *
   * MUST be referentially stable while its inputs are unchanged. The re-seed
   * effect below compares seeds by reference, so a caller that rebuilds this
   * object on every render turns that effect into an infinite render loop.
   * `ProfileProvider` memoizes it for exactly this reason.
   */
  seed: Member;
  /**
   * Whether the committed profile is the member's real one. False in live mode
   * while the own-profile fetch is pending or has failed, when `seed` is the
   * empty shell from `emptyLiveProfileBase` — editing then has nothing real to
   * edit, and saving would overwrite the member's stored profile with blanks.
   */
  isProfileReady: boolean;
};

/**
 * The signed-in member's committed profile plus the whole edit session around
 * it: draft, dirty tracking, validation, persistence and the "saved" flash.
 *
 * Split out of `ProfileProvider` so neither the provider component nor this
 * hook's own body runs past the 200-line rule, and so the two most sensitive
 * pieces (which member we are showing, and what we write back) can be read
 * separately.
 */
export function useProfileDraftState({
  seed,
  isProfileReady,
}: DraftStateInput): { profile: Member; edit: ProfileEditValue } {
  const { t } = useTranslation();
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
    // Nothing real to edit yet: opening a session here would seed the draft
    // from the empty placeholder and a save would blank the stored profile.
    if (!isProfileReady) return;
    setDraft(toDraft(profile));
    setJustSaved(false);
    setSaveError(null);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setIsEditing(true);
  }, [profile, isProfileReady]);

  const cancelEditing = useCallback(() => {
    setDraft(toDraft(profile));
    setIsEditing(false);
  }, [profile]);

  const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  /** Only the lists the member actually changed this session, so an untouched
   *  list is never full-replaced (which would also re-derive group slugs from
   *  names on every save). */
  const changedLists = useCallback(
    (next: ProfileDraft, committed: Member): ProfileLists => {
      const isSame = (a: unknown, b: unknown) =>
        JSON.stringify(a) === JSON.stringify(b);
      const lists: ProfileLists = {};
      if (!isSame(next.work, committed.work)) lists.work = next.work;
      if (!isSame(next.skills, committed.skills)) lists.skills = next.skills;
      if (!isSame(next.board, committed.board)) lists.board = next.board;
      if (!isSame(next.groups, committed.groups)) lists.groups = next.groups;
      if (!isSame(next.shapings, committed.shapings))
        lists.shapings = next.shapings;
      if (!isSame(next.socials ?? [], committed.socials ?? []))
        lists.socials = next.socials;
      return lists;
    },
    [],
  );

  const save = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    if (!isProfileReady) {
      setSaveError(t("shared:profile.saveError"));
      return false;
    }
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
      // profile and show the confirmation once it actually succeeds. Core fields
      // go through PATCH /profiles/me; each changed draft list persists via its
      // own PUT /profiles/me/*.
      savedProfile = await persistProfile(
        draftToUpdateDto(draft, profile.photo),
      );
      await persistLists(changedLists(draft, profile));
    } catch (err) {
      setSaveError(reasonFor(err) ?? t("shared:profile.saveError"));
      return false;
    }
    setProfile((prev) => mergeSavedProfile(prev, draft, savedProfile));
    setIsEditing(false);
    setJustSaved(true);
    setSavedVersion((n) => n + 1);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 5000);
    return true;
  }, [
    draft,
    profile,
    isProfileReady,
    changedLists,
    persistProfile,
    persistLists,
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

  const edit = useMemo<ProfileEditValue>(
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

  return { profile, edit };
}
