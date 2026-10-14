import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { STUDIO_RELEASE_STATUS_LABEL_KEY } from "./api/studio.adapters";
import type { StudioArtistStatsView } from "./api/studio.adapters";
import { StudioDashboardPage } from "./StudioDashboardPage";
import { StudioNumbersTable } from "./StudioNumbersTable";

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

  it("shows how many members wait for a scheduled release", async () => {
    renderPage();
    const row = await screen.findByRole("rowheader", { name: /maré alta/i });
    expect(within(row).getByText("Scheduled")).toBeInTheDocument();
    expect(within(row).getByText("Waiting for it: 12")).toBeInTheDocument();
  });

  it("reads Fewer than 5 for a scheduled release with a withheld reminder count", () => {
    const release = {
      id: "release-1",
      title: "Maré alta",
      href: "/studio/album?id=release-1",
    };
    const stats = {
      subprofileId: "persona-1",
      followerCount: 0,
      releases: [
        {
          release,
          status: "scheduled",
          statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.scheduled,
          saves: { value: 0, isBelowThreshold: false },
          playlistInclusions: { value: 0, isBelowThreshold: false },
          tracks: [],
          reminders: { value: null, isBelowThreshold: true },
        },
      ],
    } as unknown as StudioArtistStatsView;
    render(
      <TestProviders>
        <StudioNumbersTable stats={stats} personaName="Mariana Sol" />
      </TestProviders>,
    );
    expect(
      screen.getByText("Waiting for it: Fewer than 5"),
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
