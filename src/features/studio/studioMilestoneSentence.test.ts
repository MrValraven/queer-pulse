import { describe, expect, it } from "vitest";
import type { StudioMilestoneView } from "./api/studioDashboard.adapters";
import { STUDIO_MILESTONE_KINDS } from "./api/studioDashboard.types";
import {
  MILESTONE_SENTENCE_KEY,
  milestoneSentenceOf,
} from "./studioMilestoneSentence";

const reachedAt = new Date("2026-10-20T12:00:00.000Z");

const followers1000: StudioMilestoneView = {
  id: "milestone-1",
  kind: "followers",
  threshold: 1000,
  track: null,
  reachedAt,
};

const firstPlacement: StudioMilestoneView = {
  id: "milestone-2",
  kind: "first_placement",
  threshold: 1,
  track: null,
  reachedAt,
};

const trackPlays500: StudioMilestoneView = {
  id: "milestone-3",
  kind: "track_plays",
  threshold: 500,
  track: { id: "track-1", title: "Cais" },
  reachedAt,
};

const formatNumber = (value: number) => value.toLocaleString("en");

describe("milestoneSentenceOf", () => {
  it("names the persona and the threshold on a follower milestone", () => {
    expect(
      milestoneSentenceOf(followers1000, "Mariana Sol", formatNumber),
    ).toEqual({
      key: "studio:share.milestone.followers",
      values: { persona: "Mariana Sol", value: "1,000" },
    });
  });
  it("names the persona alone on a first placement", () => {
    expect(
      milestoneSentenceOf(firstPlacement, "Mariana Sol", formatNumber),
    ).toEqual({
      key: "studio:share.milestone.firstPlacement",
      values: { persona: "Mariana Sol" },
    });
  });
  it("names the track on a track plays milestone", () => {
    expect(
      milestoneSentenceOf(trackPlays500, "Mariana Sol", formatNumber).values,
    ).toEqual({
      persona: "Mariana Sol",
      track: "Cais",
      value: "500",
    });
  });
  it("has a sentence for every kind", () => {
    for (const kind of STUDIO_MILESTONE_KINDS) {
      expect(MILESTONE_SENTENCE_KEY[kind]).toMatch(
        /^studio:share\.milestone\./,
      );
    }
  });
});
