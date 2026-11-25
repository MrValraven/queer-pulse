import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QuizshowCountdownBar } from "./QuizshowCountdownBar";
import { QuizshowTimerRing } from "./QuizshowTimerRing";

const START_AT = 2_000_000;

function openCursor(): QuizshowCursor {
  return {
    phaseId: "12",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 1,
    phaseStartedAt: START_AT,
    deadline: START_AT + 20_000,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("the spoken seconds left", () => {
  it.each([
    [
      "countdown bar",
      <QuizshowCountdownBar
        key="bar"
        cursor={openCursor()}
        clockOffsetMs={0}
        hasExtraTime={false}
        size="phone"
      />,
    ],
    [
      "timer ring",
      <QuizshowTimerRing
        key="ring"
        cursor={openCursor()}
        clockOffsetMs={0}
        hasExtraTime={false}
        size="screen"
      />,
    ],
  ])(
    "the %s says the seconds as a counted line at 10 and 5",
    async (_surface, element) => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
      vi.setSystemTime(START_AT);
      render(
        <TestProviders>
          <ReducedMotionContext.Provider value>
            {element}
          </ReducedMotionContext.Provider>
        </TestProviders>,
      );
      await awaitCatalog("quizshow");
      act(() => {
        vi.advanceTimersByTime(11_000);
      });
      expect(screen.getByRole("status")).toHaveTextContent("10 seconds left");
      act(() => {
        vi.advanceTimersByTime(5_000);
      });
      expect(screen.getByRole("status")).toHaveTextContent("5 seconds left");
    },
  );
});
