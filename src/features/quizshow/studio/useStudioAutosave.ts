import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import type { QuizshowSaveOutcome } from "../builder/useQuizshowSave";

/**
 * The studio's save status: saved, a save in flight, edits waiting for the
 * idle timer, held by a problem the server would refuse, the last save
 * failed, or paused by a newer version someone else saved.
 */
export type QuizshowStudioSaveStatus =
  "saved" | "saving" | "unsaved" | "held" | "failed" | "conflict";

/** An autosave waits this long after the last edit. */
export const STUDIO_AUTOSAVE_IDLE_MS = 3000;
/**
 * Two saves start at least this far apart. The backend allows 120 requests a
 * minute per IP and every save replaces the whole quiz, so autosave is
 * rationed.
 */
export const STUDIO_AUTOSAVE_MIN_GAP_MS = 8000;

/** Shown when the save could not say why it failed; the controller passes the real reason over it. */
export const STUDIO_SAVE_FAILED_KEY = "quizshow:save.error";
/** The server refused the quiz as invalid. */
export const STUDIO_SAVE_REFUSED_KEY = "quizshow:save.invalid";

export interface StudioAutosaveOptions {
  /** False in template scope, where staff save explicitly. */
  isEnabled: boolean;
  isDirty: boolean;
  /** A problem the server would refuse the save over; it holds autosave. */
  structuralProblem: QuizshowLocalProblem | null;
  saveNow: () => Promise<QuizshowSaveOutcome>;
  /** False while a 409 waits for the host's pick; autosave resumes when it turns true. */
  isConflictResolved: boolean;
  /**
   * Anything whose identity changes on every edit (the draft object). Each
   * change restarts the idle wait, and an edit after a failed save retries.
   */
  editKey: unknown;
  /** A save outside this hook is in flight (the conflict's "Save mine"); autosave waits for it. */
  isSaveInFlight?: boolean;
}

export interface StudioAutosave {
  status: QuizshowStudioSaveStatus;
  /** Why the status is held or failed, as a catalog key; null otherwise. */
  reasonKey: string | null;
  /** Saves now (Cmd/Ctrl+S), skipping the idle wait and the gap; during a save, right after it. */
  flush: () => void;
  /**
   * Waits for a save in flight, then saves; true once the quiz is stored.
   * The leave guard's "Save and leave" goes through here, so it never races
   * an autosave and a 409 from it pauses autosave like any other.
   */
  saveAndWait: () => Promise<boolean>;
}

type SaveFailureOutcome = "failed" | "refused";

interface SaveFailure {
  /** The edit the failed save sent; the next edit retries. */
  editKey: unknown;
  outcome: SaveFailureOutcome;
}

/** The status and its reason, from the hook's state and the draft. */
function statusOf(input: {
  isSaving: boolean;
  isConflictPaused: boolean;
  shownFailure: SaveFailureOutcome | null;
  isDirty: boolean;
  structuralProblem: QuizshowLocalProblem | null;
}): { status: QuizshowStudioSaveStatus; reasonKey: string | null } {
  const { shownFailure, structuralProblem } = input;
  if (input.isSaving) return { status: "saving", reasonKey: null };
  if (input.isConflictPaused) return { status: "conflict", reasonKey: null };
  if (!input.isDirty) return { status: "saved", reasonKey: null };
  if (shownFailure === "failed") {
    return { status: "failed", reasonKey: STUDIO_SAVE_FAILED_KEY };
  }
  if (structuralProblem !== null) {
    return {
      status: "held",
      reasonKey: `quizshow:problems.${structuralProblem.code}`,
    };
  }
  if (shownFailure === "refused") {
    return { status: "held", reasonKey: STUDIO_SAVE_REFUSED_KEY };
  }
  return { status: "unsaved", reasonKey: null };
}

/**
 * One save at a time: a second request while one is in flight gets that
 * one's promise. Records when each save started, for the gap.
 */
