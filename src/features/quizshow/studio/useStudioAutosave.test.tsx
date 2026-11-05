import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import type { QuizshowSaveOutcome } from "../builder/useQuizshowSave";
import {
  STUDIO_AUTOSAVE_IDLE_MS,
  STUDIO_AUTOSAVE_MIN_GAP_MS,
  useStudioAutosave,
  type StudioAutosaveOptions,
} from "./useStudioAutosave";

const OPTION_COUNT_PROBLEM: QuizshowLocalProblem = {
  code: "option_count",
  roundIndex: 0,
  questionIndex: 1,
  language: null,
};

/** A save that answers only when the test resolves it. */
function deferredSaves() {
  const resolvers: Array<(outcome: QuizshowSaveOutcome) => void> = [];
  const saveNow = vi.fn(
    () =>
      new Promise<QuizshowSaveOutcome>((resolve) => {
        resolvers.push(resolve);
      }),
  );
  /** Answers the save at `index` (in call order). */
  const answer = async (index: number, outcome: QuizshowSaveOutcome) => {
    await act(async () => {
      resolvers[index]?.(outcome);
      await vi.advanceTimersByTimeAsync(0);
    });
  };
  /** Answers the save at `index` without leaving the caller's act. */
  const resolveNow = (index: number, outcome: QuizshowSaveOutcome) => {
    resolvers[index]?.(outcome);
  };
  return { saveNow, answer, resolveNow };
}

function setup(
  outcomes: QuizshowSaveOutcome[] = [],
  customSaveNow?: () => Promise<QuizshowSaveOutcome>,
) {
  const queue = [...outcomes];
  const saveNow =
    customSaveNow ?? vi.fn(() => Promise.resolve(queue.shift() ?? "saved"));
  let editCount = 0;
  const initialProps: StudioAutosaveOptions = {
    isEnabled: true,
    isDirty: false,
    structuralProblem: null,
    saveNow,
    isConflictResolved: true,
    editKey: { editCount },
  };
  const hook = renderHook(
    (props: StudioAutosaveOptions) => useStudioAutosave(props),
    { initialProps },
  );
  let props = initialProps;
  const rerender = (patch: Partial<StudioAutosaveOptions>) => {
    props = { ...props, ...patch };
    hook.rerender(props);
  };
  /** A new edit: a new edit key on a dirty draft. */
  const edit = (patch: Partial<StudioAutosaveOptions> = {}) => {
    editCount += 1;
    rerender({ isDirty: true, editKey: { editCount }, ...patch });
  };
  return { hook, saveNow, edit, rerender };
}

/** Moves the clock and lets the save's promise settle. */
async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

describe("useStudioAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves nothing before 3000 ms without an edit", async () => {
    const { hook, saveNow, edit } = setup();
    edit();
    expect(hook.result.current.status).toBe("unsaved");
    await advance(STUDIO_AUTOSAVE_IDLE_MS - 1);
    expect(saveNow).not.toHaveBeenCalled();
    await advance(1);
    expect(saveNow).toHaveBeenCalledTimes(1);
  });

  it("with two edits 2 s apart, saves once, 3 s after the second", async () => {
    const { hook, saveNow, edit, rerender } = setup();
    edit();
    await advance(2000);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS - 1);
    expect(saveNow).not.toHaveBeenCalled();
    await advance(1);
    expect(saveNow).toHaveBeenCalledTimes(1);
    // The save's reset leaves the draft clean.
    rerender({ isDirty: false });
    expect(hook.result.current.status).toBe("saved");
    await advance(10_000);
    expect(saveNow).toHaveBeenCalledTimes(1);
  });

  it("never starts two saves under 8000 ms apart", async () => {
    const { saveNow, edit, rerender } = setup();
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(saveNow).toHaveBeenCalledTimes(1);
    rerender({ isDirty: false });
    // An edit 500 ms after the save would be idle at 6500 ms, inside the gap.
    await advance(500);
    edit();
    await advance(STUDIO_AUTOSAVE_MIN_GAP_MS - 500 - 1);
    expect(saveNow).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(saveNow).toHaveBeenCalledTimes(2);
  });

  it("holds on a structural problem, naming it", async () => {
    const { hook, saveNow, edit } = setup();
    edit({ structuralProblem: OPTION_COUNT_PROBLEM });
    await advance(20_000);
    expect(saveNow).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe("held");
    expect(hook.result.current.reasonKey).toBe(
      "quizshow:problems.option_count",
    );
  });

  it("stops saving on a conflict until it is resolved", async () => {
    const { hook, saveNow, edit, rerender } = setup(["conflict"]);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(saveNow).toHaveBeenCalledTimes(1);
    rerender({ isConflictResolved: false });
    expect(hook.result.current.status).toBe("conflict");
    edit();
    await advance(30_000);
    expect(saveNow).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe("conflict");

    rerender({ isConflictResolved: true });
    expect(hook.result.current.status).toBe("unsaved");
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(saveNow).toHaveBeenCalledTimes(2);
  });

  it("keeps a reason on a failed save and retries on the next edit", async () => {
    const { hook, saveNow, edit } = setup(["failed", "saved"]);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(saveNow).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe("failed");
    expect(hook.result.current.reasonKey).not.toBeNull();
    await advance(30_000);
    expect(saveNow).toHaveBeenCalledTimes(1);

    // The reason stays on screen until a save goes through.
    edit();
    expect(hook.result.current.status).toBe("failed");
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(saveNow).toHaveBeenCalledTimes(2);
    expect(hook.result.current.status).toBe("unsaved");
    expect(hook.result.current.reasonKey).toBeNull();
  });

  it("saves an edit made while a save was in flight, after the gap", async () => {
    const deferred = deferredSaves();
    const { hook, edit } = setup([], deferred.saveNow);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe("saving");
    // Typed at 3500 ms, while the first save is still out.
    await advance(500);
    edit();
    await deferred.answer(0, "saved");
    // The draft is still dirty against the new baseline: one more save,
    // 8 s after the first one started.
    expect(hook.result.current.status).toBe("unsaved");
    await advance(STUDIO_AUTOSAVE_MIN_GAP_MS - 500 - 1);
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(deferred.saveNow).toHaveBeenCalledTimes(2);
  });

  it("a flush during a save runs once that save ends", async () => {
    const deferred = deferredSaves();
    const { hook, edit } = setup([], deferred.saveNow);
    edit();
    act(() => {
      hook.result.current.flush();
    });
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    edit();
    act(() => {
      hook.result.current.flush();
    });
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    await deferred.answer(0, "saved");
    await advance(0);
    expect(deferred.saveNow).toHaveBeenCalledTimes(2);
  });

  it("waits for a save outside the hook", async () => {
    const { saveNow, edit, rerender } = setup();
    edit({ isSaveInFlight: true });
    await advance(20_000);
    expect(saveNow).not.toHaveBeenCalled();
    rerender({ isSaveInFlight: false });
    await advance(0);
    expect(saveNow).toHaveBeenCalledTimes(1);
  });

  it("flush saves at once", async () => {
    const { hook, saveNow, edit } = setup();
    edit();
    act(() => {
      hook.result.current.flush();
    });
    expect(saveNow).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe("saving");
    await advance(0);
    expect(hook.result.current.status).toBe("unsaved");
  });

  it("never autosaves when disabled (template scope)", async () => {
    const { hook, saveNow, edit } = setup();
    edit({ isEnabled: false });
    await advance(30_000);
    expect(saveNow).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe("unsaved");
  });
});

