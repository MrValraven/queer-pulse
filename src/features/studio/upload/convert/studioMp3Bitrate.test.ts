import { describe, expect, it } from "vitest";
import {
  maxMinutesAt128,
  mp3BitrateFor,
  mp3SampleRateFor,
  mp3TargetFor,
} from "./studioMp3Bitrate";

const MUSIC_CAP = 52428800;
const PODCAST_CAP = 262144000;

describe("mp3BitrateFor", () => {
  it.each([
    [1272, 320],
    [1273, 256],
    [1590, 256],
    [1591, 192],
    [2120, 192],
    [2121, 160],
    [2545, 160],
    [2546, 128],
    [3181, 128],
  ])("gives %i seconds %i kbps under the 50 MB cap", (seconds, kbps) => {
    expect(mp3BitrateFor(seconds, MUSIC_CAP)).toBe(kbps);
  });

  it("refuses a file that does not fit at 128 kbps", () => {
    expect(mp3BitrateFor(3182, MUSIC_CAP)).toBeNull();
  });

  it("uses the podcast cap", () => {
    expect(mp3BitrateFor(6362, PODCAST_CAP)).toBe(320);
    expect(mp3BitrateFor(6363, PODCAST_CAP)).toBe(256);
    expect(mp3BitrateFor(15906, PODCAST_CAP)).toBe(128);
    expect(mp3BitrateFor(15907, PODCAST_CAP)).toBeNull();
  });

  it("names the whole minutes that fit at 128 kbps", () => {
    expect(maxMinutesAt128(MUSIC_CAP)).toBe(53);
    expect(maxMinutesAt128(PODCAST_CAP)).toBe(265);
  });
});

describe("mp3TargetFor", () => {
  it.each([
    [32000, 32000],
    [44100, 44100],
    [48000, 48000],
    [88200, 44100],
    [176400, 44100],
    [96000, 48000],
    [192000, 48000],
    [22050, 44100],
    [11025, 44100],
  ])("turns %i Hz into %i Hz", (sourceRate, targetRate) => {
    expect(mp3SampleRateFor(sourceRate)).toBe(targetRate);
  });

  it("keeps mono, keeps stereo and mixes more channels down to two", () => {
    expect(
      mp3TargetFor({ sampleRate: 44100, channels: 1 }).numberOfChannels,
    ).toBe(1);
    expect(
      mp3TargetFor({ sampleRate: 44100, channels: 2 }).numberOfChannels,
    ).toBe(2);
    expect(mp3TargetFor({ sampleRate: 96000, channels: 6 })).toEqual({
      sampleRate: 48000,
      numberOfChannels: 2,
    });
  });
});
