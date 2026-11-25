import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  demoEndSession,
  demoOpenSession,
  demoQuizFor,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { QUIZSHOW_DEMO_SESSION_ID } from "../quizshow.constants";
import {
  createQuizshowDemoController,
  demoEventGivingOf,
  type QuizshowDemoEngineOptions,
} from "./useQuizshowDemoEngine";

const REMATCH = {
  fromSessionId: QUIZSHOW_DEMO_SESSION_ID,
  sessionId: QUIZSHOW_DEMO_SESSION_ID,
  joinCode: "RM4KT9",
  playMode: "solo",
} as const;

function optionsOf(
  overrides: Partial<QuizshowDemoEngineOptions>,
): QuizshowDemoEngineOptions {
  return {
    role: "player",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    isAutoHost: false,
    hasSelfPlayer: true,
    playMode: "solo",
    suggestedScreenName: "Sam",
    shouldLoop: false,
    ...overrides,
  };
}

function joinCodeOf(
  controller: ReturnType<typeof createQuizshowDemoController>,
  role: QuizshowDemoEngineOptions["role"],
): string {
  return controller.engineApi.sessionStateFor(role).joinCode;
}

describe("demo rematch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the visitor's own end screen on the old code, however long it waits", () => {
    const phone = createQuizshowDemoController(() => optionsOf({}));
    const oldCode = joinCodeOf(phone, "player");
    phone.handleRematch(REMATCH);
    vi.advanceTimersByTime(10_000);
    expect(joinCodeOf(phone, "player")).toBe(oldCode);
    phone.dispose();
  });

  it("moves a page without a rematch button to the new code after a beat", () => {
    const screen = createQuizshowDemoController(() =>
      optionsOf({ role: "screen", hasSelfPlayer: false }),
    );
    screen.handleRematch(REMATCH);
    expect(joinCodeOf(screen, "screen")).not.toBe(REMATCH.joinCode);
    vi.advanceTimersByTime(1_500);
    expect(joinCodeOf(screen, "screen")).toBe(REMATCH.joinCode);
    screen.dispose();
  });

  it("moves the try-out to the new code after a beat", () => {
    const tryOut = createQuizshowDemoController(() =>
      optionsOf({ quiz: demoQuizFor("quiz-night"), hasSelfPlayer: false }),
    );
    tryOut.handleRematch(REMATCH);
    vi.advanceTimersByTime(1_500);
    expect(joinCodeOf(tryOut, "player")).toBe(REMATCH.joinCode);
    tryOut.dispose();
  });
});

describe("demo practice night on a loop", () => {
  afterEach(() => {
    resetQuizshowDemoStore();
  });

  it("keeps the practice badge after the night ends and the presenter loops", () => {
    resetQuizshowDemoStore();
    demoOpenSession(QUIZSHOW_DEMO_LIVE_SLUG, {
      playMode: "solo",
      maxTeamSize: null,
      isReviewOn: true,
      notifyGuests: false,
      shouldReplaceResults: false,
      isPractice: true,
      rematchOfSessionId: null,
    });
    const presenter = createQuizshowDemoController(() =>
      optionsOf({
        role: "screen",
        eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
        hasSelfPlayer: false,
        shouldLoop: true,
      }),
    );
    expect(presenter.engineApi.sessionStateFor("screen").isPractice).toBe(true);
    // The night ended: the store closed its lobby, then the presenter loops.
    demoEndSession(QUIZSHOW_DEMO_SESSION_ID);
    presenter.engineApi.restart();
    expect(presenter.engineApi.sessionStateFor("screen").isPractice).toBe(true);
    presenter.dispose();
  });
});

describe("demo giving line", () => {
  it("seeds the demo event's community for its finished night", () => {
    expect(demoEventGivingOf(QUIZSHOW_DEMO_LIVE_SLUG)).toEqual({
      communitySlug: "queer-runners",
      communityName: "Queer Runners Lisboa",
    });
  });

  it("leaves a game and an event without giving data with none", () => {
    expect(demoEventGivingOf(null)).toBeNull();
    expect(demoEventGivingOf("quiz-night")).toBeNull();
  });
});