function useSerialSave(options: {
  latestRef: {
    current: { saveNow: () => Promise<QuizshowSaveOutcome>; editKey: unknown };
  };
  onSettled: (outcome: QuizshowSaveOutcome, sentEditKey: unknown) => void;
  setIsSaving: (isSaving: boolean) => void;
}) {
  const { latestRef, onSettled, setIsSaving } = options;
  const inFlightRef = useRef<Promise<QuizshowSaveOutcome> | null>(null);
  const lastSaveStartedAtRef = useRef(Number.NEGATIVE_INFINITY);
  const runSave = useCallback((): Promise<QuizshowSaveOutcome> => {
    if (inFlightRef.current !== null) return inFlightRef.current;
    lastSaveStartedAtRef.current = Date.now();
    const sentEditKey = latestRef.current.editKey;
    setIsSaving(true);
    const request = latestRef.current
      .saveNow()
      .catch((): QuizshowSaveOutcome => "failed")
      .then((outcome) => {
        inFlightRef.current = null;
        setIsSaving(false);
        onSettled(outcome, sentEditKey);
        return outcome;
      });
    inFlightRef.current = request;
    return request;
  }, [latestRef, onSettled, setIsSaving]);
  return { runSave, inFlightRef, lastSaveStartedAtRef };
}

/**
 * Counts commits, and resolves a wait once a commit after `count` lands, so
 * an async caller can read refs a later render has synced.
 */
function useCommitWaiters() {
  const commitCountRef = useRef(0);
  const waitersRef = useRef<Array<{ count: number; resolve: () => void }>>([]);
  useEffect(() => {
    commitCountRef.current += 1;
    const committed = commitCountRef.current;
    const ready = waitersRef.current.filter(
      (waiter) => waiter.count < committed,
    );
    waitersRef.current = waitersRef.current.filter(
      (waiter) => waiter.count >= committed,
    );
    for (const waiter of ready) waiter.resolve();
  });
  const commitAfter = useCallback((count: number): Promise<void> => {
    if (commitCountRef.current > count) return Promise.resolve();
    return new Promise((resolve) => {
      waitersRef.current.push({ count, resolve });
    });
  }, []);
  return { commitCountRef, commitAfter };
}

/**
 * Rationed autosave for the studio: a save starts 3 s after the last edit,
 * never sooner than 8 s after the previous one, and only while the draft is
 * dirty, free of structural problems and clear of any conflict or other save.
 * A failed or refused save waits for the next edit (its status stays until a
 * save succeeds); a 409 pauses everything until the host resolves it.
 */
