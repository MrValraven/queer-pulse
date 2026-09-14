import { describe, expect, it } from "vitest";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  notShownOnProfileReason,
  splitByProfileVisibility,
} from "./mySubprofiles.data";

// Unrun per repo policy (`do-not-run-tests-unless-asked`) — verified statically.

/** The two fields the split reads, plus an id to assert order by. Everything
 *  else on the view is irrelevant here, so the cast keeps the fixture honest
 *  about what is actually under test. */
function makePersona(
  id: string,
  linkVisibility: SubprofileView["linkVisibility"],
  status: SubprofileView["status"],
): SubprofileView {
  return { id, linkVisibility, status } as SubprofileView;
}

const idsOf = (personas: SubprofileView[]) =>
  personas.map((persona) => persona.id);

describe("splitByProfileVisibility", () => {
  it("lists only published personas that are linked to the profile", () => {
    const { shownOnProfile, notShownOnProfile } = splitByProfileVisibility([
      makePersona("linked-published", "linked", "published"),
      makePersona("linked-draft", "linked", "draft"),
      makePersona("unlinked-published", "unlinked", "published"),
      makePersona("unlinked-draft", "unlinked", "draft"),
    ]);
    expect(idsOf(shownOnProfile)).toEqual(["linked-published"]);
    expect(idsOf(notShownOnProfile)).toEqual([
      "linked-draft",
      "unlinked-published",
      "unlinked-draft",
    ]);
  });

  it("preserves relative order inside both groups", () => {
    const { shownOnProfile, notShownOnProfile } = splitByProfileVisibility([
      makePersona("shown-a", "linked", "published"),
      makePersona("hidden-a", "unlinked", "published"),
      makePersona("shown-b", "linked", "published"),
      makePersona("hidden-b", "linked", "draft"),
      makePersona("shown-c", "linked", "published"),
    ]);
    expect(idsOf(shownOnProfile)).toEqual(["shown-a", "shown-b", "shown-c"]);
    expect(idsOf(notShownOnProfile)).toEqual(["hidden-a", "hidden-b"]);
  });

  it("keeps every persona, so the reorder payload stays a complete list", () => {
    const personas = [
      makePersona("one", "linked", "published"),
      makePersona("two", "unlinked", "draft"),
      makePersona("three", "linked", "draft"),
    ];
    const { shownOnProfile, notShownOnProfile } =
      splitByProfileVisibility(personas);
    expect(
      [...idsOf(shownOnProfile), ...idsOf(notShownOnProfile)].sort(),
    ).toEqual(idsOf(personas).sort());
  });

  it("handles an empty list", () => {
    expect(splitByProfileVisibility([])).toEqual({
      shownOnProfile: [],
      notShownOnProfile: [],
    });
  });
});

describe("notShownOnProfileReason", () => {
  it("sends a draft to the editor's publish pane", () => {
    expect(
      notShownOnProfileReason(makePersona("id", "linked", "draft")),
    ).toMatchObject({
      reasonKey: "subprofiles:mine.notShown.draftReason",
      pane: "publish",
    });
  });

  it("sends a published standalone persona to the address pane", () => {
    expect(
      notShownOnProfileReason(makePersona("id", "unlinked", "published")),
    ).toMatchObject({
      reasonKey: "subprofiles:mine.notShown.standaloneReason",
      pane: "address",
    });
  });

  it("prefers the draft reason when a persona is both a draft and standalone", () => {
    expect(
      notShownOnProfileReason(makePersona("id", "unlinked", "draft")).pane,
    ).toBe("publish");
  });
});
