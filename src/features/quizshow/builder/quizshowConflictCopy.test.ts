import { describe, expect, it } from "vitest";
import {
  conflictBodyCopyOf,
  QUIZSHOW_CONFLICT_BY_KEY,
} from "./useQuizshowSave";

describe("conflictBodyCopyOf", () => {
  const formatTime = (value: Date) => value.toISOString().slice(11, 16);
  const fallbackKey = "quizshow:save.conflictBody";
  const namedDetails = {
    updatedAt: "2026-11-24T21:05:00.000Z",
    updatedByName: "Alex",
  };

  it("names who saved and when in an event and a template", () => {
    for (const scopeKind of ["event", "template"] as const) {
      expect(
        conflictBodyCopyOf(namedDetails, scopeKind, fallbackKey, formatTime),
      ).toEqual({
        key: QUIZSHOW_CONFLICT_BY_KEY,
        values: { name: "Alex", time: "21:05" },
      });
    }
  });

  it("keeps a game's own body, since its one owner is the viewer", () => {
    expect(
      conflictBodyCopyOf(
        namedDetails,
        "game",
        "quizshow:save.conflictBodyGame",
        formatTime,
      ),
    ).toEqual({ key: "quizshow:save.conflictBodyGame", values: {} });
  });

  it("keeps the scope's own body without a name", () => {
    expect(
      conflictBodyCopyOf(
        { updatedAt: "2026-11-24T21:05:00.000Z", updatedByName: null },
        "event",
        fallbackKey,
        formatTime,
      ),
    ).toEqual({ key: fallbackKey, values: {} });
    expect(conflictBodyCopyOf(null, "event", fallbackKey, formatTime)).toEqual({
      key: fallbackKey,
      values: {},
    });
  });
});
