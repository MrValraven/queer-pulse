import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProfileEdit,
  type ProfileDraft,
} from "../../../app/providers/useProfile";
import { useDeferredDraftSave } from "../../../app/providers/useDeferredDraftSave";
import type { OpenToEntry } from "../openTo.data";
import type { MemberProfile } from "../data/memberProfiles";
import { useTranslation } from "../../../shared/i18n/useTranslation";

const isSameOpenTo = (a: OpenToEntry[], b: OpenToEntry[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * `UpdateNowModal`'s local field state plus its save lifecycle, split out of
 * the component so the JSX stays under the 200-line cap.
 *
 * Persists via the shared profile-edit session (`useDeferredDraftSave`, over
 * the same `useProfileEdit` the `ProfileEditBar` and the profile rail's 24h
 * self-hide drive), not a bare `useUpdateProfile` call: `save()` commits onto
 * the profile every screen reads (via `mergeSavedProfile`); in demo mode
 * (default; no server to refetch from) nothing else would. That hook owns the
 * whole patch-then-save dance, including why it cannot simply call `save()` in
 * the same tick as `updateDraft`, the revert on a failed or abandoned save,
 * and the belt for a patch the provider swallowed.
 *
 * What stays here is the Now card's own shape. Only fields the member touched
 * go into the patch, compared against `seed` (frozen at mount), not the live
 * `profile` prop, though `save()` still PATCHes the whole
 * `draftToUpdateDto(draft)`. An untouched field surviving a concurrent change
 * relies on `useProfileDraftState`'s own re-seed effect keeping `draft`
 * mirroring the committed profile for as long as this modal is open (it stops
 * only while `isEditing`, which this modal never sets).
 */
export function useUpdateNowSave(profile: MemberProfile, onClose: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isSaving, saveError } = useProfileEdit();

  // Frozen at mount: Save diffs against THIS, not the live `profile` prop, so
  // a `["profile"]` refetch mid-open never makes an untouched field "changed".
  const [seed] = useState(() => ({
    now: profile.now,
    notHereFor: profile.notHereFor ?? "",
    openTo: profile.openTo,
  }));

  const [now, setNow] = useState(seed.now);
  const [notHereFor, setNotHereFor] = useState(seed.notHereFor);
  const [openTo, setOpenTo] = useState<OpenToEntry[]>(seed.openTo);

  // Gates the banner on THIS modal having saved (`saveError` is session-
  // scoped, so an earlier unrelated failure would otherwise greet the member
  // on open); `localError` is for the swallowed-patch case, which `saveError`
  // can't cover (no save was ever attempted for it).
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const saveDraftPatch = useDeferredDraftSave({
    onSaved: () => {
      void queryClient.invalidateQueries({ queryKey: ["nowInsights"] });
      onClose();
    },
    onPatchLost: () => setLocalError(t("shared:profile.saveError")),
  });

  function handleSave() {
    const patch: Partial<ProfileDraft> = {};
    if (now !== seed.now) patch.now = now;
    if (notHereFor !== seed.notHereFor) patch.notHereFor = notHereFor;
    if (!isSameOpenTo(openTo, seed.openTo)) patch.openTo = openTo;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setHasAttemptedSave(true);
    setLocalError(null);
    // A second click before this one settles is dropped inside the hook, so
    // the first record is never orphaned and its revert never made a no-op.
    saveDraftPatch(patch);
  }

  return {
    now,
    setNow,
    notHereFor,
    setNotHereFor,
    openTo,
    setOpenTo,
    isSaving,
    visibleError: hasAttemptedSave ? (saveError ?? localError) : null,
    handleSave,
  };
}
