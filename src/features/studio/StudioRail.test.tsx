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

const staff = vi.hoisted(() => ({ isStaff: false }));
vi.mock("./useIsStudioStaff", () => ({
  useIsStudioStaff: () => staff.isStaff,
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
    expect(screen.getByRole("link", { name: "Press kit" })).toHaveAttribute(
      "href",
      "/studio/press/edit",
    );
    expect(screen.getByRole("link", { name: /NIGHTFORM/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Solidarity fund" }),
    ).toHaveAttribute("href", "/studio/solidarity-fund");
    expect(screen.queryByText(/Sustained/)).not.toBeInTheDocument();
  });

  it("gives every live member the Help and info pages", async () => {
    isShowcase = false;
    staff.isStaff = false;
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRail />
      </TestProviders>,
    );
    const links: [string, string][] = [
      ["Help", "/studio/help"],
      ["About Studio", "/studio/about"],
      ["Rights and takedowns", "/studio/rights"],
      ["Studio terms", "/studio/terms"],
      ["Accessibility", "/studio/accessibility"],
    ];
    for (const [name, href] of links)
      expect(await screen.findByRole("link", { name })).toHaveAttribute(
        "href",
        href,
      );
    expect(
      screen.queryByRole("link", { name: "Flag review" }),
    ).not.toBeInTheDocument();
  });

  it("adds Flag review for staff", async () => {
    isShowcase = false;
    staff.isStaff = true;
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRail />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Flag review" }),
    ).toHaveAttribute("href", "/studio/flag-review");
  });
});
