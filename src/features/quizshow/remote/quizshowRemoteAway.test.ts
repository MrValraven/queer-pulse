import { describe, expect, it } from "vitest";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { isPlayerAwayAt, nextAwayFlipAt } from "./quizshowRemoteAway";

const LEFT_AT = 1_700_000_000_000;
const AWAY_AFTER_MS = QUIZSHOW_LIMITS.awayAfterMs;

describe("isPlayerAwayAt", () => {
  it("is never away while connected, even with a stale disconnectedAt", () => {
    expect(
      isPlayerAwayAt(
        { isConnected: true, disconnectedAt: LEFT_AT },
        LEFT_AT + AWAY_AFTER_MS * 10,
      ),
    ).toBe(false);
  });

  it("is never away without a disconnectedAt", () => {
    expect(
      isPlayerAwayAt(
        { isConnected: false, disconnectedAt: null },
        LEFT_AT + AWAY_AFTER_MS * 10,
      ),
    ).toBe(false);
  });

  it("stays offline until awayAfterMs has passed by the server clock", () => {
    const player = { isConnected: false, disconnectedAt: LEFT_AT };
    expect(isPlayerAwayAt(player, LEFT_AT)).toBe(false);
    expect(isPlayerAwayAt(player, LEFT_AT + AWAY_AFTER_MS - 1)).toBe(false);
  });

  it("turns away at exactly awayAfterMs and stays away after", () => {
    const player = { isConnected: false, disconnectedAt: LEFT_AT };
    expect(isPlayerAwayAt(player, LEFT_AT + AWAY_AFTER_MS)).toBe(true);
    expect(isPlayerAwayAt(player, LEFT_AT + AWAY_AFTER_MS * 3)).toBe(true);
  });

  it("reads a server clock behind the disconnect as not away", () => {
    expect(
      isPlayerAwayAt(
        { isConnected: false, disconnectedAt: LEFT_AT },
        LEFT_AT - AWAY_AFTER_MS,
      ),
    ).toBe(false);
  });
});

describe("nextAwayFlipAt", () => {
  it("is the earliest moment an offline player still turns away", () => {
    expect(
      nextAwayFlipAt(
        [
          { isConnected: true, disconnectedAt: null },
          { isConnected: false, disconnectedAt: LEFT_AT + 5_000 },
          { isConnected: false, disconnectedAt: LEFT_AT + 1_000 },
        ],
        LEFT_AT + 2_000,
      ),
    ).toBe(LEFT_AT + 1_000 + AWAY_AFTER_MS);
  });

  it("leaves out players who are already away", () => {
    expect(
      nextAwayFlipAt(
        [
          { isConnected: false, disconnectedAt: LEFT_AT },
          { isConnected: false, disconnectedAt: LEFT_AT + 9_000 },
        ],
        LEFT_AT + AWAY_AFTER_MS,
      ),
    ).toBe(LEFT_AT + 9_000 + AWAY_AFTER_MS);
  });

  it("is null when nobody is waiting to turn away", () => {
    expect(nextAwayFlipAt([], LEFT_AT)).toBeNull();
    expect(
      nextAwayFlipAt(
        [
          { isConnected: true, disconnectedAt: LEFT_AT },
          { isConnected: false, disconnectedAt: null },
          { isConnected: false, disconnectedAt: LEFT_AT },
        ],
        LEFT_AT + AWAY_AFTER_MS,
      ),
    ).toBeNull();
  });
});
