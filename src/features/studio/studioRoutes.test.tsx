import { render, screen } from "@testing-library/react";
import { Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { studioRoutes } from "./routes";

// Each lazy page renders its own export name, so the test reads which page
// a URL resolved to without loading any page chunk.
vi.mock("../../app/routeHelpers", () => ({
  lazyNamed: (_loader: unknown, exportName: string) =>
    function LazyStub() {
      return <p>{exportName}</p>;
    },
}));

// TestProviders mounts the MemoryRouter, so the routes render inside it.
function renderAt(path: string, options: Parameters<typeof studioRoutes>[0]) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>{studioRoutes(options)}</Routes>
    </TestProviders>,
  );
}

const live = { demoMode: false, isStudioAccessPending: false };

describe("studioRoutes", () => {
  it("keeps the demo showcase pages in demo mode", () => {
    renderAt("/studio/payouts", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioPayoutsPage")).toBeInTheDocument();
  });

  it("shows the teaser to a live member without a grant", () => {
    renderAt("/studio/album?id=r1", { ...live, hasStudioAccess: false });
    expect(screen.getByText("StudioComingSoonPage")).toBeInTheDocument();
  });

  it("shows the Studio skeleton while access is pending, with the teaser kept out", async () => {
    renderAt("/studio", {
      demoMode: false,
      hasStudioAccess: false,
      isStudioAccessPending: true,
    });
    // The toast region is a second role="status", so the skeleton is found by
    // its name; findBy waits for the lazily loaded studio namespace.
    expect(
      await screen.findByRole("status", { name: /loading studio/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("StudioComingSoonPage")).not.toBeInTheDocument();
  });

  it("opens the v1 pages for a granted member", () => {
    renderAt("/studio/album?id=r1", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioAlbumPage")).toBeInTheDocument();
  });

  it("redirects a deferred page to Studio home", () => {
    renderAt("/studio/payouts", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioPage")).toBeInTheDocument();
  });

  it("renders the Studio 404 for an unknown path", () => {
    renderAt("/studio/not-a-page", { ...live, hasStudioAccess: true });
    expect(screen.getByText("Studio404Page")).toBeInTheDocument();
  });
});
