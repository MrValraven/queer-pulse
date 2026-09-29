import { describe, expect, it } from "vitest";
import { primitivesToSvg } from "../render/primitivesToSvg";
import { UNO_REVERSE_TEMPLATE } from "./unoReverse.template";
import { unoReverseGeometry } from "./unoReverse.geometry";
import {
  UNO_REVERSE_DEFAULTS,
  UNO_REVERSE_FLAG_IDS,
} from "./unoReverse.params";

describe("UNO_REVERSE_TEMPLATE geometry", () => {
  for (const flagId of UNO_REVERSE_FLAG_IDS) {
    it(`matches unoReverseGeometry for ${flagId}`, () => {
      const templateSvg = primitivesToSvg(
        UNO_REVERSE_TEMPLATE.geometry(
          UNO_REVERSE_TEMPLATE.defaultStyle,
          flagId,
        ),
        512,
      );
      const referenceSvg = primitivesToSvg(
        unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId }),
        512,
      );
      expect(templateSvg).toBe(referenceSvg);
    });
  }
});

describe("UNO_REVERSE_TEMPLATE.parseStyle", () => {
  it("returns null when frameWidth is a string", () => {
    const parsedStyle = UNO_REVERSE_TEMPLATE.parseStyle({
      frameColor: "#f6f2e8",
      frameWidth: "18",
      ringAngleDeg: 22,
      ringStrokeWidth: 12,
      hasCornerArrows: true,
      cornerArrowScale: 0.4,
    });
    expect(parsedStyle).toBeNull();
  });
});

describe("UNO_REVERSE_TEMPLATE.itemIdOfParams", () => {
  it("reads flagId from the params", () => {
    expect(UNO_REVERSE_TEMPLATE.itemIdOfParams({ flagId: "bisexual" })).toBe(
      "bisexual",
    );
  });
});

describe("UNO_REVERSE_TEMPLATE.slugFor", () => {
  it("prefixes the item id with the template's slug prefix", () => {
    expect(UNO_REVERSE_TEMPLATE.slugFor("bisexual")).toBe(
      "uno-reverse-bisexual",
    );
  });
});
