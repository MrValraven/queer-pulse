import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { expectDraftParam } from "./upload/useStudioUploadLeaveGuard";
import {
  defaultReleaseForm,
  formFromRelease,
  patchFromForm,
  priceFieldsForType,
  priceInputOf,
  releaseFormErrors,
  type ReleaseFormValues,
  type UploadStepId,
} from "./studioUploadDraft.data";

const AUTOSAVE_DELAY_MS = 800;

const UPLOAD_STEP_IDS: readonly UploadStepId[] = [
  "release",
  "tracks",
  "publish",
];

/** The step named in `?step=`; anything else reads as the release step. */
const stepFromParam = (value: string | null): UploadStepId =>
  UPLOAD_STEP_IDS.find((candidate) => candidate === value) ?? "release";

/** What the autosave line says about a draft's details:
 *  - `saving`: a change waits for the pause or is on its way;
 *  - `saved`: the server has everything typed (`savedAt` once this visit saved);
 *  - `notSaved`: the last save failed or a field blocks it (`reasonKey` says which);
 *  - `waitingForTitle`: the title is empty, and the server needs one;
 *  - `idle`: nothing to say (no draft yet, or details that save on a button). */
export type StudioAutosaveState =
  "idle" | "saving" | "saved" | "notSaved" | "waitingForTitle";

export interface StudioAutosaveStatus {
  state: StudioAutosaveState;
  savedAt: Date | null;
  reasonKey: string | null;
}

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
  /** Bumped by every refused Continue or Save changes, so the release step
   *  moves focus to the first invalid field each time. */
  errorFocusRequest: number;
  /** The honest autosave line of a draft (see StudioAutosaveState). */
  autosave: StudioAutosaveStatus;
  /** Details typed that the server does not have yet: a new release's
   *  form before the draft exists, or a release's unsaved edits. */
  hasUnsavedDetails: boolean;
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

/** An unreadable price counts as an edit: patchFromForm cannot send it, but
 *  the member typed it, so the error shows and the leave guard holds. */
const hasChanges = (form: ReleaseFormValues, release: StudioReleaseView) =>
  Object.keys(patchFromForm(form, release)).length > 0 ||
  priceInputOf(form.priceMode, form.priceText) === "invalid";

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
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (!release || release.status !== "draft" || debouncedForm !== form)
      return;
    // A half-typed title, buy link or price waits for the member: the server
    // refuses each, so they never autosave.
    const errors = releaseFormErrors(debouncedForm);
    if (errors.title || errors.buyUrl || errors.price) return;
    const body = patchFromForm(debouncedForm, release);
    if (Object.keys(body).length === 0) return;
    update.mutate(
      { releaseId: release.id, body },
      {
        onSuccess: () => {
          setSavedAt(new Date());
          onSaved(body.coverKey);
        },
        onError: onFailed,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on the settled form and on a new draft id alone
  }, [debouncedForm, release?.id]);
  return {
    savedAt,
    isPending: update.isPending || debouncedForm !== form,
  };
}

/** The autosave line, from what the draft knows. A failed save outranks a
 *  pending one, so "Not saved" never flips back to "Saving" by itself. */
function autosaveStatusOf(input: {
  release: StudioReleaseView | null;
  form: ReleaseFormValues;
  isPending: boolean;
  savedAt: Date | null;
  saveErrorKey: string | null;
}): StudioAutosaveStatus {
  const { release, form, savedAt } = input;
  const idle = { state: "idle", savedAt, reasonKey: null } as const;
  if (!release || release.status !== "draft") return idle;
  // An empty title never reads as saved: the server needs one first.
  if (!form.title.trim())
    return { state: "waitingForTitle", savedAt, reasonKey: null };
  const errors = releaseFormErrors(form);
  const isDirty = hasChanges(form, release);
  if (isDirty && (errors.title || errors.buyUrl || errors.price))
    return {
      state: "notSaved",
      savedAt,
      reasonKey: errors.title ?? errors.buyUrl ?? errors.price ?? null,
    };
  if (input.saveErrorKey)
    return { state: "notSaved", savedAt, reasonKey: input.saveErrorKey };
  if (input.isPending || isDirty)
    return { state: "saving", savedAt, reasonKey: null };
  return { state: "saved", savedAt, reasonKey: null };
}

