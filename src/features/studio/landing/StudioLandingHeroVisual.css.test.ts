import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const LANDING_DIRECTORY = "src/features/studio/landing";

function readLandingCss(fileName: string): string {
  return readFileSync(`${LANDING_DIRECTORY}/${fileName}`, "utf8");
}

const heroCss = readLandingCss("StudioLandingHeroVisual.module.css");

describe("StudioLandingHeroVisual.module.css", () => {
  it("stops the rise and float under the OS reduced-motion setting", () => {
    const osRules =
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(
        heroCss,
      )?.[1] ?? "";
    expect(osRules).toMatch(/\.laptop,\s*\.phone\s*\{\s*animation:\s*none/);
  });

  it("stops the rise and float under the in-app Reduce motion toggle", () => {
    expect(heroCss).toMatch(
      /:global\(html\[data-reduce-motion="true"\]\) \.laptop,\s*:global\(html\[data-reduce-motion="true"\]\) \.phone\s*\{\s*animation:\s*none/,
    );
  });

  it("centres the lone phone below 720px", () => {
    const narrowRules =
      /@media \(max-width: 719px\)\s*\{([\s\S]*?)\n\}/.exec(heroCss)?.[1] ?? "";
    expect(narrowRules).toMatch(/\.phone\s*\{[^}]*justify-self:\s*center/);
  });

  it("draws no blurred box-shadow on any landing frame or image", () => {
    for (const fileName of [
      "StudioLandingDeviceFrame.module.css",
      "StudioLandingScreenshot.module.css",
      "StudioLandingHeroVisual.module.css",
      "StudioLandingStory.module.css",
    ]) {
      expect(readLandingCss(fileName)).not.toMatch(/box-shadow:[^;]*\d+px/);
    }
  });
});
