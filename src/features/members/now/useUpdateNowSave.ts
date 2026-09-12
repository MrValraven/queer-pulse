import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProfileEdit,
  type ProfileDraft,
} from "../../../app/providers/useProfile";
import type { OpenToEntry } from "../openTo.data";
import type { MemberProfile } from "../data/memberProfiles";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/** A patch handed to `updateDraft`, what those keys held before it (to undo
 *  a failed/abandoned save), and whether `save()` has started for it (so the
 *  effect below never fires twice, and the belt never mistakes in-flight
 *  for silently-never-applied). */
interface PendingSave {
  patch: Partial<ProfileDraft>;
  previous: Partial<ProfileDraft>;
  hasStarted: boolean;
}

const isSameOpenTo = (a: OpenToEntry[], b: OpenToEntry[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * `UpdateNowModal`'s local field state plus its save lifecycle, split out of
 * the component so the JSX stays under the 200-line cap. Not a candidate for
 * sharing with `useProfilePageSheets`/`useInstantVisibilitySave` (which have
 * the same shape but their own call sites and are out of scope here): this
 * hook is private to this one modal.
 *
 * Persists via the shared profile-edit session (`useProfileEdit`, the same
 * one `ProfileEditBar`/`useProfilePageSheets` drive), not a bare
 * `useUpdateProfile` call: `save()` commits onto the profile every screen
 * reads (via `mergeSavedProfile`); in demo mode (default; no server to
 * refetch from) nothing else would.
 *
 * `save` is a `useCallback` closed over the draft at render time, so calling
 * it in the same tick as `updateDraft` ships the pre-patch draft, the same
 * trap `useProfilePageSheets` documents for the rail's 24h-hide toggle. The
 * effect below waits for `draft` ITSELF to carry the patch rather than for
 * `save`'s identity to change, since that also changes for unrelated reasons
 * (`I18nProvider` background-prefetches ~30 lazy namespaces after first
 * paint, each bumping `t` and so `save`) and could fire one render too early.
 *
 * Only fields the member touched go into the patch, compared against `seed`
 * (frozen at mount), not the live `profile` prop, though `save()` still
 * PATCHes the whole `draftToUpdateDto(draft)`. An untouched field surviving a
 * concurrent change relies on `useProfileDraftState`'s own re-seed effect
 * keeping `draft` mirroring the committed profile for as long as this modal
 * is open (it stops only while `isEditing`, which this modal never sets).
 *
 * A failed or abandoned save must not leave its patch in the SHARED draft,
 * or the next save from ANY surface ships it too. `previous` is restored via
 * `updateDraft` on a rejected `save()`, and, if this modal closes
 * (Cancel/Escape/X) BEFORE that save ever started, via the unmount cleanup,
 * mirroring `useInstantVisibilitySave`'s revert in
 * `WhoSeesWhatFieldToggles.tsx`. A save already in flight when the modal
 * closes is left alone: it owns its own outcome either way, via the IIFE's
 * supersede guard, so the cleanup reverting it too would race a PATCH that
 * later succeeds and commits against the draft the cleanup just erased.
 */
export function useUpdateNowSave(profile: MemberProfile, onClose: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { draft, updateDraft, save, isSaving, saveError } = useProfileEdit();

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
  // on open); `localError` is for the belt below, which `saveError` can't cover.
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const pending = useRef<PendingSave | null>(null);

  useEffect(() => {
    const current = pending.current;
    if (!current || current.hasStarted) return;
    const isPatchApplied = (
      Object.keys(current.patch) as (keyof ProfileDraft)[]
    ).every((key) => draft[key] === current.patch[key]);
    if (!isPatchApplied) return;
    current.hasStarted = true;
    void (async () => {
      const hasSaved = await save();
      // Already reverted by the unmount cleanup, or superseded.
      if (pending.current !== current) return;
      pending.current = null;
      if (hasSaved) {
        void queryClient.invalidateQueries({ queryKey: ["nowInsights"] });
        onClose();
        return;
      }
      updateDraft(current.previous);
    })();
  }, [draft, save, updateDraft, queryClient, onClose]);

  useEffect(() => {
    return () => {
      if (pending.current && !pending.current.hasStarted) {
        updateDraft(pending.current.previous);
        pending.current = null;
      }
    };
  }, [updateDraft]);

  function handleSave() {
    // A second click before `isSaving` flips true would recompute `previous`
    // from the already-patched draft, making a later revert a no-op, and
    // orphan the first record.
    if (pending.current) return;
    const patch: Partial<ProfileDraft> = {};
    if (now !== seed.now) patch.now = now;
    if (notHereFor !== seed.notHereFor) patch.notHereFor = notHereFor;
    if (!isSameOpenTo(openTo, seed.openTo)) patch.openTo = openTo;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    const previous = Object.fromEntries(
      (Object.keys(patch) as (keyof ProfileDraft)[]).map((key) => [
        key,
        draft[key],
      ]),
    ) as Partial<ProfileDraft>;
    const record: PendingSave = { patch, previous, hasStarted: false };
    setHasAttemptedSave(true);
    setLocalError(null);
    pending.current = record;
    updateDraft(patch);
    // Belt: if the provider's re-seed batches in and wins, `draft` never
    // carries this patch and the effect above never starts. Drop an
    // unclaimed record after a tick and say so (one already started is left).
    setTimeout(() => {
      if (pending.current !== record || record.hasStarted) return;
      pending.current = null;
      setLocalError(t("shared:profile.saveError"));
    }, 0);
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
