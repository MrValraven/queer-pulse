import { beforeEach, describe, expect, it, vi } from "vitest";

const chimeMock = vi.hoisted(() => ({
  runningChimeCueOutput: vi.fn(),
  playChimeNote: vi.fn(),
  primeMessageChime: vi.fn(),
}));

vi.mock("../../../shared/lib/messageChime", () => ({
  runningChimeCueOutput: chimeMock.runningChimeCueOutput,
  playChimeNote: chimeMock.playChimeNote,
  primeMessageChime: chimeMock.primeMessageChime,
  chimeNoteFrequency: (semitones: number) => 440 * Math.pow(2, semitones / 12),
}));

import {
  QUIZSHOW_CUE_MIN_GAP_MS,
  QUIZSHOW_CUE_NOTES,
  QUIZSHOW_SOUND_LEVEL_GAINS,
  QUIZSHOW_SOUND_LEVEL_STORAGE_KEY,
  applySoundLevel,
  isQuizshowAudioRunning,
  playQuizshowCue,
  readStoredSoundLevel,
  resumeQuizshowAudio,
  saveSoundLevel,
  type QuizshowCue,
} from "./quizshowCues";

/** A context with the two nodes the level stage builds and the cue chain's tail, recording what each is given. */
function levelContext() {
  const levelGain = {
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
  };
  const limiter = {
    threshold: { value: 0 },
    knee: { value: 0 },
    ratio: { value: 0 },
    attack: { value: 0 },
    release: { value: 0 },
    connect: vi.fn(),
  };
  const destination = {};
  const context = {
    currentTime: 2,
    destination,
    createGain: vi.fn(() => levelGain),
    createDynamicsCompressor: vi.fn(() => limiter),
  };
  const tail = { connect: vi.fn() };
  return { context, destination, tail, levelGain, limiter };
}

const CUE_NAMES = Object.keys(QUIZSHOW_CUE_NOTES) as QuizshowCue[];

