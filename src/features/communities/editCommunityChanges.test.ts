import { describe, expect, it } from "vitest";
import {
  diffCommunityUpdates,
  hasSharedValueChange,
} from "./editCommunityChanges";
import type { UpdateCommunityDto } from "./api/communities.api";

const base: UpdateCommunityDto = {
  name: "Sunday Swim",
  tagline: "Cold water, warm people",
  rules: ["Consent is asked for out loud.", "Nobody is asked twice."],
  tags: ["swimming"],
  rosterVisible: true,
  coverImageUrl: null,
};

describe("diffCommunityUpdates", () => {
  it("reports nothing when the form has not been touched", () => {
    expect(diffCommunityUpdates(base, { ...base })).toEqual([]);
  });

  it("names a changed scalar field without quoting its value", () => {
    const changes = diffCommunityUpdates(base, { ...base, name: "Dawn Swim" });

    expect(changes).toEqual([{ field: "name" }]);
  });

  it("names what entered and what left a list field", () => {
    const changes = diffCommunityUpdates(base, {
      ...base,
      rules: ["Consent is asked for out loud.", "Kids are welcome."],
    });

    expect(changes).toHaveLength(1);
    expect(changes[0]!.field).toBe("rules");
    expect(changes[0]!.listDiff).toEqual({
      added: ["Kids are welcome."],
      removed: ["Nobody is asked twice."],
      isReordered: false,
    });
  });

  it("calls a reordered list a reorder rather than an empty change", () => {
    const changes = diffCommunityUpdates(base, {
      ...base,
      rules: ["Nobody is asked twice.", "Consent is asked for out loud."],
    });

    expect(changes[0]!.listDiff?.isReordered).toBe(true);
    expect(changes[0]!.listDiff?.added).toEqual([]);
  });

  it("reports every field that moved, in the outgoing DTO's order", () => {
    const changes = diffCommunityUpdates(base, {
      ...base,
      name: "Dawn Swim",
      rosterVisible: false,
      tags: ["swimming", "outdoors"],
    });

    expect(changes.map((change) => change.field)).toEqual([
      "name",
      "tags",
      "rosterVisible",
    ]);
  });

  it("treats a boolean flip and a cleared field as changes", () => {
    expect(
      diffCommunityUpdates(base, { ...base, rosterVisible: false }),
    ).toEqual([{ field: "rosterVisible" }]);
    expect(
      diffCommunityUpdates(
        { ...base, coverImageUrl: "https://example.test/a.jpg" },
        base,
      ),
    ).toEqual([{ field: "coverImageUrl" }]);
  });

  it("still reports a field the outgoing DTO dropped entirely", () => {
    const { tagline: _dropped, ...withoutTagline } = base;

    expect(diffCommunityUpdates(base, withoutTagline)).toEqual([
      { field: "tagline" },
    ]);
  });
});

describe("hasSharedValueChange", () => {
  it("is true only when the shared values themselves moved", () => {
    expect(hasSharedValueChange([{ field: "rules" }])).toBe(true);
    expect(hasSharedValueChange([{ field: "name" }, { field: "tags" }])).toBe(
      false,
    );
    expect(hasSharedValueChange([])).toBe(false);
  });
});
