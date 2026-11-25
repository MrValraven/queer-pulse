import { describe, expect, it } from "vitest";
import type { QuizshowLiveSessionRef } from "../../../shared/contracts/quizshow";
import { lobbyLineKindOf } from "./useStudioSave";

function liveSessionOf(
  overrides: Partial<QuizshowLiveSessionRef>,
): QuizshowLiveSessionRef {
  return {
    sessionId: "session-1",
    joinCode: "ABC123",
    status: "lobby",
    playMode: "solo",
    playerCount: 0,
    startedAt: "2026-11-24T20:00:00.000Z",
    isPractice: false,
    isBehindQuiz: false,
    ...overrides,
  };
}

describe("lobbyLineKindOf", () => {
  it("shows nothing without a live session or with a lobby on the latest save", () => {
    expect(lobbyLineKindOf(null, false)).toBeNull();
    expect(lobbyLineKindOf(liveSessionOf({}), false)).toBeNull();
    expect(lobbyLineKindOf(liveSessionOf({}), true)).toBeNull();
  });

  it("says a lobby is behind, or that its refresh was refused", () => {
    const behind = liveSessionOf({ isBehindQuiz: true });
    expect(lobbyLineKindOf(behind, false)).toBe("behind");
    expect(lobbyLineKindOf(behind, true)).toBe("refused");
  });

  it("says changes apply to the next game while one is running or paused", () => {
    expect(lobbyLineKindOf(liveSessionOf({ status: "running" }), false)).toBe(
      "nextGame",
    );
    expect(lobbyLineKindOf(liveSessionOf({ status: "paused" }), true)).toBe(
      "nextGame",
    );
  });
});
