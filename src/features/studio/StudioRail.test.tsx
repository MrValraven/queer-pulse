import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioRail } from "./StudioRail";

let isShowcase = true;
vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => isShowcase }));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [
      { id: "p1", name: "NIGHTFORM", href: "/studio/artist?id=p1" },
    ],
  }),
}));

describe("StudioRail", () => {
  it("lights up only Home on Studio home in the demo", async () => {
    isShowcase = true;
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRail />
      </TestProviders>,
    );
    const home = await screen.findByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "The Wednesday set" }),
    ).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Browse" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows the live destinations in live mode, with the artist's links", async () => {
    isShowcase = false;
    render(
      <TestProviders initialEntries={["/studio/artist?id=p1"]}>
        <StudioRail />
      </TestProviders>,
    );
    const nav = await screen.findByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/studio/search",
    );
    expect(within(nav).getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/studio/library",
    );
    expect(
      within(nav).getByRole("link", { name: "Open calls" }),
    ).toHaveAttribute("href", "/studio/calls");
    expect(screen.getByRole("link", { name: "Your numbers" })).toHaveAttribute(
      "href",
      "/studio/dashboard",
    );
    expect(
      screen.getByRole("link", { name: "Upload a release" }),
    ).toHaveAttribute("href", "/studio/upload");
    expect(screen.getByRole("link", { name: /NIGHTFORM/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Solidarity fund" }),
    ).toHaveAttribute("href", "/studio/solidarity-fund");
    expect(screen.queryByText(/Sustained/)).not.toBeInTheDocument();
  });
});
