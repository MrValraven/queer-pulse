import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import type {
  StudioArtistRefView,
  StudioReleaseView,
} from "./api/studio.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioRelease } from "./api/useStudioRelease";
import {
  useCreateStudioRelease,
  useUpdateStudioRelease,
} from "./api/useStudioReleaseMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  defaultReleaseForm,
  formFromRelease,
  patchFromForm,
  releaseFormErrors,
  type ReleaseFormValues,
  type UploadStepId,
} from "./studioUploadDraft.data";

const AUTOSAVE_DELAY_MS = 800;

export interface StudioUploadDraft {
  /** The step on screen: Release until the draft exists, and Tracks when a
   *  published release asks for Publish. */
  step: UploadStepId;
  canReach: (step: UploadStepId) => boolean;
  goTo: (step: UploadStepId) => void;
  personas: StudioArtistRefView[];
  persona: StudioArtistRefView | null;
  form: ReleaseFormValues;
  setField: <Key extends keyof ReleaseFormValues>(
    key: Key,
    value: ReleaseFormValues[Key],
  ) => void;
  release: StudioReleaseView | null;
  isEditingExisting: boolean;
  editLoadState: StudioLoadState | null;
  isSaving: boolean;
  saveErrorKey: string | null;
  shouldShowErrors: boolean;
  continueToTracks: () => Promise<void>;
  /** Published: there is no Publish step; tracks still change (Studio v3). */
  isPublished: boolean;
  /** Published or scheduled: details save on "Save changes", so a half-typed
   *  title never reaches the live page or breaks the publish rule. */
  hasLiveDetails: boolean;
  /** Taken down: nothing edits. */
  isTakenDown: boolean;
  /** A published release's details differ from what is saved. */
  hasUnsavedChanges: boolean;
  /** "Save changes" went through and nothing was edited since. */
  hasSavedChanges: boolean;
  saveChanges: () => Promise<void>;
  /** Set by the Publish step; the page then shows the submitted panel. */
  publishedRelease: StudioReleaseView | null;
  markPublished: (release: StudioReleaseView) => void;
}

/** A refused save as a catalog key. A member under a restriction gets the
 *  shared restriction line (the server's 403 sentence, translated); a Studio
 *  code gets its own line; anything else gets the generic one. */
function saveErrorKeyOf(error: unknown): string {
  return studioErrorMessageKeyOf(error);
}

const hasChanges = (form: ReleaseFormValues, release: StudioReleaseView) =>
  Object.keys(patchFromForm(form, release)).length > 0;

/**
 * Saves a draft's details after a short pause. Published releases save on
 * "Save changes" alone, so a half-typed title never reaches the live page.
 * Waits for the debounce to settle (a form just reseeded from another
 * release never saves onto this one), and runs again when the draft is
 * created, so edits typed during a slow create are kept.
 */
