import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AppRoutes } from "../../app/routes";
import { AUTH_STORAGE_KEY } from "../marketing/cookies.data";

/**
 * Phase 1b: `SubprofilePage` rendering the four `usePublicSubprofile`
 * outcomes end to end (demo mode, through the real `<AppRoutes>` — same
 * pattern as `routes.smoke.test.tsx`, but asserting the actual wall/banner
 * copy per state rather than just "didn't crash"). Covers the three
 * restricted-state fixtures + the not-found fallback + the owner-draft-preview
 * path that finally mounts `SubprofileDraftBanner` (built in Phase 1, unmounted
 * until this phase wired a `status` signal through to the public read).
 */

const LOADING_TEXT = "Loading…";

async function waitForPageLoad() {
  await waitFor(() => {
    expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument();
    expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SubprofilePage restricted states (demo mode)", () => {
  it("renders the private wall for a visibility:private persona", async () => {
    render(
      <TestProviders initialEntries={["/p/anika-journal"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(await screen.findByText("This side is private")).toBeInTheDocument();
  });

  it("renders the members-only wall for a signed-out visitor on a visibility:network persona", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders initialEntries={["/p/afterhours-jordan"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(await screen.findByText("Members only")).toBeInTheDocument();
  });

  it("renders the removed wall for a persona with removedAt set", async () => {
    render(
      <TestProviders initialEntries={["/p/casa-corvo-antiga"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(
      await screen.findByText("This side was taken down"),
    ).toBeInTheDocument();
  });

  it("renders the not-found wall for a handle that doesn't exist", async () => {
    render(
      <TestProviders initialEntries={["/p/does-not-exist-at-all"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(
      await screen.findByText("This persona isn't here"),
    ).toBeInTheDocument();
  });
});

describe("SubprofilePage owner-draft preview (demo mode)", () => {
  it("mounts SubprofileDraftBanner for the signed-in owner previewing their own draft", async () => {
    // TIAGO_DRAFT is unlinked with no handle yet (assigned on publish); its
    // owner's own preview link falls back to the internal slug ("code") —
    // `findDemoSubprofileByHandle` mirrors that fallback.
    render(
      <TestProviders initialEntries={["/p/code"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(
      await screen.findByText("Draft — nobody else can open this address yet."),
    ).toBeInTheDocument();
  });

  it("shows not-found for the same draft to a signed-out visitor", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders initialEntries={["/p/code"]}>
        <AppRoutes />
      </TestProviders>,
    );
    await waitForPageLoad();
    expect(
      await screen.findByText("This persona isn't here"),
    ).toBeInTheDocument();
  });
});
