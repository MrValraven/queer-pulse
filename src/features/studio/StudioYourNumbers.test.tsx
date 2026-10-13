import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioDashboardPage } from "./StudioDashboardPage";

const control = vi.hoisted(() => ({ hasNoPersona: false }));
vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));
vi.mock("./api/useStudioAccess", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAccess")>();
  return {
    ...original,
    useStudioAccess: () => {
      const access = original.useStudioAccess();
      return control.hasNoPersona
        ? { ...access, uploadablePersonas: [] }
        : access;
    },
  };
});

afterEach(() => {
  control.hasNoPersona = false;
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/studio/dashboard"]}>
      <StudioDashboardPage />
    </TestProviders>,
  );
}

describe("Your numbers (demo stats, live layout)", () => {
  it("titles the page and shows the follower total as is", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /how mariana sol is reaching people/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText("1,204")).toBeInTheDocument();
  });

  it("never prints a count from 1 to 4, and reads Fewer than 5 there", async () => {
    renderPage();
    const table = await screen.findByRole("table");
    const cells = within(table)
      .getAllByRole("cell")
      .map((cell) => cell.textContent?.trim() ?? "");
    expect(cells.some((text) => /^[1-4]$/.test(text))).toBe(false);
    expect(cells).toContain("Fewer than 5");
    expect(cells).toContain("0");
  });

  it("expands a release to its tracks", async () => {
    renderPage();
    const toggle = await screen.findByRole("button", {
      name: "Show tracks for Cidade dos santos",
    });
    fireEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Hide tracks for Cidade dos santos" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("rowheader", { name: /carta para a santa/i }),
    ).toBeInTheDocument();
  });

  it("tells a member with no musician or DJ persona how to get one", async () => {
    control.hasNoPersona = true;
    renderPage();
    expect(
      await screen.findByText("You need a musician or DJ persona"),
    ).toBeInTheDocument();
  });
});
