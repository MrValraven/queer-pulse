import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { PERSONA_EDIT_CONFLICT_CODE } from "./api/personaEditConflict";
import {
  personaRefusalMessageKey,
  runEditorSaveChain,
  type EditorSaveStep,
} from "./editorSaveChain";

/** A step that records the version it was sent and answers with `answer`. */
function savingStep(
  labelKey: string,
  sentVersions: number[],
  answerEditVersion: number,
): EditorSaveStep & { commit: ReturnType<typeof vi.fn> } {
  return {
    labelKey,
    run: vi.fn((expectedEditVersion: number) => {
      sentVersions.push(expectedEditVersion);
      return Promise.resolve({ editVersion: answerEditVersion });
    }),
    commit: vi.fn(),
  };
}

function failingStep(
  labelKey: string,
  error: Error,
): EditorSaveStep & { commit: ReturnType<typeof vi.fn> } {
  return {
    labelKey,
    run: vi.fn(() => Promise.reject(error)),
    commit: vi.fn(),
  };
}

const editConflict = () =>
  new ApiError(409, "Conflict", {
    code: PERSONA_EDIT_CONFLICT_CODE,
    currentEditVersion: 9,
  });

describe("runEditorSaveChain (ENG-451)", () => {
  it("runs the steps in order, each carrying the version the previous one returned", async () => {
    const sentVersions: number[] = [];
    const steps = [
      savingStep("meta", sentVersions, 4),
      savingStep("section", sentVersions, 5),
      savingStep("socials", sentVersions, 6),
    ];

    const outcome = await runEditorSaveChain(steps, 3);

    expect(sentVersions).toEqual([3, 4, 5]);
    expect(outcome).toEqual({
      editVersion: 6,
      hasConflict: false,
      failedLabelKeys: [],
      firstFailure: undefined,
    });
    for (const step of steps) expect(step.commit).toHaveBeenCalledTimes(1);
  });

  it("starts the next step only after the previous one settled", async () => {
    const events: string[] = [];
    let releaseFirst: () => void = () => {};
    const first: EditorSaveStep = {
      labelKey: "meta",
      run: () =>
        new Promise((resolve) => {
          events.push("first started");
          releaseFirst = () => {
            events.push("first settled");
            resolve({ editVersion: 1 });
          };
        }),
      commit: () => {},
    };
    const second: EditorSaveStep = {
      labelKey: "section",
      run: () => {
        events.push("second started");
        return Promise.resolve({ editVersion: 2 });
      },
      commit: () => {},
    };

    const chain = runEditorSaveChain([first, second], 0);
    await Promise.resolve();
    expect(events).toEqual(["first started"]);
    releaseFirst();
    await chain;

    expect(events).toEqual([
      "first started",
      "first settled",
      "second started",
    ]);
  });

  it("keeps the carried version when a response has no editVersion", async () => {
    const sentVersions: number[] = [];
    const withoutVersion: EditorSaveStep = {
      labelKey: "meta",
      run: (expectedEditVersion) => {
        sentVersions.push(expectedEditVersion);
        return Promise.resolve({});
      },
      commit: () => {},
    };
    const next = savingStep("section", sentVersions, 8);

    const outcome = await runEditorSaveChain([withoutVersion, next], 7);

    expect(sentVersions).toEqual([7, 7]);
    expect(outcome.editVersion).toBe(8);
  });

  it("stops at a PERSONA_EDIT_CONFLICT: that step and every later one stay uncommitted", async () => {
    const sentVersions: number[] = [];
    const saved = savingStep("meta", sentVersions, 2);
    const conflicted = failingStep("section", editConflict());
    const later = savingStep("socials", sentVersions, 3);

    const outcome = await runEditorSaveChain([saved, conflicted, later], 1);

    expect(outcome.hasConflict).toBe(true);
    expect(outcome.editVersion).toBe(2);
    expect(saved.commit).toHaveBeenCalledTimes(1);
    expect(conflicted.run).toHaveBeenCalledWith(2);
    expect(conflicted.commit).not.toHaveBeenCalled();
    expect(later.run).not.toHaveBeenCalled();
    expect(later.commit).not.toHaveBeenCalled();
  });

  it("moves past an ordinary failure with the same version and reports it", async () => {
    const sentVersions: number[] = [];
    const takenHandle = new ApiError(409, "That handle is taken", {
      code: "HANDLE_TAKEN",
    });
    const failed = failingStep("meta", takenHandle);
    const next = savingStep("section", sentVersions, 5);

    const outcome = await runEditorSaveChain([failed, next], 4);

    expect(outcome.hasConflict).toBe(false);
    expect(outcome.failedLabelKeys).toEqual(["meta"]);
    expect(outcome.firstFailure).toBe(takenHandle);
    expect(sentVersions).toEqual([4]);
    expect(next.commit).toHaveBeenCalledTimes(1);
    expect(outcome.editVersion).toBe(5);
  });

  it.each([
    ["a network error with no HTTP answer", new TypeError("Failed to fetch")],
    ["the client's 408 timeout", new ApiError(408, "Request timed out")],
    ["a 503", new ApiError(503, "Service unavailable")],
    ["a 500", new ApiError(500, "Internal server error")],
  ])(
    "stops after %s, reporting that step and every later one as failed without running them",
    async (_description, error) => {
      const sentVersions: number[] = [];
      const saved = savingStep("meta", sentVersions, 2);
      const uncertain = failingStep("section", error);
      const later = savingStep("socials", sentVersions, 3);
      const last = savingStep("affiliations", sentVersions, 4);

      const outcome = await runEditorSaveChain(
        [saved, uncertain, later, last],
        1,
      );

      expect(outcome.hasConflict).toBe(false);
      expect(outcome.failedLabelKeys).toEqual([
        "section",
        "socials",
        "affiliations",
      ]);
      expect(outcome.firstFailure).toBe(error);
      expect(outcome.editVersion).toBe(2);
      expect(sentVersions).toEqual([1]);
      expect(saved.commit).toHaveBeenCalledTimes(1);
      expect(uncertain.commit).not.toHaveBeenCalled();
      expect(later.run).not.toHaveBeenCalled();
      expect(last.run).not.toHaveBeenCalled();
    },
  );
});

