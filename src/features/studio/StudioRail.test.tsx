import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { StudioRail } from "./StudioRail";

const rail = vi.hoisted(() => ({ isShowcase: true, hasAccess: true }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => rail.isShowcase,
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: rail.hasAccess ? "granted" : "denied",
    hasAccess: rail.hasAccess,
    isPending: false,
    uploadablePersonas: rail.hasAccess
      ? [{ id: "p1", name: "NIGHTFORM", href: "/studio/artist?id=p1" }]
      : [],
  }),
}));

beforeEach(() => {
  rail.isShowcase = true;
  rail.hasAccess = true;
  resetDemoPlaylists();
});

function renderRailAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioRail />
    </TestProviders>,
  );
}

describe("StudioRail", () => {
  it("lights up Home in the demo and leads into the member's playlists", async () => {
    renderRailAt("/studio");
    const home = await screen.findByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(
      screen.queryByRole("link", { name: "Notifications" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create playlist/i }),
    ).toBeInTheDocument();
    const playlists = screen.getByRole("navigation", {
      name: "Your playlists",
    });
    expect(
      within(playlists).getByRole("link", { name: /liked songs/i }),
    ).toHaveAttribute("href", "/studio/liked");
  });

  it("keeps the live main nav to Home, Search and Library", async () => {
    rail.isShowcase = false;
    renderRailAt("/studio");
    const nav = await screen.findByRole("navigation", { name: "Studio" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/studio",
    );
    expect(within(nav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/studio/search",
    );
    expect(within(nav).getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/studio/library",
    );
    expect(
      within(nav).queryByRole("link", { name: "Open calls" }),
    ).not.toBeInTheDocument();
    for (const name of [
      "Solidarity fund",
      "Upload a release",
      "Your numbers",
      "Press kit",
      "Help",
    ])
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
  });

  it("opens the create dialog from the Create playlist pill", async () => {
    rail.isShowcase = false;
    renderRailAt("/studio");
    fireEvent.click(
      await screen.findByRole("button", { name: /create playlist/i }),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("leaves the pill and the playlists out without Studio access", async () => {
    rail.isShowcase = false;
    rail.hasAccess = false;
    renderRailAt("/studio");
    expect(
      await screen.findByRole("navigation", { name: "Studio" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /create playlist/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Your playlists" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(
      screen.queryByRole("link", { name: /liked songs/i }),
    ).not.toBeInTheDocument();
  });

  it("offers the Back to QueerPulse exit in the demo and without Studio access", async () => {
    renderRailAt("/studio");
    expect(
      await screen.findByRole("link", { name: "Back to QueerPulse" }),
    ).toHaveAttribute("href", "/feed");
    cleanup();
    rail.isShowcase = false;
    rail.hasAccess = false;
    renderRailAt("/studio");
    expect(
      await screen.findByRole("link", { name: "Back to QueerPulse" }),
    ).toHaveAttribute("href", "/feed");
    expect(screen.getByRole("link", { name: "QueerPulse" })).toHaveAttribute(
      "href",
      "/studio",
    );
  });
});
