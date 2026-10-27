import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  "src/features/studio/landing/StudioLandingGallery.module.css",
  "utf8",
);

describe("StudioLandingGallery.module.css", () => {
  it("scrolls the chip row sideways inside itself on phones", () => {
    const phoneRules =
      /@media \(max-width: 719px\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
    const chipRowRule =
      /\.gallery \.chipRow\s*\{([^}]*)\}/.exec(phoneRules)?.[1] ?? "";
    expect(chipRowRule).toMatch(/flex-wrap:\s*nowrap/);
    expect(chipRowRule).toMatch(/overflow-x:\s*auto/);
    expect(chipRowRule).toMatch(/min-width:\s*0/);
    expect(chipRowRule).toMatch(/max-width:\s*100%/);
    expect(chipRowRule).toMatch(/scroll-snap-type:\s*x mandatory/);
    expect(phoneRules).toMatch(
      /\.gallery \.chipRow \[role="tab"\]\s*\{[^}]*scroll-snap-align:\s*start/,
    );
  });

  it("lets the section's grid column shrink below its content", () => {
    expect(css).toMatch(
      /\.inner\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
  });
});
