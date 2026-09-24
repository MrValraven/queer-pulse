import { describe, expect, it } from "vitest";
import type { AffiliationDTO, AffiliationOptionDTO } from "./subprofiles.api";
import {
  affiliationOptionsForRow,
  affiliationTargetKey,
  mergeSavedAffiliationOptions,
} from "./useAffiliationOptions";

/**
 * The pure helpers behind the "Part of" editor: merging a persona's saved
 * links into the owner's eligible targets (so a co-owner's link still shows
 * selected) and splitting one row's choices into "of this type" and "still
 * pickable". No providers needed.
 */

function makeOption(
  overrides: Pick<AffiliationOptionDTO, "targetType" | "targetSlug" | "name">,
): AffiliationOptionDTO {
  return { imageUrl: null, startsAt: null, ...overrides };
}

function makeSaved(
  overrides: Pick<AffiliationDTO, "targetType" | "targetSlug" | "name">,
): AffiliationDTO {
  return { role: "member", imageUrl: null, ...overrides };
}

const ownerOptions: AffiliationOptionDTO[] = [
  makeOption({
    targetType: "community",
    targetSlug: "rainbow-arts",
    name: "Rainbow Arts Collective",
  }),
  makeOption({
    targetType: "event",
    targetSlug: "queer-karaoke-night",
    name: "Queer Karaoke Night",
  }),
];

const targetKeysOf = (options: readonly AffiliationOptionDTO[]) =>
  options.map((option) =>
    affiliationTargetKey(option.targetType, option.targetSlug),
  );

describe("mergeSavedAffiliationOptions", () => {
  it("returns the options unchanged when every saved link is already there", () => {
    const merged = mergeSavedAffiliationOptions(ownerOptions, [
      makeSaved({
        targetType: "event",
        targetSlug: "queer-karaoke-night",
        name: "Queer Karaoke Night",
      }),
    ]);
    expect(merged).toEqual(ownerOptions);
    expect(merged).not.toBe(ownerOptions);
  });

  it("dedupes by type and slug, so the same slug of another type is kept", () => {
    const merged = mergeSavedAffiliationOptions(ownerOptions, [
      makeSaved({
        targetType: "community",
        targetSlug: "rainbow-arts",
        name: "Rainbow Arts Collective",
      }),
      makeSaved({
        targetType: "event",
        targetSlug: "rainbow-arts",
        name: "Rainbow Arts Open Studio",
      }),
      makeSaved({
        targetType: "event",
        targetSlug: "rainbow-arts",
        name: "Rainbow Arts Open Studio",
      }),
    ]);
    expect(targetKeysOf(merged)).toEqual([
      "community:rainbow-arts",
      "event:queer-karaoke-night",
      "event:rainbow-arts",
    ]);
  });

  it("puts each saved-only link at the end of its own type", () => {
    const merged = mergeSavedAffiliationOptions(ownerOptions, [
      makeSaved({
        targetType: "event",
        targetSlug: "drag-brunch",
        name: "Drag Brunch",
      }),
      makeSaved({
        targetType: "community",
        targetSlug: "co-owners-collective",
        name: "Co-owners Collective",
      }),
    ]);
    expect(targetKeysOf(merged)).toEqual([
      "community:rainbow-arts",
      "community:co-owners-collective",
      "event:queer-karaoke-night",
      "event:drag-brunch",
    ]);
    // A saved-only target carries the saved name and no start date.
    expect(merged[1]).toEqual({
      targetType: "community",
      targetSlug: "co-owners-collective",
      name: "Co-owners Collective",
      imageUrl: null,
      startsAt: null,
    });
  });
});

describe("affiliationOptionsForRow", () => {
  it("splits a row's choices into its type and the ones still free", () => {
    const options = [
      ...ownerOptions,
      makeOption({
        targetType: "community",
        targetSlug: "trans-hub",
        name: "Trans & Non-Binary Hub",
      }),
    ];
    const { optionsOfType, eligibleOptions } = affiliationOptionsForRow(
      options,
      "community",
      new Set([affiliationTargetKey("community", "rainbow-arts")]),
    );
    expect(targetKeysOf(optionsOfType)).toEqual([
      "community:rainbow-arts",
      "community:trans-hub",
    ]);
    expect(targetKeysOf(eligibleOptions)).toEqual(["community:trans-hub"]);
  });

  it("has nothing eligible when another row links the only target", () => {
    const { optionsOfType, eligibleOptions } = affiliationOptionsForRow(
      ownerOptions,
      "event",
      new Set([affiliationTargetKey("event", "queer-karaoke-night")]),
    );
    expect(optionsOfType).toHaveLength(1);
    expect(eligibleOptions).toHaveLength(0);
  });
});
