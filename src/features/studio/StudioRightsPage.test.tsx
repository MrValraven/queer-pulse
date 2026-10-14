import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioRightsPage } from "./StudioRightsPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

const access = vi.hoisted(() => ({
  uploadablePersonas: [] as { id: string; name: string; href: string }[],
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: access.uploadablePersonas,
  }),
}));

function renderRights() {
  render(
    <TestProviders initialEntries={["/studio/rights"]}>
      <StudioRightsPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
  access.uploadablePersonas = [
    { id: "p1", name: "NIGHTFORM", href: "/studio/artist?id=p1" },
  ];
});

describe("Studio rights (live)", () => {
  it("explains the checkbox, reports, disputes and unpublishing", async () => {
    renderRights();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "How rights work in Studio",
      }),
    ).toBeInTheDocument();
    for (const name of [
      "The rights checkbox",
      "After a report",
      "How to dispute",
      "Unpublish any time",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: "Open your releases" }),
    ).toHaveAttribute("href", "/studio/artist?id=p1");
  });

  it("hides the releases button without an uploadable persona", async () => {
    access.uploadablePersonas = [];
    renderRights();
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("link", { name: "Open your releases" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the mock release table and its takedown buttons to the demo", async () => {
    renderRights();
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("heading", { name: "Your releases" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /take down/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Studio rights (demo)", () => {
  it("adds the mock releases under the live base", async () => {
    showcase.isOn = true;
    renderRights();
    expect(
      (await screen.findAllByRole("button", { name: /take down/i })).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "How rights work in Studio",
      }),
    ).toBeInTheDocument();
  });
});
