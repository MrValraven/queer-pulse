import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated color-contrast pass (audit X-7), in DEMO mode.
 *
 * The jsdom-based a11y suite (src/test/a11y.test.tsx) DISABLES axe's
 * `color-contrast` rule because jsdom has no layout engine and can never resolve
 * computed colours — it can only ever return "incomplete" there. A real browser
 * can, so this Playwright pass is the only place `color-contrast` (and other
 * computed-style rules) actually runs against rendered CSS.
 *
 * Deliberately SMALL: a handful of representative surfaces (marketing shell, a
 * card grid, an events hub, long-form editorial, a dense settings form, a Q&A
 * board). Contrast violations are overwhelmingly shared-layer (tokens, Button,
 * Card, nav, footer), so these few pages surface nearly everything. Extend the
 * list only when a new *kind* of surface with distinct colour treatment appears.
 *
 * NOT run in the required CI gate — it lives in the optional `e2e` job (browser
 * download + dev server). Run locally with `pnpm test:e2e`.
 */

const ROUTES: ReadonlyArray<readonly [string, string]> = [
  ["marketing homepage", "/"],
  ["members directory (card grid)", "/members"],
  ["events hub", "/events"],
  ["magazine (long-form editorial)", "/magazine"],
  ["settings (dense form controls)", "/account/settings"],
  ["forum (Q&A board)", "/forum"],
];

for (const [label, path] of ROUTES) {
  test(`contrast: ${label} has no color-contrast violations`, async ({
    page,
  }) => {
    await page.goto(path);
    // Let the lazy route chunk resolve so we scan the real page, not the
    // Suspense fallback.
    await expect(page.getByText("Loading…")).toHaveCount(0);

    const results = await new AxeBuilder({ page })
      // Focus this pass on what jsdom cannot check: computed-colour rules. The
      // structural a11y net already runs the full ruleset under jsdom.
      .withRules(["color-contrast"])
      .analyze();

    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });
}
