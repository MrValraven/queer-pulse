import { expect, it } from "vitest";
import { sectionChangesForKindSwitch } from "./kindSwitchSections";

it("musician to DJ hides Discography, adds Mixes, keeps Gigs", () => {
  expect(sectionChangesForKindSwitch("musician", "dj")).toEqual({
    hidden: ["discography"],
    appearing: ["mixes"],
    staying: ["gigs"],
  });
});

it("developer to ceramicist swaps both sections", () => {
  expect(sectionChangesForKindSwitch("developer", "ceramicist")).toEqual({
    hidden: ["projects", "open_source"],
    appearing: ["wares", "firings"],
    staying: [],
  });
});

it("never lists the universal sections", () => {
  const changes = sectionChangesForKindSwitch("generic", "dj");
  for (const list of [changes.hidden, changes.appearing, changes.staying]) {
    expect(list).not.toContain("gallery");
    expect(list).not.toContain("links");
  }
});
