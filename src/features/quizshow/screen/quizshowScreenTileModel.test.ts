import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { slowRevealOf } from "./quizshowScreenTileModel";

const PHASE_STARTED_AT = 1_000_000;
const READ_MS = 4000;
const TALK_MS = 30_000;
const LIMIT_MS = 20_000;

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
    phaseId: "1",
    status: "running",
    phase: "read",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 3,
    phaseStartedAt: PHASE_STARTED_AT,
    deadline: PHASE_STARTED_AT + READ_MS,
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
    ...overrides,
  };
}

function slowQuestion(
  overrides: Partial<QuizshowQuestionView> = {},
): QuizshowQuestionView {
  return {
    questionId: "question-1",
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    prompt: { en: "Whose flag is this?", pt: "De quem é esta bandeira?" },
    mediaUrl: "https://example.test/flag.jpg",
    points: 1000,
    timeLimitSeconds: LIMIT_MS / 1000,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "slow",
    numberUnit: { en: "", pt: "" },
    readMs: READ_MS,
    options: [
      { id: "option-a", text: { en: "Bi", pt: "Bi" } },
      { id: "option-b", text: { en: "Pan", pt: "Pan" } },
    ],
    ...overrides,
  };
}

describe("slowRevealOf (C6.23)", () => {
  it("runs from the read start to one answer limit after the read deadline", () => {
    expect(slowRevealOf(slowQuestion(), cursorWith(), 0)).toEqual({
      startsAt: PHASE_STARTED_AT,
      endsAt: PHASE_STARTED_AT + READ_MS + LIMIT_MS,
      isCleared: false,
    });
  });

  it("stretches the read window by the talk time", () => {
    const cursor = cursorWith({
      deadline: PHASE_STARTED_AT + READ_MS + TALK_MS,
      talkStartsAt: PHASE_STARTED_AT + READ_MS,
    });
    expect(slowRevealOf(slowQuestion(), cursor, TALK_MS)).toEqual({
      startsAt: PHASE_STARTED_AT,
      endsAt: PHASE_STARTED_AT + READ_MS + TALK_MS + LIMIT_MS,
      isCleared: false,
    });
  });

  it("dates the start back by the read and talk time in open and ends at the open deadline", () => {
    const cursor = cursorWith({
      phase: "open",
      deadline: PHASE_STARTED_AT + LIMIT_MS,
    });
    expect(slowRevealOf(slowQuestion(), cursor, TALK_MS)).toEqual({
      startsAt: PHASE_STARTED_AT - READ_MS - TALK_MS,
      endsAt: PHASE_STARTED_AT + LIMIT_MS,
      isCleared: false,
    });
  });

  it("measures from the phase start while paused, with no deadline", () => {
    const pausedRead = cursorWith({
      status: "paused",
      deadline: null,
      pausedRemainingMs: 2000,
    });
    expect(slowRevealOf(slowQuestion(), pausedRead, TALK_MS)).toEqual({
      startsAt: PHASE_STARTED_AT,
      endsAt: PHASE_STARTED_AT + READ_MS + TALK_MS + LIMIT_MS,
      isCleared: false,
    });
    const pausedOpen = cursorWith({
      phase: "open",
      status: "paused",
      deadline: null,
      pausedRemainingMs: 8000,
    });
    expect(slowRevealOf(slowQuestion(), pausedOpen, 0)).toEqual({
      startsAt: PHASE_STARTED_AT - READ_MS,
      endsAt: PHASE_STARTED_AT + LIMIT_MS,
      isCleared: false,
    });
  });

  it("shows the picture clear from the reveal on", () => {
    const cursor = cursorWith({ phase: "reveal", deadline: null });
    expect(slowRevealOf(slowQuestion(), cursor, 0)?.isCleared).toBe(true);
  });

  it("keeps a wheel question's picture on the slow reveal", () => {
    expect(
      slowRevealOf(slowQuestion({ roundKind: "wheel" }), cursorWith(), 0),
    ).not.toBeNull();
  });

  it("gives no slow reveal to a party question or an instant picture", () => {
    expect(
      slowRevealOf(
        slowQuestion({ roundKind: "caption_this", type: "prompt" }),
        cursorWith({ phase: "write" }),
        0,
      ),
    ).toBeNull();
    expect(
      slowRevealOf(
        slowQuestion({ roundKind: "caption_this", type: "prompt" }),
        cursorWith(),
        0,
      ),
    ).toBeNull();
    expect(
      slowRevealOf(slowQuestion({ mediaReveal: "instant" }), cursorWith(), 0),
    ).toBeNull();
    expect(
      slowRevealOf(slowQuestion({ mediaUrl: null }), cursorWith(), 0),
    ).toBeNull();
  });
});
