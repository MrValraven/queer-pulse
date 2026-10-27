import { describe, expect, it } from "vitest";
import { studio as en } from "./en/studio";
import { studio as pt } from "./pt/studio";
import { shared as enShared } from "./en/shared";
import { shared as ptShared } from "./pt/shared";

/** Every studio key the Studio dashboard Part 1 build reads. */
const DASHBOARD_KEYS = [
  "numbers.growth.title",
  "numbers.growth.sub",
  "numbers.growth.ariaLabel",
  "numbers.growth.thisWeek",
  "numbers.growth.weekOf",
  "numbers.growth.tableCaption",
  "numbers.growth.weekColumn",
  "numbers.growth.countColumn",
  "numbers.growth.empty",
  "numbers.chart.showTable",
  "numbers.chart.hideTable",
  "numbers.health.heading",
  "numbers.health.progress",
  "numbers.health.showChecklist",
  "numbers.health.hideChecklist",
  "numbers.health.optional",
  "numbers.health.showMore_one",
  "numbers.health.showMore_other",
  "numbers.health.showFewer",
  "numbers.health.todo.cover",
  "numbers.health.todo.description",
  "numbers.health.todo.genreAndMood",
  "numbers.health.todo.creditsOnEveryTrack",
  "numbers.health.todo.lyrics",
  "numbers.health.todo.buyLink",
  "numbers.health.todo.versionNote",
  "numbers.health.done.cover",
  "numbers.health.done.description",
  "numbers.health.done.genreAndMood",
  "numbers.health.done.creditsOnEveryTrack",
  "numbers.health.done.lyrics",
  "numbers.health.done.buyLink",
  "numbers.health.done.versionNote",
  "numbers.nextRelease.heading",
  "numbers.nextRelease.in",
  "numbers.nextRelease.daysAndHours",
  "numbers.nextRelease.underAnHour",
  "numbers.nextRelease.now",
  "numbers.nextRelease.openCta",
  "numbers.placements.heading",
  "numbers.placements.dek",
  "numbers.placements.yourTracks",
  "numbers.placements.moreTracks_one",
  "numbers.placements.moreTracks_other",
  "numbers.placements.lastAdded",
  "numbers.placements.empty",
  "numbers.placements.showMore",
  "numbers.milestones.heading",
  "numbers.milestones.dek",
  "numbers.milestones.new",
  "numbers.milestones.reachedOn",
  "numbers.milestones.shareCta",
  "numbers.milestones.empty",
  "numbers.milestones.showAll",
  "numbers.milestones.showFewer",
  "share.milestone.followers",
  "share.milestone.firstPlacement",
  "share.milestone.trackPlays",
  "share.milestone.artistPlays",
  "share.milestone.dialogTitle",
  "share.milestone.dialogSub",
  "share.milestone.optionsLabel",
  "errors.reason.studio_milestone_not_found",
  "errors.what.placements",
  "errors.what.milestones",
];

const tokensOf = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("Studio dashboard Part 1 catalog keys", () => {
  it("exist in both languages with the same tokens", () => {
    for (const key of DASHBOARD_KEYS) {
      expect(en[key], `en ${key}`).toEqual(expect.any(String));
      expect(pt[key], `pt ${key}`).toEqual(expect.any(String));
      expect(tokensOf(pt[key] ?? ""), key).toEqual(tokensOf(en[key] ?? ""));
    }
  });
  it("carry no dashes, no antithesis and no closing full stop", () => {
    for (const key of DASHBOARD_KEYS)
      for (const value of [en[key] ?? "", pt[key] ?? ""]) {
        expect(value, key).not.toMatch(/[\u2013\u2014]/);
        expect(value, key).not.toMatch(
          /, not |rather than|instead of|not just|, never /,
        );
        expect(value, key).not.toMatch(/\.$/);
      }
  });
  it("names the milestone refusal the way the server does", () => {
    expect(en["errors.reason.studio_milestone_not_found"]).toBe(
      "This milestone is not available to you",
    );
    expect(pt["errors.reason.studio_milestone_not_found"]).toBe(
      "Este marco não está disponível para ti",
    );
  });
  it("names the milestone card kind in the shared catalog", () => {
    expect(enShared["studioShare.milestone"]).toBe("Studio milestone");
    expect(ptShared["studioShare.milestone"]).toBe("Marco do Studio");
  });
  it("says follower in PT without a gendered noun", () => {
    for (const key of DASHBOARD_KEYS)
      expect(pt[key] ?? "", key).not.toMatch(/seguidor/i);
  });
});
