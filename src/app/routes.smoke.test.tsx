import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../test/TestProviders";
import { AppRoutes } from "./routes";
import { routes } from "./routeMap";

/**
 * Tier-2 breadth net: mount a representative path per route family through the
 * real <AppRoutes> (lazy import + Suspense + route ErrorBoundary) under the full
 * test-provider stack in demo mode, and assert each resolves without tripping
 * the error boundary. This is boolean pass/fail — "every route family renders" —
 * not line coverage of each page.
 *
 * Demo mode (empty VITE_API_URL in vitest.config) guarantees: the auth gate
 * passes (logged-in mock user), and every data hook short-circuits to mock data,
 * so no network is touched and renders are deterministic.
 *
 * Deliberately a curated SAMPLE (~25), not all ~290 routes: one concrete URL per
 * family, param routes filled with a slug the mock data knows. The covered set is
 * logged below so it's auditable and easy to extend.
 */

// [label, concrete path]. Mostly static routes; a couple of param routes use a
// slug that exists in the mock data (joao-ribeiro is a real member).
const SMOKE_PATHS: ReadonlyArray<readonly [string, string]> = [
  ["homepage", routes.homepage],
  ["feed", "/feed"],
  ["members directory", routes.members],
  ["member profile (valid slug)", `${routes.members}/joao-ribeiro`],
  ["account profile", routes.accountProfile],
  ["search", routes.search],
  ["notifications", routes.notifications],
  ["communities", routes.communities],
  ["calendar", routes.calendar],
  ["events", routes.events],
  ["magazine", routes.magazine],
  ["magazine issues", routes.issues],
  ["cinema", routes.cinema],
  ["jobs board", routes.jobs],
  ["economy hub", routes.economy],
  ["resources library", routes.library],
  ["about", routes.about],
  ["governance", routes.governance],
  ["cookies policy", routes.cookies],
  ["emergency (safety)", routes.emergency],
  ["glossary", routes.glossary],
  ["dating", routes.dating],
  ["badges", routes.badges],
  ["connections", routes.connections],
  ["drafts", routes.drafts],
  // Subprofiles: directory, dashboard, editor (by a mock persona id), a
  // standalone persona (unlinked handle), and a nested linked persona.
  ["subprofile directory", routes.subprofiles],
  ["my subprofiles", routes.subprofilesDashboard],
  ["subprofile editor", `${routes.subprofilesDashboard}/sp-tiago-draft/edit`],
  ["standalone persona (handle)", "/p/nightform"],
  ["nested linked persona", `${routes.members}/rui/engineering`],
];

/** The route ErrorBoundary's branded fallback heading — its presence = a crash. */
const ERROR_FALLBACK = /Something broke on our/i;

describe("route smoke tests (demo mode)", () => {
  console.log(
    `[routes.smoke] covering ${SMOKE_PATHS.length} route families:\n` +
      SMOKE_PATHS.map(([label, path]) => `  • ${label} → ${path}`).join("\n"),
  );

  it.each(SMOKE_PATHS)(
    "renders %s without tripping the error boundary",
    async (_label, path) => {
      render(
        <TestProviders initialEntries={[path]}>
          <AppRoutes />
        </TestProviders>,
      );

      // Wait for the lazy chunk to resolve (Suspense fallback clears).
      await waitFor(
        () => expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
        { timeout: 10000 },
      );

      // The page mounted instead of the branded crash panel.
      expect(screen.queryByText(ERROR_FALLBACK)).not.toBeInTheDocument();
      // Something actually rendered into the document body.
      expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    },
    15000,
  );
});
