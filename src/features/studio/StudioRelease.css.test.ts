import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  "src/features/studio/StudioRelease.module.css",
  "utf8",
);

describe("Album tracklist at phone width", () => {
  it("wraps titles between words with hyphenation", () => {
    const rule = /\.tracklist > li h5\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/overflow-wrap:\s*break-word/);
    expect(rule).toMatch(/hyphens:\s*auto/);
    expect(rule).not.toMatch(/anywhere/);
  });

  it("moves the time cell to a second line under the title", () => {
    const compact = css.slice(css.lastIndexOf("@media (--sm)"));
    expect(compact).toMatch(
      /grid-template-columns:\s*32px 32px minmax\(0, 1fr\);/,
    );
    const cell = /\.timeCell\s*\{([^}]*)\}/.exec(compact)?.[1] ?? "";
    expect(cell).toMatch(/grid-column:\s*3/);
    expect(cell).toMatch(/grid-row:\s*2/);
  });
});