describe("useStudioAutosave saveAndWait", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("saveAndWait waits for an autosave in flight, then saves", async () => {
    const deferred = deferredSaves();
    const { hook, edit } = setup([], deferred.saveNow);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    let isStored: boolean | null = null;
    act(() => {
      void hook.result.current.saveAndWait().then((result) => {
        isStored = result;
      });
    });
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    await deferred.answer(0, "saved");
    await advance(0);
    // The host typed during the first save, so the draft is still dirty.
    expect(deferred.saveNow).toHaveBeenCalledTimes(2);
    expect(isStored).toBeNull();
    await deferred.answer(1, "saved");
    expect(isStored).toBe(true);
  });

  it("saveAndWait skips the PUT when the awaited save left the draft clean", async () => {
    const deferred = deferredSaves();
    const { hook, edit, rerender } = setup([], deferred.saveNow);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    let isStored: boolean | null = null;
    act(() => {
      void hook.result.current.saveAndWait().then((result) => {
        isStored = result;
      });
    });
    // The save answers and its reset leaves the draft clean in the same render.
    await act(async () => {
      deferred.resolveNow(0, "saved");
      await Promise.resolve();
      rerender({ isDirty: false });
    });
    await advance(0);
    expect(isStored).toBe(true);
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
  });

  it("saveAndWait waits for a save outside the hook (Save mine)", async () => {
    const { hook, saveNow, edit, rerender } = setup();
    edit({ isSaveInFlight: true });
    let isStored: boolean | null = null;
    act(() => {
      void hook.result.current.saveAndWait().then((result) => {
        isStored = result;
      });
    });
    await advance(0);
    expect(saveNow).not.toHaveBeenCalled();
    expect(isStored).toBeNull();
    rerender({ isSaveInFlight: false });
    await advance(0);
    expect(saveNow).toHaveBeenCalledTimes(1);
    expect(isStored).toBe(true);
  });

  it("saveAndWait resolves false while a conflict is unresolved", async () => {
    const { hook, saveNow, edit } = setup();
    edit({ isConflictResolved: false });
    let isStored: boolean | null = null;
    await act(async () => {
      isStored = await hook.result.current.saveAndWait();
    });
    expect(isStored).toBe(false);
    expect(saveNow).not.toHaveBeenCalled();
  });

  it("saveAndWait stops on a conflict from the save in flight", async () => {
    const deferred = deferredSaves();
    const { hook, edit } = setup([], deferred.saveNow);
    edit();
    await advance(STUDIO_AUTOSAVE_IDLE_MS);
    let isStored: boolean | null = null;
    act(() => {
      void hook.result.current.saveAndWait().then((result) => {
        isStored = result;
      });
    });
    await deferred.answer(0, "conflict");
    expect(isStored).toBe(false);
    expect(deferred.saveNow).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe("conflict");
  });
});
