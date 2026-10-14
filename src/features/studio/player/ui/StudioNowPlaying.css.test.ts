import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  "src/features/studio/player/ui/StudioNowPlaying.module.css",
  "utf8",
);

function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(
    css,
  )?.[1];
  if (body === undefined) throw new Error(`No rule for ${selector}`);
  return body;
}

describe("Now playing at phone width", () => {
  it("clamps the title to two lines and lets it break anywhere", () => {
    const title = ruleBody(".title");
    expect(title).toMatch(/-webkit-line-clamp:\s*2/);
    expect(title).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("lets the head, meta and controls rows shrink", () => {
    for (const selector of [".head", ".meta", ".controlsRow", ".toolsRow"])
      expect(ruleBody(selector)).toMatch(/min-width:\s*0/);
  });

  it("never scrolls sideways", () => {
    expect(ruleBody(".sheet")).toMatch(/overflow-x:\s*hidden/);
  });

  it("dims the page behind a dragged frame: the frame carries the surface", () => {
    expect(ruleBody(".layer")).toMatch(/background:\s*var\(--scrim\)/);
    expect(ruleBody(".sheet")).not.toMatch(/background/);
    expect(ruleBody(".frame")).toMatch(/background:\s*var\(--studio-surface\)/);
  });

  it("keeps the phone head clear until content scrolls under it", () => {
    expect(css).toMatch(
      /\.sheet\[data-scrolled\] \.head\s*\{[^}]*backdrop-filter:/,
    );
    expect(css).not.toMatch(/\n\s*\.head\s*\{[^}]*var\(--studio-surface\)/);
  });

  it("starts the desktop cover at the column edge", () => {
    expect(ruleBody(".cover")).toMatch(/align-self:\s*flex-start/);
  });

  it("rings Retry in the can't play line", () => {
    expect(css).toMatch(
      /\.status button:focus-visible\s*\{[^}]*outline:\s*var\(--focus-ring\);[^}]*outline-offset:\s*var\(--focus-ring-offset\);[^}]*box-shadow:\s*var\(--ring-cream\)/,
    );
  });

  it("moves by opacity and transform only", () => {
    // The swipe frame names its property: a duration alone transitions all.
    expect(ruleBody(".frame")).toMatch(/transition-property:\s*transform\s*;/);
    expect(css).not.toMatch(/transition:\s*all/);
    expect(css).not.toMatch(
      /transition-property:\s*(?!opacity|transform|background-color|color)/,
    );
  });
});