describe("runEditorSaveChain on a moderation restriction (ENG-448)", () => {
  it("stops at the restricted 403 and reports that step and every later one as failed without running them", async () => {
    const sentVersions: number[] = [];
    const restricted = new ApiError(403, "Your account is restricted.", {
      code: "ACCOUNT_RESTRICTED",
    });
    const refused = failingStep("meta", restricted);
    const later = savingStep("socials", sentVersions, 5);

    const outcome = await runEditorSaveChain([refused, later], 4);

    expect(outcome.hasConflict).toBe(false);
    expect(outcome.failedLabelKeys).toEqual(["meta", "socials"]);
    expect(outcome.firstFailure).toBe(restricted);
    expect(outcome.editVersion).toBe(4);
    expect(later.run).not.toHaveBeenCalled();
  });
});

describe("personaRefusalMessageKey", () => {
  it("maps ACCOUNT_RESTRICTED to the shared restriction copy", () => {
    expect(
      personaRefusalMessageKey(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toBe("shared:apiError.accountRestricted");
  });

  it("maps a rename's HANDLE_TAKEN to the checklist's taken-handle copy", () => {
    expect(
      personaRefusalMessageKey(
        new ApiError(409, "That handle is already taken.", {
          code: "HANDLE_TAKEN",
          unmet: ["handle_taken"],
        }),
      ),
    ).toBe("subprofiles:checklist.reqHandleFailTaken");
    expect(
      personaRefusalMessageKey(
        new ApiError(409, "That handle is already taken.", {
          code: "HANDLE_TAKEN",
        }),
      ),
    ).toBe("subprofiles:checklist.reqHandleFailTaken");
  });

  it("maps SUBPROFILE_NOT_READY to the first unmet code's fail copy", () => {
    expect(
      personaRefusalMessageKey(
        new ApiError(422, "That handle is not available.", {
          code: "SUBPROFILE_NOT_READY",
          unmet: [
            "not_a_checklist_code",
            "handle_names_owner",
            "handle_is_kind",
          ],
        }),
      ),
    ).toBe("subprofiles:checklist.reqHandleFailNamesOwner");
    expect(
      personaRefusalMessageKey(
        new ApiError(422, "x", {
          code: "SUBPROFILE_NOT_READY",
          unmet: ["blocked_terms"],
        }),
      ),
    ).toBe("subprofiles:checklist.reqLanguageFail");
  });

  it("returns null when there is no typed refusal to translate", () => {
    expect(
      personaRefusalMessageKey(
        new ApiError(422, "x", { code: "SUBPROFILE_NOT_READY", unmet: [] }),
      ),
    ).toBeNull();
    expect(
      personaRefusalMessageKey(new ApiError(409, "That slug is in use")),
    ).toBeNull();
    expect(personaRefusalMessageKey(editConflict())).toBeNull();
    expect(
      personaRefusalMessageKey(new TypeError("Failed to fetch")),
    ).toBeNull();
  });
});
