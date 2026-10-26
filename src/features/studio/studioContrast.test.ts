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
    const body = ruleBody(cssOf("funding.module.css"), ".chipOn");
    expect(body).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(body).toContain("background: rgba(var(--studio-ink-rgb), 1);");
    expect(body).toContain("color: var(--studio-surface);");
  });

  it("inverts the triage play button on the Studio ink channel", () => {
    const body = ruleBody(cssOf("council.module.css"), ".pmPlay");
    expect(body).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(body).toContain("background: rgba(var(--studio-ink-rgb), 1);");
  });

  it("gives the withdrawn card play button the two-tone focus ring", () => {
    const body = ruleBody(
      cssOf("StudioWithdrawnPage.module.css"),
      ".playFab:focus-visible",
    );
    expect(body).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(body).toContain("outline: var(--focus-ring);");
    expect(body).toContain("outline-offset: var(--focus-ring-offset);");
    expect(body).toContain("box-shadow: var(--ring-cream);");
  });

  it("draws the settings toggle knob in light cream on an AA accent track", () => {
    const source = cssOf("StudioSettingsPage.module.css");
    const knob = ruleBody(source, ".tgSw::after");
    expect(knob).not.toMatch(THEME_FLIPPING_SURFACE);
    expect(knob).toContain("background: rgba(var(--cream-rgb), 1);");
    expect(ruleBody(source, ".tgSwOn")).toContain(
      "background: var(--accent-fill);",
    );
  });

  it.each([
    ["funding.module.css", ".btP"],
    ["funding.module.css", ".djStepOn .num"],
    ["council.module.css", ".btP"],
    ["StudioSettingsPage.module.css", ".segBtnOn"],
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

  it("keeps the hero play button on the coral fill with dark ink", () => {
    // The hero and card sizes share one rule in the kit play button.
    const body = ruleBody(
      cssOf("kit/StudioPlayButton.module.css"),
      ".play.card",
    );
    expect(body).toContain("background: var(--accent);");
    expect(body).toContain("color: var(--studio-bg);");
  });
});
