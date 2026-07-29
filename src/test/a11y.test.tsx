import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { TestProviders } from "./TestProviders";
import { AppRoutes } from "../app/routes";
import { routes } from "../app/routeMap";

/**
 * Automated accessibility net: mount a representative page per surface family
 * through the real <AppRoutes> under the full provider stack (demo mode), then
 * run axe-core over the rendered tree.
 *
 * Relationship to routes.smoke.test.tsx: that suite asks "does it render?"; this
 * one asks "is what rendered accessible?". Deliberately a much SMALLER sample
 * than the smoke suite — axe is ~100x the cost of a render assertion, and the
 * violations it finds are overwhelmingly shared-layer (nav, shell, Button, Card,
 * FormField), so a handful of pages surfaces nearly everything a full sweep
 * would. Extend AXE_PATHS when a new *kind* of surface appears (a new form
 * pattern, a new tab/dialog primitive), not for every new route.
 *
 * `toHaveNoViolations` is registered globally in ./setup.ts.
 */

// [label, concrete path]. One page per surface family, chosen to hit distinct
// markup: marketing shell, app shell, a data grid, a long-form article, a
// settings form, and an auth form (the densest form markup in the app).
const AXE_PATHS: ReadonlyArray<readonly [string, string]> = [
  ["marketing homepage (PageShell + Navbar + Footer)", routes.homepage],
  ["members directory (filters + card grid)", routes.members],
  ["events hub (PageShell + hero + tabs + cards)", routes.events],
  ["magazine (long-form editorial markup)", routes.magazine],
  ["settings (form controls via FormField)", routes.settings],
  ["about (static prose page)", routes.about],
];

/**
 * Rules disabled for this environment, with the reason. These are jsdom
 * limitations, NOT accepted violations — do not add real findings here.
 *
 * - `color-contrast` needs a layout engine to resolve computed colours; jsdom
 *   has none, so axe can only ever return "incomplete" for it. Contrast is
 *   audited separately and by measurement in
 *   docs/production-readiness/contrast-audit.md.
 */
const JSDOM_UNRUNNABLE = ["color-contrast"];

/**
 * Pre-existing violations the maintainer has not triaged yet. EMPTY BY DESIGN —
 * it exists so that, if this suite lands red on the first CI run, the fix is a
 * documented one-line quarantine per rule (with a ticket) rather than deleting
 * the suite. Every entry here is debt: the goal is to keep this array empty.
 */
const QUARANTINED: string[] = [];

describe("accessibility (axe-core)", () => {
  it.each(AXE_PATHS)(
    "%s has no axe violations",
    async (_label, path) => {
      const { container } = render(
        <TestProviders initialEntries={[path]}>
          <AppRoutes />
        </TestProviders>,
      );

      // Wait for the lazy route chunk to resolve before auditing, or axe would
      // audit the Suspense fallback instead of the page.
      await waitFor(
        () => expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
        { timeout: 10000 },
      );

      const results = await axe(container, {
        rules: Object.fromEntries(
          [...JSDOM_UNRUNNABLE, ...QUARANTINED].map((id) => [
            id,
            { enabled: false },
          ]),
        ),
      });

      expect(results).toHaveNoViolations();
    },
    30000,
  );

  it("renders exactly one <main> landmark per page", async () => {
    render(
      <TestProviders initialEntries={[routes.homepage]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitFor(
      () => expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
      { timeout: 10000 },
    );

    // Regression guard for the nested-<main> cleanup: PageShell/AppShell own the
    // one and only `<main>`, which is what the skip link targets. A page that
    // renders its own nested <main> silently breaks skip-link focus and landmark
    // navigation, and it is an easy mistake to reintroduce by copy-paste.
    expect(document.querySelectorAll("main")).toHaveLength(1);
  }, 15000);
});
