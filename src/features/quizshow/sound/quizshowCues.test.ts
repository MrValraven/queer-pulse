import { beforeEach, describe, expect, it, vi } from "vitest";

const chimeMock = vi.hoisted(() => ({
  runningChimeOutput: vi.fn(),
  playChimeNote: vi.fn(),
}));

vi.mock("../../../shared/lib/messageChime", () => ({
  runningChimeOutput: chimeMock.runningChimeOutput,
  playChimeNote: chimeMock.playChimeNote,
  chimeNoteFrequency: (semitones: number) => 440 * Math.pow(2, semitones / 12),
}));

import {
  QUIZSHOW_CUE_NOTES,
  playQuizshowCue,
  type QuizshowCue,
} from "./quizshowCues";

const CUE_NAMES = Object.keys(QUIZSHOW_CUE_NOTES) as QuizshowCue[];

describe("quizshow cues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T20:00:00Z"));
    chimeMock.runningChimeOutput.mockReset();
    chimeMock.playChimeNote.mockReset();
  });

  it("keeps every cue short, quiet and low", () => {
    CUE_NAMES.forEach((cue) => {
      const notes = QUIZSHOW_CUE_NOTES[cue];
      const lastNote = notes[notes.length - 1];
      expect(lastNote).toBeDefined();
      expect(
        (lastNote?.delaySeconds ?? 1) + (lastNote?.decaySeconds ?? 1),
      ).toBeLessThan(0.5);
      notes.forEach((note) => {
        expect(note.peakGain).toBeLessThanOrEqual(0.25);
        expect(note.semitonesFromA4).toBeLessThanOrEqual(-2);
      });
    });
  });

  it("plays nothing while audio is not running", () => {
    chimeMock.runningChimeOutput.mockReturnValue(null);
    expect(playQuizshowCue("reveal")).toBe(false);
    expect(chimeMock.playChimeNote).not.toHaveBeenCalled();
  });

  it("schedules one note per entry", () => {
    chimeMock.runningChimeOutput.mockReturnValue({
      context: { currentTime: 1 },
      input: {},
    });
    expect(playQuizshowCue("podium")).toBe(true);
    expect(chimeMock.playChimeNote).toHaveBeenCalledTimes(
      QUIZSHOW_CUE_NOTES.podium.length * 2,
    );
  });

  it("skips a cue repeated within 300 ms", () => {
    chimeMock.runningChimeOutput.mockReturnValue({
      context: { currentTime: 1 },
      input: {},
    });
    vi.advanceTimersByTime(1000);
    expect(playQuizshowCue("playerJoined")).toBe(true);
    vi.advanceTimersByTime(100);
    expect(playQuizshowCue("playerJoined")).toBe(false);
    vi.advanceTimersByTime(300);
    expect(playQuizshowCue("playerJoined")).toBe(true);
  });
});