/** The flow's address: `?release=` names the draft and `?step=` the step.
 *  Each step is its own history entry, so Back walks the steps and a reload
 *  keeps the member where they were. */
function useUploadAddress() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const releaseId = searchParams.get("release");
  // The step to open once a just-created draft's id is in the address. The
  // leave guard may still be landing that replace (it steps off its Back
  // sentinel first), so the step waits for it instead of racing it.
  const stepAfterReleaseRef = useRef<{
    releaseId: string;
    step: UploadStepId;
  } | null>(null);
  const navigateToStep = (target: UploadStepId) => {
    const next = new URLSearchParams(searchParams);
    if (target === "release") next.delete("step");
    else next.set("step", target);
    void navigate({ search: `?${next.toString()}` });
  };
  useEffect(() => {
    const pending = stepAfterReleaseRef.current;
    if (!pending || pending.releaseId !== releaseId) return;
    stepAfterReleaseRef.current = null;
    navigateToStep(pending.step);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the replace lands
  }, [releaseId]);
  return {
    releaseId,
    requestedStep: stepFromParam(searchParams.get("step")),
    navigateToStep,
    /** The new draft's id replaces the empty address, so a reload resumes
     *  it; `thenStep` opens once that address is the one on screen. */
    replaceWithRelease: (createdId: string, thenStep: UploadStepId) => {
      stepAfterReleaseRef.current = { releaseId: createdId, step: thenStep };
      // The leave guard lets an empty address take this id, and only this.
      expectDraftParam("release", createdId);
      const next = new URLSearchParams(searchParams);
      next.set("release", createdId);
      void navigate({ search: `?${next.toString()}` }, { replace: true });
    },
  };
}

/** The form once its picked cover reached the server (a newer pick stays). */
const withoutSentCover = (form: ReleaseFormValues, sentKey: string) =>
  form.coverKey === sentKey ? { ...form, coverKey: null } : form;

/** "Save changes" for a published or scheduled release: refused fields
 *  show their errors, anything else goes out as one PATCH. */
async function saveLiveDetails(input: {
  release: StudioReleaseView | null;
  form: ReleaseFormValues;
  isSaving: boolean;
  send: (body: ReturnType<typeof patchFromForm>) => Promise<unknown>;
  onRefused: () => void;
  onStart: () => void;
  onSaved: (sentCoverKey: string | undefined) => void;
  onFailed: (error: unknown) => void;
}) {
  const { release, form } = input;
  if (!release || input.isSaving || !hasChanges(form, release)) return;
  const errors = releaseFormErrors(form);
  if (errors.title || errors.description || errors.buyUrl || errors.price) {
    input.onRefused();
    return;
  }
  const body = patchFromForm(form, release);
  input.onStart();
  try {
    await input.send(body);
    input.onSaved(body.coverKey);
  } catch (error) {
    input.onFailed(error);
  }
}

/** What the page shows, derived: the persona, the step on screen (Tracks
 *  when a published release asks for Publish) and whether typed details
 *  would be lost (a new release counts its title, notes and a picked cover). */
function flowViewOf(input: {
  release: StudioReleaseView | null;
  releaseId: string | null;
  form: ReleaseFormValues;
  uploadablePersonas: StudioArtistRefView[];
  requestedStep: UploadStepId;
  canReach: (step: UploadStepId) => boolean;
}) {
  const { release, releaseId, form, requestedStep } = input;
  let persona: StudioArtistRefView | null = null;
  if (release) persona = release.artist;
  else if (releaseId === null)
    persona =
      input.uploadablePersonas.find(
        (candidate) => candidate.id === form.subprofileId,
      ) ?? null;
  let shownStep: UploadStepId = input.canReach(requestedStep)
    ? requestedStep
    : "release";
  if (requestedStep === "publish" && release?.status === "published")
    shownStep = "tracks";
  const hasUnsavedDetails =
    release !== null
      ? hasChanges(form, release)
      : releaseId === null &&
        (form.title.trim() !== "" ||
          form.description.trim() !== "" ||
          form.coverKey !== null);
  return { persona, shownStep, hasUnsavedDetails };
}

function useIsMountedRef() {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
}

