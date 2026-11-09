import { describe, expect, it } from "vitest";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import {
  newRound,
  newWheel,
  type QuizshowDraft,
} from "../builder/quizshowDraft";
import {
  isPartyRoundKind,
  isPlayableRoundKind,
} from "./quizshowStudioRailView";
import {
  lastPlayableRoundIndex,
  studioAddLimitsOf,
} from "./quizshowStudioLimits";

function draftOf(kinds: Array<"quiz" | "wheel">): QuizshowDraft {
  return {
    title: "Pride trivia",
    languages: "en",
    screenLanguage: "en",
    rounds: kinds.map((kind) =>
      kind === "wheel" ? newWheel() : newRound("quiz"),
    ),
  };
}

describe("studioAddLimitsOf", () => {
  it("counts rounds without wheels", () => {
    const kinds: Array<"quiz" | "wheel"> = [
      ...Array.from(
        { length: QUIZSHOW_LIMITS.roundsMax },
        () => "quiz" as const,
      ),
      "wheel",
      "wheel",
    ];
    expect(studioAddLimitsOf(draftOf(kinds))).toMatchObject({
      isAddRoundAllowed: false,
      isAddWheelAllowed: true,
    });
  });

  it("keeps rounds open while wheels fill the row count", () => {
    expect(
      studioAddLimitsOf(draftOf(["wheel", "wheel", "wheel"])),
    ).toMatchObject({ isAddRoundAllowed: true, isAddWheelAllowed: false });
  });

  it("stops at three wheels", () => {
    const threeWheels = draftOf(["quiz", "wheel", "wheel", "wheel"]);
    expect(studioAddLimitsOf(threeWheels).isAddWheelAllowed).toBe(false);
    expect(
      studioAddLimitsOf(draftOf(["quiz", "wheel", "wheel"])).isAddWheelAllowed,
    ).toBe(true);
  });

  it("lets a wheel in while the question limit is reached", () => {
    const fullDraft = draftOf(["quiz"]);
    const [fullRound] = fullDraft.rounds;
    const [firstQuestion] = fullRound?.questions ?? [];
    if (fullRound === undefined || firstQuestion === undefined) {
      throw new Error("A new quiz round starts with one question");
    }
    fullRound.questions = Array.from(
      { length: QUIZSHOW_LIMITS.questionsPerQuizMax },
      () => firstQuestion,
    );
    expect(studioAddLimitsOf(fullDraft)).toMatchObject({
      isAddQuestionAllowed: false,
      isAddRoundAllowed: false,
      isAddWheelAllowed: true,
    });
  });

  it("never allows a question on a wheel row", () => {
    const draft = draftOf(["quiz", "wheel"]);
    const wheelRowIndex = 1;
    expect(
      studioAddLimitsOf(draft).isAddQuestionToRoundAllowed(wheelRowIndex),
    ).toBe(false);
    expect(studioAddLimitsOf(draft).isAddQuestionToRoundAllowed(0)).toBe(true);
  });
});

describe("lastPlayableRoundIndex", () => {
  it("finds the last playable round", () => {
    expect(lastPlayableRoundIndex(draftOf(["quiz", "wheel"]))).toBe(0);
    expect(lastPlayableRoundIndex(draftOf(["wheel"]))).toBeNull();
    expect(lastPlayableRoundIndex(draftOf([]))).toBeNull();
  });
});

describe("round kind guards", () => {
  it("keeps a wheel out of the party and playable kinds", () => {
    expect(isPartyRoundKind("wheel")).toBe(false);
    expect(isPlayableRoundKind("wheel")).toBe(false);
    expect(isPlayableRoundKind("drag_name")).toBe(true);
    expect(isPartyRoundKind("drag_name")).toBe(true);
  });
});
