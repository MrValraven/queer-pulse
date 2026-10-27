import { cleanup, render, screen } from "@testing-library/react";
import { Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { studioRoutes } from "./routes";

vi.mock("../../app/routeHelpers", () => ({
  lazyNamed: (_loader: unknown, exportName: string) =>
    function LazyStub() {
      return <p>{exportName}</p>;
    },
}));

function renderAt(path: string, options: Parameters<typeof studioRoutes>[0]) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>{studioRoutes(options)}</Routes>
    </TestProviders>,
  );
}

const granted = {
  demoMode: false,
  hasStudioAccess: true,
  isStudioAccessPending: false,
};

describe("studioRoutes, the claim pages", () => {
  it("opens the claim form for a granted member", () => {
    renderAt("/studio/claims/new?track=t1", granted);
    expect(screen.getByText("StudioClaimNewPage")).toBeInTheDocument();
  });

  it("opens the claims list for a granted member", () => {
    renderAt("/studio/claims?claim=c1", granted);
    expect(screen.getByText("StudioMyClaimsPage")).toBeInTheDocument();
  });

  it("opens the claims list in demo", () => {
    cleanup();
    renderAt("/studio/claims", { ...granted, demoMode: true });
    expect(screen.getByText("StudioMyClaimsPage")).toBeInTheDocument();
  });

  it("opens the claims list for a member who lost the grant", () => {
    renderAt("/studio/claims", { ...granted, hasStudioAccess: false });
    expect(screen.getByText("StudioMyClaimsPage")).toBeInTheDocument();
  });

  it("shows the landing on the claim form to a member without a grant", () => {
    cleanup();
    renderAt("/studio/claims/new", { ...granted, hasStudioAccess: false });
    expect(screen.getByText("StudioLandingPage")).toBeInTheDocument();
  });
});
