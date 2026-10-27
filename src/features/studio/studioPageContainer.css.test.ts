import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(`src/features/studio/${name}`, "utf8");

const studioCss = read("studio.module.css");
const trackCss = read("track.module.css");
const liveCss = read("live.module.css");
const sheetCss = read("sheet.module.css");
const broadcastCss = read("StudioBroadcastPage.module.css");
const programCss = read("StudioProgramPage.module.css");
const pagesCss = read("studioPages.module.css");

const escapeForRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The body of the first top-level rule for `selector`, with prettier's
 *  line wrapping folded back onto one line. */
const rule = (css: string, selector: string) => {
  const body =
    new RegExp(`(?:^|\\n)${escapeForRegex(selector)}\\s*\\{([^}]*)\\}`).exec(
      css,
    )?.[1] ?? "";
  return body
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
};

/** Everything from the `@container` line up to the next top-level at-rule. */
const containerBlock = (css: string, query: string) => {
  const start = css.indexOf(`@container ${query}`);
  if (start === -1) return "";
  const next = css.indexOf("\n@", start + 1);
  return css.slice(start, next === -1 ? undefined : next);
};

describe("Studio page column container", () => {
  it("makes the page column a named inline-size container", () =>
    expect(rule(studioCss, ".content")).toMatch(
      /container:\s*studio-page \/ inline-size/,
    ));

  it("opens a third grid track for the docked panel", () => {
    expect(studioCss).toMatch(/--studio-side-panel-w:\s*360px/);
    expect(rule(studioCss, ".app")).toMatch(
      /grid-template-columns:\s*var\(--studio-app-rail-col\) minmax\(0, 1fr\) var\(--studio-app-panel-col\)/,
    );
    expect(rule(studioCss, ".app[data-side-panel-open]")).toMatch(
      /--studio-app-panel-col:\s*var\(--studio-side-panel-w\)/,
    );
  });

  it("stacks the detail and set sidebars on a narrow page column", () => {
    const block = containerBlock(studioCss, "studio-page (max-width: 759px)");
    expect(block).toMatch(/\.detailGrid/);
    expect(block).toMatch(/\.split/);
    expect(block).toMatch(/minmax\(0, 1fr\)/);
  });

  it("moves the wide viewport gates to the page column", () => {
    expect(liveCss).not.toMatch(/max-width:\s*960px/);
    expect(broadcastCss).not.toMatch(/max-width:\s*1180px/);
    expect(programCss).not.toMatch(/max-width:\s*1100px/);
    expect(pagesCss).not.toMatch(/min-width:\s*820px/);
    for (const css of [trackCss, liveCss, sheetCss, broadcastCss, programCss])
      expect(css).toMatch(/@container studio-page/);
  });
});
