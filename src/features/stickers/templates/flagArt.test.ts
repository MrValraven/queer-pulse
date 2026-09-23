import { describe, expect, it } from "vitest";
import {
  INTERSEX_COLORS,
  PROGRESS_CHEVRON_COLORS,
  STRIPED_FLAG_IDS,
  flagBandSpans,
} from "../../../shared/data/flagStripes.data";
import { flagBodyPrimitives, flagColorShares } from "./flagArt";
import { UNO_REVERSE_FLAG_IDS } from "./unoReverse.params";

const CARD_INNER_BOX = { x: 114, y: 34, width: 284, height: 444 };

describe("flagBodyPrimitives", () => {
  it("paints a striped flag as one full-width rect per band", () => {
    for (const flagId of STRIPED_FLAG_IDS) {
      expect(flagBodyPrimitives(flagId, CARD_INNER_BOX)).toEqual(
        flagBandSpans(flagId).map((band) => ({
          type: "rect",
          x: CARD_INNER_BOX.x,
          y: CARD_INNER_BOX.y + band.start * CARD_INNER_BOX.height,
          height: (band.end - band.start) * CARD_INNER_BOX.height + 0.5,
          width: CARD_INNER_BOX.width,
          fill: band.color,
        })),
      );
    }
  });

  it("paints the chevron over the rainbow and the ring over the field", () => {
    const progressFills = flagBodyPrimitives("progress", CARD_INNER_BOX).map(
      (primitive) => (primitive.type === "group" ? null : primitive.fill),
    );
    expect(progressFills).toEqual([
      ...flagBandSpans("rainbow").map((band) => band.color),
      ...PROGRESS_CHEVRON_COLORS,
    ]);
    const intersexTypes = flagBodyPrimitives("intersex", CARD_INNER_BOX).map(
      (primitive) => primitive.type,
    );
    expect(intersexTypes).toEqual(["rect", "ellipse"]);
  });

  it("rejects an unknown flag", () => {
    expect(() => flagBodyPrimitives("not-a-flag", CARD_INNER_BOX)).toThrow(
      "Unknown flag id: not-a-flag",
    );
  });
});

describe("flagColorShares", () => {
  it("gives every offered flag shares in 0..1 that sum to 1", () => {
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      const shares = flagColorShares(flagId);
      for (const { share } of shares) {
        expect(share).toBeGreaterThan(0);
        expect(share).toBeLessThanOrEqual(1);
      }
      const total = shares.reduce((sum, { share }) => sum + share, 0);
      expect(total).toBeCloseTo(1, 9);
    }
  });

  it("sums a colour two bands share into one entry", () => {
    const shares = flagColorShares("transgender");
    expect(shares.map(({ color }) => color)).toEqual([
      "#5bcefa",
      "#f5a9b8",
      "#ffffff",
    ]);
    // Band spans are float fractions, so compare shares with a tolerance.
    [0.4, 0.4, 0.2].forEach((expectedShare, index) => {
      expect(shares[index]?.share).toBeCloseTo(expectedShare, 9);
    });
  });

  it("covers every chevron colour and leaves the rainbow most of the flag", () => {
    const shares = flagColorShares("progress");
    const chevronShare = shares
      .filter(({ color }) => PROGRESS_CHEVRON_COLORS.includes(color))
      .reduce((sum, { share }) => sum + share, 0);
    expect(shares).toHaveLength(6 + PROGRESS_CHEVRON_COLORS.length);
    expect(chevronShare).toBeGreaterThan(0.1);
    expect(chevronShare).toBeLessThan(0.5);
  });

  it("gives the Intersex field most of the area and the ring the rest", () => {
    const [field, ring] = flagColorShares("intersex");
    expect(field?.color).toBe(INTERSEX_COLORS.field);
    expect(ring?.color).toBe(INTERSEX_COLORS.ring);
    // A ring 76% of the short side across and 15% of that thick covers
    // about 15.4% of the 2:3 share box.
    const ringShare = ring?.share ?? 0;
    expect(ringShare).toBeGreaterThanOrEqual(0.13);
    expect(ringShare).toBeLessThanOrEqual(0.18);
    expect(field?.share).toBeCloseTo(1 - ringShare);
  });

  it("rejects an unknown flag", () => {
    expect(() => flagColorShares("not-a-flag")).toThrow(
      "Unknown flag id: not-a-flag",
    );
  });
});
