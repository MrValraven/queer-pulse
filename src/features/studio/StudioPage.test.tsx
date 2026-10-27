import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../marketing/cookies.data";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_STUDIO_ACCESS_STORAGE_KEY } from "./api/studioDemoAccessSwitch";
import { StudioPage } from "./StudioPage";

// Each lazy page renders its own export name, so the test reads which page
// /studio resolved to without loading any page chunk.
vi.mock("../../app/routeHelpers", () => ({
  lazyNamed: (_loader: unknown, exportName: string) =>
    function LazyStub() {
      return <p>{exportName}</p>;
    },
}));

vi.mock("./StudioRoom", () => ({ StudioRoom: () => <p>StudioRoom</p> }));

afterEach(() => {
  localStorage.clear();
});

function renderStudioPage(initialEntries: string[] = ["/studio"]) {
  return render(
    <TestProviders initialEntries={initialEntries}>
      <StudioPage />
    </TestProviders>,
  );
}

describe("StudioPage", () => {
  it("a granted demo member gets the Studio home", async () => {
    renderStudioPage();
    expect(await screen.findByText("StudioRoom")).toBeInTheDocument();
    expect(screen.queryByText("StudioLandingPage")).toBeNull();
  });

  it("demo with ?studioAccess=off shows the landing to a signed-in member", async () => {
    localStorage.setItem(DEMO_STUDIO_ACCESS_STORAGE_KEY, "off");
    renderStudioPage();
    expect(await screen.findByText("StudioLandingPage")).toBeInTheDocument();
    expect(screen.queryByText("StudioRoom")).toBeNull();
  });

  it("signed out gets the landing", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderStudioPage();
    expect(await screen.findByText("StudioLandingPage")).toBeInTheDocument();
    expect(screen.queryByText("StudioRoom")).toBeNull();
  });

  it("the visitor preview gets the landing", async () => {
    // Demo grants every staff role, so the preview parameter takes effect.
    renderStudioPage(["/studio?preview=visitor"]);
    expect(await screen.findByText("StudioLandingPage")).toBeInTheDocument();
    expect(screen.queryByText("StudioRoom")).toBeNull();
  });
});
