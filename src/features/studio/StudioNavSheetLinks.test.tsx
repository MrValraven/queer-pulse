import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAccountMenuPanel } from "./StudioAccountMenuPanel";
import { StudioNavSheetLinks } from "./StudioNavSheetLinks";

const staff = vi.hoisted(() => ({
  isStaff: false,
  personas: [] as { id: string }[],
}));
vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));
vi.mock("./useIsStudioStaff", () => ({
  useIsStudioStaff: () => staff.isStaff,
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: staff.personas,
  }),
}));

beforeEach(() => {
  staff.isStaff = false;
  staff.personas = [];
});

function renderSheet() {
  render(
    <TestProviders initialEntries={["/studio"]}>
      <StudioNavSheetLinks onNavigate={() => {}} />
    </TestProviders>,
  );
}

describe("phone side sheet (live)", () => {
  it("lists the Help and info pages for every member", async () => {
    renderSheet();
    const group = await screen.findByRole("group", { name: "Help and info" });
    const links: [string, string][] = [
      ["Help", "/studio/help"],
      ["About Studio", "/studio/about"],
      ["Rights and takedowns", "/studio/rights"],
      ["Studio terms", "/studio/terms"],
      ["Accessibility", "/studio/accessibility"],
    ];
    for (const [name, href] of links)
      expect(within(group).getByRole("link", { name })).toHaveAttribute(
        "href",
        href,
      );
    expect(
      within(group).queryByRole("link", { name: "Flag review" }),
    ).not.toBeInTheDocument();
  });

  it("lists Upload and Press kit for a member with an artist page", async () => {
    staff.personas = [{ id: "persona-1" }];
    renderSheet();
    expect(
      await screen.findByRole("link", { name: "Press kit" }),
    ).toHaveAttribute("href", "/studio/press/edit");
    expect(screen.getByRole("link", { name: "Upload" })).toBeInTheDocument();
  });

  it("hides Press kit from a member without an artist page", async () => {
    renderSheet();
    await screen.findByRole("group", { name: "Help and info" });
    expect(
      screen.queryByRole("link", { name: "Press kit" }),
    ).not.toBeInTheDocument();
  });

  it("adds Flag review for staff", async () => {
    staff.isStaff = true;
    renderSheet();
    const group = await screen.findByRole("group", { name: "Help and info" });
    expect(
      within(group).getByRole("link", { name: "Flag review" }),
    ).toHaveAttribute("href", "/studio/flag-review");
  });
});

describe("account menu (live)", () => {
  it("opens Studio settings for every member", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioAccountMenuPanel
          id="studio-account-menu"
          isExiting={false}
          persona={null}
          onNavigate={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Settings" }),
    ).toHaveAttribute("href", "/studio/settings");
  });
});
