import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/features/studio/StudioPlayer.module.css", "utf8");

describe("StudioPlayer.module.css", () => {
  it("keeps the bar above the tab bar and the consent banner", () => {
    expect(css).toMatch(
      /bottom:\s*max\(var\(--bottom-inset\),\s*var\(--consent-inset,\s*0px\)\)/,
    );
    expect(css).toMatch(/\.spacer\s*\{[^}]*--studio-player-inset/);
  });

  it("has no in-place expand left", () => {
    expect(css).not.toMatch(/data-expanded|expandToggle/);
  });

  it("keeps the class names other files read", () => {
    for (const name of [
      ".seekRow",
      ".time",
      ".seek",
      ".showcase",
      ".payLine",
      ".tip",
    ])
      expect(css).toContain(`${name} {`);
  });

  it("keeps the title readable on narrow desktops", () => {
    const narrowRule = /@media \(max-width: 1180px\)\s*\{([\s\S]*?)\n\}/.exec(
      css,
    )?.[1];
    expect(narrowRule).toMatch(/grid-template-columns:\s*minmax\(312px/);
    expect(narrowRule).toMatch(
      /\.tools input\[type="range"\],\s*\.seekArea \.time\s*\{\s*display:\s*none/,
    );
  });

  it("keeps the idle error region out of flow and in the accessibility tree", () => {
    const idleRule = /\.status:empty\s*\{([^}]*)\}/.exec(css)?.[1];
    expect(idleRule).toMatch(/position:\s*absolute/);
    expect(idleRule).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(idleRule).not.toMatch(/display:\s*none/);
  });

  it("gives the seek its own row where the tools could squeeze it", () => {
    const stackedRule = /@media \(max-width: 1040px\)\s*\{([\s\S]*?)\n\}/.exec(
      css,
    )?.[1];
    expect(stackedRule).toMatch(
      /\.seekArea\s*\{\s*grid-column:\s*1 \/ -1;\s*grid-row:\s*2;/,
    );
  });

  it("gives the mini play button a full tap area", () => {
    expect(css).toMatch(
      /\.playButton::before\s*\{[^}]*inset-block:\s*min\(0px,\s*calc\(\(100% - var\(--tap-min\)\) \/ 2\)\)/,
    );
  });

  it("lets the mini card take a vertical swipe", () => {
    expect(css).toMatch(/\.mini\s*\{[^}]*touch-action:\s*none/);
  });

  it("keeps the heart and Add to playlist together at the row's end", () => {
    expect(css).toMatch(
      /\.addToPlaylistSlot\s*\{[^}]*margin-inline-start:\s*auto/,
    );
    expect(css).toMatch(
      /\.addToPlaylistSlot \.like,\s*\.miniLikeSlot \.like\s*\{[^}]*margin-block:\s*0/,
    );
    expect(css).toMatch(/\.like:active\s*\{\s*transform:\s*scale\(0\.92\)/);
  });
});