export function useStudioAutosave(
  options: StudioAutosaveOptions,
): StudioAutosave {
  const {
    isEnabled,
    isDirty,
    structuralProblem,
    saveNow,
    isConflictResolved,
    editKey,
    isSaveInFlight = false,
  } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [isConflictPaused, setIsConflictPaused] = useState(false);
  // The retry gate: a failure counts until the next edit after the one it sent.
  const [failure, setFailure] = useState<SaveFailure | null>(null);
  // What the status shows: kept until a save succeeds.
  const [shownFailure, setShownFailure] = useState<SaveFailureOutcome | null>(
    null,
  );
  if (!isDirty && shownFailure !== null) setShownFailure(null);
  // The host's pick (their version or mine) flips this back to true.
  const [wasConflictResolved, setWasConflictResolved] =
    useState(isConflictResolved);
  if (wasConflictResolved !== isConflictResolved) {
    setWasConflictResolved(isConflictResolved);
    if (isConflictResolved) setIsConflictPaused(false);
  }

  const lastEditAtRef = useRef(0);
  const latestRef = useRef({ saveNow, editKey });
  useEffect(() => {
    latestRef.current = { saveNow, editKey };
  }, [saveNow, editKey]);
  // Declared before the scheduling effect, so an edit's time is in place when it runs.
  useEffect(() => {
    lastEditAtRef.current = Date.now();
  }, [editKey]);

  const onSettled = useCallback(
    (outcome: QuizshowSaveOutcome, sentEditKey: unknown) => {
      if (outcome === "conflict") {
        setIsConflictPaused(true);
        setFailure(null);
      } else if (outcome === "failed" || outcome === "refused") {
        setFailure({ editKey: sentEditKey, outcome });
        setShownFailure(outcome);
      } else {
        setFailure(null);
        setShownFailure(null);
      }
    },
    [],
  );
  const { runSave, inFlightRef, lastSaveStartedAtRef } = useSerialSave({
    latestRef,
    onSettled,
    setIsSaving,
  });

  const isRetryHeld = failure !== null && Object.is(failure.editKey, editKey);
  const isBusy = isSaving || isSaveInFlight;
  const isFlushAllowed =
    isEnabled &&
    isDirty &&
    structuralProblem === null &&
    isConflictResolved &&
    !isConflictPaused;
  const shouldAutosave = isFlushAllowed && !isRetryHeld && !isBusy;

  // A flush asked for while a save was in flight runs once that save ends.
  const isFlushQueuedRef = useRef(false);
  useEffect(() => {
    if (isBusy) return undefined;
    let delay: number | null = null;
    if (isFlushQueuedRef.current) {
      if (isFlushAllowed) delay = 0;
      else isFlushQueuedRef.current = false;
    }
    if (delay === null && shouldAutosave) {
      const fireAt = Math.max(
        lastEditAtRef.current + STUDIO_AUTOSAVE_IDLE_MS,
        lastSaveStartedAtRef.current + STUDIO_AUTOSAVE_MIN_GAP_MS,
      );
      delay = Math.max(0, fireAt - Date.now());
    }
    if (delay === null) return undefined;
    const timer = setTimeout(() => {
      isFlushQueuedRef.current = false;
      void runSave();
    }, delay);
    return () => clearTimeout(timer);
  }, [
    isBusy,
    isFlushAllowed,
    shouldAutosave,
    editKey,
    runSave,
    lastSaveStartedAtRef,
  ]);

  // Flush and saveAndWait read the latest gate, so a stale callback never
  // saves a held draft.
  const isConflictUnresolved = !isConflictResolved || isConflictPaused;
  const gateRef = useRef({
    isFlushAllowed,
    isBusy,
    isDirty,
    isSaveInFlight,
    isConflictUnresolved,
  });
  useEffect(() => {
    gateRef.current = {
      isFlushAllowed,
      isBusy,
      isDirty,
      isSaveInFlight,
      isConflictUnresolved,
    };
  }, [isFlushAllowed, isBusy, isDirty, isSaveInFlight, isConflictUnresolved]);
  // Declared after the gate, so a commit's waiters read the gate it set.
  const { commitCountRef, commitAfter } = useCommitWaiters();
  const flush = useCallback(() => {
    if (!gateRef.current.isFlushAllowed) return;
    if (gateRef.current.isBusy || inFlightRef.current !== null) {
      isFlushQueuedRef.current = true;
      return;
    }
    void runSave();
  }, [runSave, inFlightRef]);

  const saveAndWait = useCallback(async () => {
    // Wait out every save in flight: ours, then one outside (Save mine).
    for (;;) {
      const inFlight = inFlightRef.current;
      if (inFlight !== null) {
        // Counted before the wait, so a commit that lands before this resumes
        // never strands it; the render after the answer holds its reset.
        const commitsBefore = commitCountRef.current;
        if ((await inFlight) === "conflict") return false;
        await commitAfter(commitsBefore);
      } else if (gateRef.current.isSaveInFlight) {
        await commitAfter(commitCountRef.current);
      } else {
        break;
      }
    }
    const gate = gateRef.current;
    if (gate.isConflictUnresolved) return false;
    // The awaited save already stored everything: no second PUT.
    if (!gate.isDirty) return true;
    return (await runSave()) === "saved";
  }, [runSave, inFlightRef, commitAfter, commitCountRef]);

  const { status, reasonKey } = statusOf({
    isSaving,
    isConflictPaused,
    shownFailure,
    isDirty,
    structuralProblem,
  });
  return { status, reasonKey, flush, saveAndWait };
}