function useDraftAutosave(
  release: StudioReleaseView | null,
  form: ReleaseFormValues,
  onSaved: (sentCoverKey: string | undefined) => void,
  onFailed: (error: unknown) => void,
) {
  const update = useUpdateStudioRelease();
  const debouncedForm = useDebouncedValue(form, AUTOSAVE_DELAY_MS);
  useEffect(() => {
    if (!release || release.status !== "draft" || debouncedForm !== form)
      return;
    // A half-typed title or buy link waits for the member: the server
    // refuses both (400), so they never autosave.
    const errors = releaseFormErrors(debouncedForm);
    if (errors.title || errors.buyUrl) return;
    const body = patchFromForm(debouncedForm, release);
    if (Object.keys(body).length === 0) return;
    update.mutate(
      { releaseId: release.id, body },
      { onSuccess: () => onSaved(body.coverKey), onError: onFailed },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on the settled form and on a new draft id alone
  }, [debouncedForm, release?.id]);
}

/**
 * The upload flow's state. The draft is created when the member leaves the
 * release step, its id goes into the URL (`?release=`) so a reload resumes
 * it, and every later edit to a draft saves itself after a short pause.
 */
export function useStudioUploadDraft(): StudioUploadDraft {
  const [searchParams, setSearchParams] = useSearchParams();
  const releaseId = searchParams.get("release");
  const { uploadablePersonas } = useStudioAccess();
  const { release, loadState } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  const create = useCreateStudioRelease();
  const update = useUpdateStudioRelease();
  const [form, setForm] = useState<ReleaseFormValues>(() =>
    defaultReleaseForm(uploadablePersonas[0]),
  );
  const [requestedStep, setRequestedStep] = useState<UploadStepId>("release");
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [publishedRelease, setPublishedRelease] =
    useState<StudioReleaseView | null>(null);
  const [seededReleaseId, setSeededReleaseId] = useState<string | null>(null);
  // The saved release date the form last followed (see the reseed below).
  const [seededReleasedOn, setSeededReleasedOn] = useState<string | null>(null);
  const [trackedReleaseId, setTrackedReleaseId] = useState(releaseId);
  const isMountedRef = useRef(false);
  const isCreatingRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const isSaving = create.isPending || update.isPending;
  const isPublished = release?.status === "published";
  const hasLiveDetails = isPublished || release?.status === "scheduled";
  const isTakenDown = release?.status === "taken_down";

  // Back at /studio/upload with no ?release= ("Upload another release"):
  // a fresh draft, with nothing carried over from the last one.
  if (trackedReleaseId !== releaseId) {
    setTrackedReleaseId(releaseId);
    if (releaseId === null) {
      setForm(defaultReleaseForm(uploadablePersonas[0]));
      setRequestedStep("release");
      setSaveErrorKey(null);
      setShouldShowErrors(false);
      setHasSavedChanges(false);
      setPublishedRelease(null);
      setSeededReleaseId(null);
      setSeededReleasedOn(null);
    }
  }

  // Seed the form once from a release opened for editing.
  if (release && seededReleaseId !== release.id) {
    setSeededReleaseId(release.id);
    setSeededReleasedOn(release.releasedOn);
    setForm(formFromRelease(release));
  } else if (release && release.releasedOn !== seededReleasedOn) {
    // The server moves the release date by itself: scheduling fills an empty
    // one (and a new date moves it), Cancel schedule clears a filled one and
    // Publish now sets today. The field follows the saved value while it
    // still shows the last one, so a member's unsaved typing stays and the
    // next save sends no stale date back.
    const previousSaved = seededReleasedOn ?? "";
    const nextSaved = release.releasedOn ?? "";
    setSeededReleasedOn(release.releasedOn);
    setForm((previous) =>
      previous.releasedOn === previousSaved
        ? { ...previous, releasedOn: nextSaved }
        : previous,
    );
  }

  // A persona picked after the first render (access answered late). Merged,
  // so anything typed before access answered stays.
  const fallbackPersona = uploadablePersonas[0];
  if (!release && !form.subprofileId && fallbackPersona) {
    setForm((previous) => ({
      ...previous,
      subprofileId: fallbackPersona.id,
      type: defaultReleaseForm(fallbackPersona).type,
    }));
  }

  const clearSentCover = (sentKey: string | undefined) => {
    if (sentKey)
      setForm((previous) =>
        previous.coverKey === sentKey
          ? { ...previous, coverKey: null }
          : previous,
      );
  };
  const reportError = (error: unknown) => {
    if (isMountedRef.current) setSaveErrorKey(saveErrorKeyOf(error));
  };

  useDraftAutosave(
    release,
    form,
    (sentCoverKey) => {
      setSaveErrorKey(null);
      clearSentCover(sentCoverKey);
    },
    reportError,
  );

  const canReach = (target: UploadStepId) =>
    target === "release" ||
    (release !== null && !isTakenDown && (target === "tracks" || !isPublished));

  async function continueToTracks() {
    // The button stays focusable while busy (aria-disabled), so a second
    // press lands here: one create per draft.
    if (isCreatingRef.current) return;
    const errors = releaseFormErrors(form);
    if (errors.title || errors.description || errors.buyUrl) {
      setShouldShowErrors(true);
      return;
    }
    setSaveErrorKey(null);
    isCreatingRef.current = true;
    try {
      let current = release;
      if (!current) {
        current = await create.mutateAsync({
          subprofileId: form.subprofileId,
          type: form.type,
          title: form.title.trim(),
        });
        // The member left the page mid-create: the draft exists, and the
        // URL they moved to stays theirs.
        if (!isMountedRef.current) return;
        setSeededReleaseId(current.id);
        setSeededReleasedOn(current.releasedOn);
        const createdId = current.id;
        setSearchParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            next.set("release", createdId);
            return next;
          },
          { replace: true },
        );
      }
      const body = patchFromForm(form, current);
      if (Object.keys(body).length > 0) {
        await update.mutateAsync({ releaseId: current.id, body });
        clearSentCover(body.coverKey);
      }
      if (isMountedRef.current) setRequestedStep("tracks");
    } catch (error) {
      reportError(error);
    } finally {
      isCreatingRef.current = false;
    }
  }

  async function saveChanges() {
    if (!release || isSaving || !hasChanges(form, release)) return;
    const errors = releaseFormErrors(form);
    if (errors.title || errors.description || errors.buyUrl) {
      setShouldShowErrors(true);
      return;
    }
    const body = patchFromForm(form, release);
    setSaveErrorKey(null);
    try {
      await update.mutateAsync({ releaseId: release.id, body });
      clearSentCover(body.coverKey);
      setHasSavedChanges(true);
    } catch (error) {
      reportError(error);
    }
  }

  let persona: StudioArtistRefView | null = null;
  if (release) persona = release.artist;
  else if (releaseId === null)
    persona =
      uploadablePersonas.find(
        (candidate) => candidate.id === form.subprofileId,
      ) ?? null;

  return {
    step:
      release === null
        ? "release"
        : requestedStep === "publish" && isPublished
          ? "tracks"
          : requestedStep,
    canReach,
    goTo: (target) => {
      if (canReach(target)) setRequestedStep(target);
    },
    personas: uploadablePersonas,
    persona,
    form,
    setField: (key, value) => {
      setHasSavedChanges(false);
      setForm((previous) => ({ ...previous, [key]: value }));
    },
    release,
    isEditingExisting: releaseId !== null,
    editLoadState: releaseId !== null ? loadState : null,
    isSaving,
    saveErrorKey,
    shouldShowErrors,
    continueToTracks,
    isPublished,
    hasLiveDetails,
    isTakenDown,
    hasUnsavedChanges: release !== null && hasChanges(form, release),
    hasSavedChanges,
    saveChanges,
    publishedRelease,
    markPublished: setPublishedRelease,
  };
}
