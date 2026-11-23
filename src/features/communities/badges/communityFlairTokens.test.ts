import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COMMUNITY_FLAIR_TINTS } from "./communityBadges.catalog";

const colorsCss = readFileSync(
  resolve(process.cwd(), "src/styles/tokens/colors.css"),
  "utf8",
);

const LIGHT_BLOCK_START = /^:root,\n\[data-theme="light"\] \{/m;
const DARK_BLOCK_START = /^\[data-theme="dark"\] \{/m;

const darkStart = colorsCss.search(DARK_BLOCK_START);
const lightStart = colorsCss.search(LIGHT_BLOCK_START);

const BLOCKS: Record<"light" | "dark", string> = {
  light: colorsCss.slice(lightStart, darkStart),
  dark: colorsCss.slice(darkStart),
};

function readHex(block: string, tokenName: string): string | undefined {
  const match = new RegExp(`${tokenName}:\\s*(#[0-9a-fA-F]{6});`).exec(block);
  return match?.[1];
}

function channelToLinear(channel: number): number {
  const unit = channel / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const red = channelToLinear(parseInt(hex.slice(1, 3), 16));
  const green = channelToLinear(parseInt(hex.slice(3, 5), 16));
  const blue = channelToLinear(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(firstHex: string, secondHex: string): number {
  const first = relativeLuminance(firstHex);
  const second = relativeLuminance(secondHex);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const THEMES = ["light", "dark"] as const;

describe("community flair tint tokens", () => {
  it("finds both theme blocks in colors.css", () => {
    expect(lightStart).toBeGreaterThanOrEqual(0);
    expect(darkStart).toBeGreaterThan(lightStart);
  });

  it("defines a ground and an ink for every tint in both themes", () => {
    for (const theme of THEMES) {
      for (const tint of COMMUNITY_FLAIR_TINTS) {
        expect(
          readHex(BLOCKS[theme], `--flair-${tint}-ground`),
          `${theme} ${tint} ground`,
        ).toBeDefined();
        expect(
          readHex(BLOCKS[theme], `--flair-${tint}-ink`),
          `${theme} ${tint} ink`,
        ).toBeDefined();
      }
    }
  });

  it("defines a ring token resolving against the ink in both themes", () => {
    for (const theme of THEMES) {
      for (const tint of COMMUNITY_FLAIR_TINTS) {
        expect(BLOCKS[theme]).toContain(
          `--ring-flair-${tint}: 0 0 0 2px var(--flair-${tint}-ink);`,
        );
      }
    }
  });

  it("keeps every ink at 4.5:1 or more on its ground", () => {
    for (const theme of THEMES) {
      for (const tint of COMMUNITY_FLAIR_TINTS) {
        const ground = readHex(BLOCKS[theme], `--flair-${tint}-ground`);
        const ink = readHex(BLOCKS[theme], `--flair-${tint}-ink`);
        expect(ground).toBeDefined();
        expect(ink).toBeDefined();
        expect(
          contrastRatio(ink ?? "#000000", ground ?? "#000000"),
          `${theme} ${tint}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps every ring visible at 3:1 on cream and paper", () => {
    for (const theme of THEMES) {
      const cream = readHex(BLOCKS[theme], "--cream");
      const paper = readHex(BLOCKS[theme], "--paper");
      expect(cream).toBeDefined();
      expect(paper).toBeDefined();
      for (const tint of COMMUNITY_FLAIR_TINTS) {
        const ink = readHex(BLOCKS[theme], `--flair-${tint}-ink`) ?? "#000000";
        expect(
          contrastRatio(ink, cream ?? "#000000"),
          `${theme} ${tint} on cream`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(ink, paper ?? "#000000"),
          `${theme} ${tint} on paper`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