/**
 * The upload flow's state. The draft is created when the member leaves the
 * release step, its id goes into the URL (`?release=`) so a reload resumes
 * it, and every later edit to a draft saves itself after a short pause.
 */
export function useStudioUploadDraft(): StudioUploadDraft {
  const address = useUploadAddress();
  const { releaseId, requestedStep, navigateToStep } = address;
  const { uploadablePersonas } = useStudioAccess();
  const { release, loadState } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  const create = useCreateStudioRelease();
  const update = useUpdateStudioRelease();
  const [form, setForm] = useState<ReleaseFormValues>(() =>
    defaultReleaseForm(uploadablePersonas[0]),
  );
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const [errorFocusRequest, setErrorFocusRequest] = useState(0);
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [publishedRelease, setPublishedRelease] =
    useState<StudioReleaseView | null>(null);
  const [seededReleaseId, setSeededReleaseId] = useState<string | null>(null);
  // The saved release date the form last followed (see the reseed below).
  const [seededReleasedOn, setSeededReleasedOn] = useState<string | null>(null);
  const [trackedReleaseId, setTrackedReleaseId] = useState(releaseId);
  const isMountedRef = useIsMountedRef();
  const isCreatingRef = useRef(false);
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
    // The server moves the release date itself (schedule, Cancel schedule,
    // Publish now). The field follows it while it still shows the last saved
    // value, so unsaved typing stays and no stale date is sent back.
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
    if (sentKey) setForm((previous) => withoutSentCover(previous, sentKey));
  };
  const reportError = (error: unknown) => {
    if (isMountedRef.current) setSaveErrorKey(saveErrorKeyOf(error));
  };

  const autosave = useDraftAutosave(
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

  function refuseWithErrors() {
    setShouldShowErrors(true);
    setErrorFocusRequest((previous) => previous + 1);
  }

  async function continueToTracks() {
    // The button stays focusable while busy (aria-disabled), so a second
    // press lands here: one create per draft.
    if (isCreatingRef.current) return;
    const errors = releaseFormErrors(form);
    if (errors.title || errors.description || errors.buyUrl || errors.price) {
      refuseWithErrors();
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
        // The tracks step lands as its own entry once this replace has.
        address.replaceWithRelease(current.id, "tracks");
      }
      const body = patchFromForm(form, current);
      if (Object.keys(body).length > 0) {
        await update.mutateAsync({ releaseId: current.id, body });
        clearSentCover(body.coverKey);
      }
      if (isMountedRef.current && release) navigateToStep("tracks");
    } catch (error) {
      reportError(error);
    } finally {
      isCreatingRef.current = false;
    }
  }

  const saveChanges = () =>
    saveLiveDetails({
      release,
      form,
      isSaving,
      send: (body) =>
        update.mutateAsync({ releaseId: release?.id ?? "", body }),
      onRefused: refuseWithErrors,
      onStart: () => setSaveErrorKey(null),
      onSaved: (sentCoverKey) => {
        clearSentCover(sentCoverKey);
        setHasSavedChanges(true);
      },
      onFailed: reportError,
    });

  const { persona, shownStep, hasUnsavedDetails } = flowViewOf({
    release,
    releaseId,
    form,
    uploadablePersonas,
    requestedStep,
    canReach,
  });

  return {
    step: release === null ? "release" : shownStep,
    canReach,
    goTo: (target) => {
      if (canReach(target) && target !== shownStep) navigateToStep(target);
    },
    personas: uploadablePersonas,
    persona,
    form,
    setField: (key, value) => {
      setHasSavedChanges(false);
      setForm((previous) => {
        const next = { ...previous, [key]: value };
        // A type with nothing to sell clears the price with it.
        return key === "type"
          ? { ...next, ...priceFieldsForType(next.type, next) }
          : next;
      });
    },
    release,
    isEditingExisting: releaseId !== null,
    editLoadState: releaseId !== null ? loadState : null,
    isSaving,
    saveErrorKey,
    shouldShowErrors,
    errorFocusRequest,
    autosave: autosaveStatusOf({
      release,
      form,
      isPending: autosave.isPending,
      savedAt: autosave.savedAt,
      saveErrorKey,
    }),
    hasUnsavedDetails,
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
