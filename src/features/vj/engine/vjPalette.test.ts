import { describe, expect, it } from "vitest";
import { VJ_COLOR_TOKENS, VJ_PRIDE_FLAGS } from "../../../shared/contracts/vj";
import {
  readVjPalette,
  VJ_FLAG_TOKEN_COUNTS,
  vjFlagStripeToken,
  vjPaletteToken,
} from "./vjPalette";

/**
 * A root holding every palette and flag token. Each colour token gets its
 * position in VJ_COLOR_TOKENS as the red channel, so the test can tell them
 * apart; each stripe gets its stripe number as the green channel.
 */
function rootWithTokens(): HTMLElement {
  const root = document.createElement("div");
  VJ_COLOR_TOKENS.forEach((colorToken, tokenIndex) => {
    root.style.setProperty(
      vjPaletteToken(colorToken),
      `${tokenIndex * 10}, 0, 255`,
    );
  });
  for (const flag of VJ_PRIDE_FLAGS) {
    for (
      let stripeIndex = 0;
      stripeIndex < VJ_FLAG_TOKEN_COUNTS[flag];
      stripeIndex += 1
    ) {
      root.style.setProperty(
        vjFlagStripeToken(flag, stripeIndex),
        `0, ${stripeIndex + 1},\n 51`,
      );
    }
  }
  return root;
}

describe("readVjPalette", () => {
  it("parses every palette token into 0..1 colours", () => {
    const palette = readVjPalette(rootWithTokens());

    VJ_COLOR_TOKENS.forEach((colorToken, tokenIndex) => {
      const [red, green, blue] = palette.colours[colorToken];
      expect(red).toBeCloseTo((tokenIndex * 10) / 255, 6);
      expect(green).toBe(0);
      expect(blue).toBe(1);
    });
  });

  it("reads each duotone pair as shadow then highlight", () => {
    const palette = readVjPalette(rootWithTokens());

    expect(palette.duotones["plum-coral"]).toEqual([
      palette.colours.plum,
      palette.colours.coral,
    ]);
    expect(palette.duotones["violet-amber"]).toEqual([
      palette.colours.violet,
      palette.colours.amber,
    ]);
    expect(palette.duotones["sky-rose"]).toEqual([
      palette.colours.sky,
      palette.colours.rose,
    ]);
    expect(palette.duotones["jade-cream"]).toEqual([
      palette.colours.jade,
      palette.colours.cream,
    ]);
    expect(palette.duotones["plum-jade"]).toEqual([
      palette.colours.plum,
      palette.colours.jade,
    ]);
  });

  it("reads every pride flag's stripes in order", () => {
    const palette = readVjPalette(rootWithTokens());

    for (const flag of VJ_PRIDE_FLAGS) {
      const stripes = palette.flags[flag];
      expect(stripes).toHaveLength(VJ_FLAG_TOKEN_COUNTS[flag]);
      stripes.forEach((stripe, stripeIndex) => {
        expect(stripe[0]).toBe(0);
        expect(stripe[1]).toBeCloseTo((stripeIndex + 1) / 255, 6);
        expect(stripe[2]).toBeCloseTo(0.2, 6);
      });
    }
    expect(VJ_FLAG_TOKEN_COUNTS.progress).toBe(11);
  });

  it("falls back to grey for a missing token", () => {
    const root = rootWithTokens();
    root.style.removeProperty(vjPaletteToken("sky"));
    root.style.setProperty(vjFlagStripeToken("trans", 2), "not a colour");

    const palette = readVjPalette(root);

    expect(palette.colours.sky).toEqual([0.5, 0.5, 0.5]);
    expect(palette.duotones["sky-rose"][0]).toEqual([0.5, 0.5, 0.5]);
    expect(palette.flags.trans[2]).toEqual([0.5, 0.5, 0.5]);
    expect(palette.flags.trans[1]?.[1]).toBeCloseTo(2 / 255, 6);
  });
});
