import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Studio shells follow the app theme. Studio's own roles (--studio-ink-rgb,
 * --studio-surface) flip with it, while --cream and --paper resolve to the
 * app page colours. These rules once painted with the app colours and dropped
 * to about 1:1 contrast. CSS cannot be measured in jsdom, so this test pins
 * the declarations that carry the fix.
 */
const STUDIO_DIR = "src/features/studio";

function cssOf(fileName: string): string {
  return readFileSync(`${STUDIO_DIR}/${fileName}`, "utf8");
}

function escapeForRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The declarations of the rule whose selector list is exactly `selector`. */
function ruleBody(source: string, selector: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)${escapeForRegExp(selector)}\\s*\\{([^}]*)\\}`,
  );
  const body = pattern.exec(source)?.[1];
  if (body === undefined) throw new Error(`No rule found for ${selector}`);
  return body;
}

const THEME_FLIPPING_SURFACE = /var\(--cream\)|var\(--paper\)/;

describe("Studio demo page contrast", () => {
  it("inverts the selected open calls chip on the Studio ink channel", () => {
    const body = ruleBody(
      cssOf("funding.module.css"),
      ".filter .chipOn.chipOn",
    );
    expect(body).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(body).toContain("background: rgba(var(--studio-ink-rgb), 1);");
    expect(body).toContain("color: var(--studio-surface);");
  });

  it("inverts the triage play button on the Studio ink channel", () => {
    const body = ruleBody(cssOf("council.module.css"), ".pmPlay");
    expect(body).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(body).toContain("background: rgba(var(--studio-ink-rgb), 1);");
  });

  it("shows the withdrawn card's decorative play with the focus of the card link", () => {
    // The whole card is the link and carries the focus ring, so the play
    // glyph inside it is decorative and appears whenever the card has focus.
    const body = ruleBody(
      cssOf("StudioWithdrawnPage.module.css"),
      ".tcard:focus-visible .playFab",
    );
    expect(body).toContain("opacity: 1;");
    expect(body).toContain("transform: none;");
  });

  it.each([
    ["funding.module.css", ".djStepOn .num"],
    ["council.module.css", ".btP"],
  ])("sets the %s %s label in dark ink on the coral fill", (file, selector) => {
    const body = ruleBody(cssOf(file), selector);
    expect(body).toContain("background: var(--accent);");
    expect(body).toContain("color: var(--studio-bg);");
    expect(body).not.toContain("color: rgba(var(--cream-rgb), 1);");
  });

  it("draws the withdrawn card play icon in dark ink on the coral button", () => {
    const body = ruleBody(
      cssOf("StudioWithdrawnPage.module.css"),
      ".playFab svg",
    );
    expect(body).toContain("color: var(--studio-bg);");
  });

  it("draws the card play button from the Studio accent pair", () => {
    // In dark the pair resolves to the same coral fill and plum label as
    // before; in light it is the deeper coral with a white label.
    const body = ruleBody(
      cssOf("kit/StudioPlayButton.module.css"),
      ".play.card",
    );
    expect(body).toContain("background: var(--studio-accent);");
    expect(body).toContain("color: var(--studio-on-accent);");
  });
});
