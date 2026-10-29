import { render, screen } from "@testing-library/react";
import { Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

// The ungranted branch reads the access hook itself, to tell a failed read
// apart from a real denial.
const access = vi.hoisted(() => ({ isReadFailed: false }));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "denied",
    hasAccess: false,
    isPending: false,
    isReadFailed: access.isReadFailed,
    reason: access.isReadFailed ? "server" : null,
    uploadablePersonas: [],
  }),
}));

beforeEach(() => {
  access.isReadFailed = false;
});

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
    renderAt("/studio/live", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioLivePage")).toBeInTheDocument();
  });

  it("shows the landing to a live member without a grant", () => {
    renderAt("/studio/album?id=r1", { ...live, hasStudioAccess: false });
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });

  it("shows the access error with the landing kept out when the access read failed", () => {
    access.isReadFailed = true;
    renderAt("/studio/album?id=r1", { ...live, hasStudioAccess: false });
    expect(screen.getByText("StudioAccessErrorPage")).toBeInTheDocument();
    expect(screen.queryByText("StudioLandingPage")).not.toBeInTheDocument();
  });

  it("shows the Studio skeleton while access is pending, with the landing kept out", async () => {
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
    expect(screen.queryByText("StudioLandingPage")).not.toBeInTheDocument();
  });

  it("opens the v1 pages for a granted member", () => {
    renderAt("/studio/album?id=r1", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioAlbumPage")).toBeInTheDocument();
  });

  it("redirects a deferred page to Studio home", () => {
    renderAt("/studio/live", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioPage")).toBeInTheDocument();
  });

  it("renders the Studio 404 for an unknown path", () => {
    renderAt("/studio/not-a-page", { ...live, hasStudioAccess: true });
    expect(screen.getByText("Studio404Page")).toBeInTheDocument();
  });

  it.each([
    ["/studio/library", "StudioLibraryPage"],
    ["/studio/collection?id=p1", "StudioCollectionPage"],
    ["/studio/dashboard", "StudioDashboardPage"],
    ["/studio/calls", "StudioOpenCallsPage"],
    ["/studio/solidarity-fund", "StudioSolidarityFundPage"],
    ["/studio/browse?genre=fado", "StudioBrowsePage"],
  ])("opens %s for a granted member (Studio v2)", (path, page) => {
    renderAt(path, { ...live, hasStudioAccess: true });
    expect(screen.getByText(page)).toBeInTheDocument();
  });

  it.each([
    ["/studio/help", "StudioHelpPage"],
    ["/studio/about", "StudioAboutPage"],
    ["/studio/terms", "StudioTermsPage"],
    ["/studio/accessibility", "StudioAccessibilityPage"],
    ["/studio/rights", "StudioRightsPage"],
    ["/studio/withdrawn", "StudioWithdrawnPage"],
    ["/studio/settings", "StudioSettingsPage"],
    ["/studio/flag-review", "StudioFlagReviewPage"],
  ])("opens %s for a granted member (open pages)", (path, page) => {
    renderAt(path, { ...live, hasStudioAccess: true });
    expect(screen.getByText(page)).toBeInTheDocument();
  });

  it.each([
    ["/studio/press?id=p1", "StudioPressPage"],
    ["/studio/press/edit?persona=p1", "StudioPressEditPage"],
    ["/studio/press/print?id=p1", "StudioOneSheetPage"],
    [`/studio/preview/${"a".repeat(64)}`, "StudioPreviewPage"],
  ])("opens %s for a granted member (Studio v3)", (path, page) => {
    renderAt(path, { ...live, hasStudioAccess: true });
    expect(screen.getByText(page)).toBeInTheDocument();
  });

  it("opens the preview and the editor in the demo too", () => {
    const demo = {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    };
    const preview = renderAt(`/studio/preview/${"a".repeat(64)}`, demo);
    expect(screen.getByText("StudioPreviewPage")).toBeInTheDocument();
    preview.unmount();
    renderAt("/studio/press/edit?persona=p1", demo);
    expect(screen.getByText("StudioPressEditPage")).toBeInTheDocument();
  });

  it("keeps a preview link behind the grant", () => {
    renderAt(`/studio/preview/${"a".repeat(64)}`, {
      ...live,
      hasStudioAccess: false,
    });
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });

  it("keeps Studio's own notifications page redirecting to Studio home", () => {
    renderAt("/studio/notifications", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioPage")).toBeInTheDocument();
  });

  it("keeps council and triage redirecting to Studio home", () => {
    renderAt("/studio/council", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioPage")).toBeInTheDocument();
  });

  it("opens Liked songs for a granted member", () => {
    renderAt("/studio/liked", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioLikedPage")).toBeInTheDocument();
  });

  it("opens Liked songs in the demo too", () => {
    renderAt("/studio/liked", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioLikedPage")).toBeInTheDocument();
  });

  it("keeps Liked songs behind the grant", () => {
    renderAt("/studio/liked", { ...live, hasStudioAccess: false });
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });

  it("opens Your listening for a granted member and in the demo", () => {
    const granted = renderAt("/studio/listening", {
      ...live,
      hasStudioAccess: true,
    });
    expect(screen.getByText("StudioListeningPage")).toBeInTheDocument();
    granted.unmount();
    renderAt("/studio/listening", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioListeningPage")).toBeInTheDocument();
  });

  it("keeps Your listening behind the grant", () => {
    renderAt("/studio/listening", { ...live, hasStudioAccess: false });
    expect(screen.queryByText("StudioListeningPage")).toBeNull();
  });

  it("opens browse in the demo too", () => {
    renderAt("/studio/browse", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioBrowsePage")).toBeInTheDocument();
  });

  it("opens the scene page and the credits inbox for a granted member", () => {
    const granted = { ...live, hasStudioAccess: true };
    const scene = renderAt("/studio/scene?slug=mouraria-fado", granted);
    expect(screen.getByText("StudioScenePage")).toBeInTheDocument();
    scene.unmount();
    renderAt("/studio/credits", granted);
    expect(screen.getByText("StudioCreditsPage")).toBeInTheDocument();
  });

  it("keeps both behind the landing for a member without a grant", () => {
    const ungranted = { ...live, hasStudioAccess: false };
    const scene = renderAt("/studio/scene?slug=mouraria-fado", ungranted);
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
    scene.unmount();
    renderAt("/studio/credits", ungranted);
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });

  it("serves both pages in demo mode", () => {
    const demo = {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    };
    const scene = renderAt("/studio/scene?slug=mouraria-fado", demo);
    expect(screen.getByText("StudioScenePage")).toBeInTheDocument();
    scene.unmount();
    renderAt("/studio/credits", demo);
    expect(screen.getByText("StudioCreditsPage")).toBeInTheDocument();
  });

  it("opens Payments to confirm for a granted member and in the demo", () => {
    const granted = renderAt("/studio/payments", {
      ...live,
      hasStudioAccess: true,
    });
    expect(screen.getByText("StudioPaymentsPage")).toBeInTheDocument();
    granted.unmount();
    renderAt("/studio/payments?tab=sales", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioPaymentsPage")).toBeInTheDocument();
  });

  it("keeps Payments to confirm behind the grant", () => {
    renderAt("/studio/payments", { ...live, hasStudioAccess: false });
    expect(screen.queryByText("StudioPaymentsPage")).toBeNull();
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });
});

// Payouts were retired for direct payments: the old address lands on
// Payments in both modes.
describe("studioRoutes for the retired payouts address", () => {
  it("sends it to Payments in demo mode", () => {
    renderAt("/studio/payouts", {
      demoMode: true,
      hasStudioAccess: true,
      isStudioAccessPending: false,
    });
    expect(screen.getByText("StudioPaymentsPage")).toBeInTheDocument();
  });

  it("sends it to Payments for a granted member", () => {
    renderAt("/studio/payouts", { ...live, hasStudioAccess: true });
    expect(screen.getByText("StudioPaymentsPage")).toBeInTheDocument();
  });
});