describe("quizshow cues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T20:00:00Z"));
    chimeMock.runningChimeCueOutput.mockReset();
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
    chimeMock.runningChimeCueOutput.mockReturnValue(null);
    expect(playQuizshowCue("reveal")).toBe(false);
    expect(chimeMock.playChimeNote).not.toHaveBeenCalled();
  });

  it("schedules one note per entry", () => {
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context: { currentTime: 1, destination: {} },
      input: {},
      tail: { connect: vi.fn() },
    });
    expect(playQuizshowCue("podium")).toBe(true);
    expect(chimeMock.playChimeNote).toHaveBeenCalledTimes(
      QUIZSHOW_CUE_NOTES.podium.length * 2,
    );
  });

  it("skips a cue repeated within 300 ms", () => {
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context: { currentTime: 1, destination: {} },
      input: {},
      tail: { connect: vi.fn() },
    });
    vi.advanceTimersByTime(1000);
    expect(playQuizshowCue("playerJoined")).toBe(true);
    vi.advanceTimersByTime(100);
    expect(playQuizshowCue("playerJoined")).toBe(false);
    vi.advanceTimersByTime(300);
    expect(playQuizshowCue("playerJoined")).toBe(true);
  });

  it("gives wheelTick a 60 ms gap", () => {
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context: { currentTime: 1, destination: {} },
      input: {},
      tail: { connect: vi.fn() },
    });
    expect(QUIZSHOW_CUE_MIN_GAP_MS).toEqual({ wheelTick: 60 });
    vi.advanceTimersByTime(1000);
    expect(playQuizshowCue("wheelTick")).toBe(true);
    vi.advanceTimersByTime(59);
    expect(playQuizshowCue("wheelTick")).toBe(false);
    vi.advanceTimersByTime(1);
    expect(playQuizshowCue("wheelTick")).toBe(true);
  });

  it("keeps the 300 ms gap for reveal", () => {
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context: { currentTime: 1, destination: {} },
      input: {},
      tail: { connect: vi.fn() },
    });
    vi.advanceTimersByTime(1000);
    expect(playQuizshowCue("reveal")).toBe(true);
    vi.advanceTimersByTime(299);
    expect(playQuizshowCue("reveal")).toBe(false);
    vi.advanceTimersByTime(1);
    expect(playQuizshowCue("reveal")).toBe(true);
  });

  it("holds the wheel cue notes from the contract", () => {
    expect(QUIZSHOW_CUE_NOTES.wheelTick).toEqual([
      {
        semitonesFromA4: -14,
        delaySeconds: 0,
        peakGain: 0.05,
        decaySeconds: 0.03,
      },
    ]);
    expect(QUIZSHOW_CUE_NOTES.wheelLand).toEqual([
      {
        semitonesFromA4: -14,
        delaySeconds: 0,
        peakGain: 0.16,
        decaySeconds: 0.18,
      },
      {
        semitonesFromA4: -9,
        delaySeconds: 0.09,
        peakGain: 0.16,
        decaySeconds: 0.22,
      },
    ]);
  });

  it("keeps the drum roll under half a second and swelling", () => {
    const notes = QUIZSHOW_CUE_NOTES.podiumDrum;
    expect(notes.length).toBeGreaterThan(3);
    expect(
      Math.max(...notes.map((note) => note.delaySeconds + note.decaySeconds)),
    ).toBeLessThan(0.5);
    notes.forEach((note, index) => {
      expect(note.semitonesFromA4).toBe(-21);
      if (index > 0) {
        expect(note.peakGain).toBeGreaterThan(notes[index - 1]?.peakGain ?? 1);
      }
    });
  });

  it("routes the cue chain's tail through the level gain and a limiter to the speakers", () => {
    const chimeInput = {};
    const { context, destination, tail, levelGain, limiter } = levelContext();
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context,
      input: chimeInput,
      tail,
    });
    applySoundLevel("venue");
    vi.advanceTimersByTime(1000);
    // A cue no earlier test played, so the same-cue gap cannot skip it.
    expect(playQuizshowCue("questionOpens")).toBe(true);
    expect(context.createDynamicsCompressor).toHaveBeenCalledTimes(1);
    expect(levelGain.gain.value).toBe(QUIZSHOW_SOUND_LEVEL_GAINS.venue);
    // After the chain's compressor and lowpass: tail, level, limiter, speakers.
    expect(tail.connect).toHaveBeenCalledWith(levelGain);
    expect(levelGain.connect).toHaveBeenCalledWith(limiter);
    expect(limiter.connect).toHaveBeenCalledWith(destination);
    // The notes still enter the chain itself, so its compressor shapes them first.
    chimeMock.playChimeNote.mock.calls.forEach((call) => {
      expect(call[1]).toBe(chimeInput);
    });

    applySoundLevel("quiet");
    expect(levelGain.gain.setValueAtTime).toHaveBeenLastCalledWith(0.5, 2);
    applySoundLevel("normal");
    expect(levelGain.gain.setValueAtTime).toHaveBeenLastCalledWith(1, 2);
  });

  it("keeps the level under quizshow.soundLevel and reads Normal by default", () => {
    window.localStorage.clear();
    expect(readStoredSoundLevel()).toBe("normal");
    saveSoundLevel("venue");
    expect(window.localStorage.getItem(QUIZSHOW_SOUND_LEVEL_STORAGE_KEY)).toBe(
      "venue",
    );
    expect(readStoredSoundLevel()).toBe("venue");
    window.localStorage.setItem(QUIZSHOW_SOUND_LEVEL_STORAGE_KEY, "loud");
    expect(readStoredSoundLevel()).toBe("normal");
    window.localStorage.clear();
  });

  it("reads Normal and keeps going when storage throws", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("Blocked");
      });
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Blocked");
      });
    expect(readStoredSoundLevel()).toBe("normal");
    expect(() => saveSoundLevel("quiet")).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it("says whether audio runs and asks for it through the chime's gesture listeners", () => {
    chimeMock.runningChimeCueOutput.mockReturnValue(null);
    expect(isQuizshowAudioRunning()).toBe(false);
    chimeMock.runningChimeCueOutput.mockReturnValue({
      context: { currentTime: 1, destination: {} },
      input: {},
      tail: { connect: vi.fn() },
    });
    expect(isQuizshowAudioRunning()).toBe(true);
    resumeQuizshowAudio();
    expect(chimeMock.primeMessageChime).toHaveBeenCalledTimes(1);
  });
});
