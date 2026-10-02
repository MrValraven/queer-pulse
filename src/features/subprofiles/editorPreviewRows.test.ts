import { describe, expect, it } from "vitest";
import { previewAffiliations, previewSocialLinks } from "./editorPreviewRows";

/**
 * The docked preview shows social links and "Part of" links as the Save
 * chain would write them, before Save: blank rows are left out, and a newly
 * picked target is named from the picker's options.
 */
describe("previewSocialLinks", () => {
  it("keeps typed rows, trimmed, in order, and drops blank ones", () => {
    expect(
      previewSocialLinks([
        { _uid: "a", platform: "website", urlOrHandle: " mesadodragao.pt " },
        { _uid: "b", platform: "instagram", urlOrHandle: "   " },
        { _uid: "c", platform: "instagram", urlOrHandle: "@mesadodragao" },
      ]),
    ).toEqual([
      { platform: "website", urlOrHandle: "mesadodragao.pt" },
      { platform: "instagram", urlOrHandle: "@mesadodragao" },
    ]);
  });
});

describe("previewAffiliations", () => {
  it("names a new pick from the options and a kept one from the saved list", () => {
    expect(
      previewAffiliations(
        [
          { _uid: "a", targetType: "community", targetSlug: "", role: "" },
          {
            _uid: "b",
            targetType: "event",
            targetSlug: "dice-night",
            role: "GM",
          },
          {
            _uid: "c",
            targetType: "community",
            targetSlug: "queer-gamers",
            role: "",
          },
        ],
        [
          {
            targetType: "event",
            targetSlug: "dice-night",
            name: "Dice Night",
            imageUrl: null,
            startsAt: null,
          },
        ],
        [
          {
            targetType: "community",
            targetSlug: "queer-gamers",
            role: "",
            name: "Queer Gamers Lisboa",
            imageUrl: null,
          },
        ],
      ).map((affiliation) => affiliation.name),
    ).toEqual(["Dice Night", "Queer Gamers Lisboa"]);
  });
});
