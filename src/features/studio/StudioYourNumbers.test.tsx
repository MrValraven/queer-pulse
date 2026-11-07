import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import type { StudioArtistStatsDTO } from "./api/studio.types";
import { toDashboardStatsView } from "./api/studioDashboard.adapters";
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

const releaseCard = {
  id: "release-1",
  title: "Maré alta",
  type: "single" as const,
  coverUrl: null,
  releasedOn: null,
  trackCount: 0,
  totalDurationSeconds: 0,
  artist: {
    id: "persona-1",
    handle: "",
    name: "Mariana Sol",
    kind: "musician" as const,
    avatarUrl: null,
  },
  publishedAt: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
};

const statsWithoutPlays: StudioArtistStatsDTO = {
  subprofileId: "persona-1",
  followerCount: 0,
  releases: [
    {
      release: { ...releaseCard, status: "published" },
      saves: { value: 6, isBelowThreshold: false },
      playlistInclusions: { value: 0, isBelowThreshold: false },
      tracks: [],
    },
  ],
};

const statsWithPodcastRow: StudioArtistStatsDTO = {
  subprofileId: "persona-2",
  followerCount: 0,
  releases: [
    {
      release: { ...releaseCard, type: "podcast", status: "published" },
      saves: { value: 6, isBelowThreshold: false },
      playlistInclusions: { value: 0, isBelowThreshold: false },
      tracks: [],
      plays: { value: 0, isBelowThreshold: false },
      plays28d: { value: 0, isBelowThreshold: false },
    },
  ],
};

async function renderPage() {
  render(
    <TestProviders initialEntries={["/studio/dashboard"]}>
      <StudioDashboardPage />
    </TestProviders>,
  );
  await awaitCatalog("studio");
}

describe("Your numbers (demo stats, live layout)", () => {
  it("titles the page and shows the follower total as is", async () => {
    await renderPage();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /how mariana sol is reaching people/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText("1,204")).toBeInTheDocument();
  });

  it("never prints a count from 1 to 4, and reads Fewer than 5 there", async () => {
    await renderPage();
    const table = await screen.findByRole("table");
    const cells = within(table)
      .getAllByRole("cell")
      .map((cell) => cell.textContent?.trim() ?? "");
    expect(cells.some((text) => /^[1-4]$/.test(text))).toBe(false);
    expect(cells).toContain("Fewer than 5");
    expect(cells).toContain("0");
  });

  it("expands a release to its tracks", async () => {
    await renderPage();
    const toggle = await screen.findByRole("button", {
      name: "Show tracks for Cidade dos santos",
    });
    fireEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Hide tracks for Cidade dos santos" }),
    ).toHaveAttribute("aria-expanded", "true");
    // A single of the same name has its own release row, so the track is
    // found in the group the toggle opened.
    const tracks = document.getElementById(
      toggle.getAttribute("aria-controls") ?? "",
    )!;
    expect(
      await within(tracks).findByRole("rowheader", {
        name: /carta para a santa/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows how many members wait for a scheduled release", async () => {
    await renderPage();
    const row = await screen.findByRole("rowheader", { name: /maré alta/i });
    expect(within(row).getByText("Scheduled")).toBeInTheDocument();
    expect(within(row).getByText("Waiting for it: 12")).toBeInTheDocument();
  });

  it("reads Fewer than 5 for a scheduled release with a withheld reminder count", async () => {
    const stats = toDashboardStatsView({
      subprofileId: "persona-1",
      followerCount: 0,
      releases: [
        {
          release: { ...releaseCard, status: "scheduled" },
          saves: { value: 0, isBelowThreshold: false },
          playlistInclusions: { value: 0, isBelowThreshold: false },
          tracks: [],
          reminders: { value: null, isBelowThreshold: true },
        },
      ],
    });
    render(
      <TestProviders>
        <StudioNumbersTable stats={stats} personaName="Mariana Sol" />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    expect(
      screen.getByText("Waiting for it: Fewer than 5"),
    ).toBeInTheDocument();
  });

  it("tells a member with no musician or DJ persona how to get one", async () => {
    control.hasNoPersona = true;
    await renderPage();
    expect(
      await screen.findByText("Create a persona that works with Studio"),
    ).toBeInTheDocument();
  });

  it("shows follower growth, placements and milestones under the follower total", async () => {
    await renderPage();
    expect(
      await screen.findByText("New followers who still follow"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Where your music lives" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Milestones" }),
    ).toBeInTheDocument();
  });

  it("shows the next release countdown and the release checklist in Next steps", async () => {
    await renderPage();
    expect(
      await screen.findByText(/^Maré alta goes live in /),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Release checklist" }),
    ).toBeInTheDocument();
  });
  it("shows a Plays column with floored values, release and track", async () => {
    await renderPage();
    expect(
      await screen.findByRole("columnheader", { name: "Plays" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Fewer than 5").length).toBeGreaterThan(0);
    const firstToggle = screen.getAllByRole("button", {
      name: /^Show tracks for /,
    })[0]!;
    fireEvent.click(firstToggle);
    // A single of the same name has its own release row, so the track is
    // found in the group the toggle opened.
    const tracks = document.getElementById(
      firstToggle.getAttribute("aria-controls") ?? "",
    )!;
    const trackHeader = await within(tracks).findByRole("rowheader", {
      name: /carta para a santa/i,
    });
    const trackRow = trackHeader.closest("tr")!;
    const trackCells = within(trackRow)
      .getAllByRole("cell")
      .map((cell) => cell.textContent?.trim() ?? "");
    expect(trackCells).toHaveLength(3);
    expect(trackCells[0]).toMatch(/^(\d[\d,]*|Fewer than 5)$/);
  });
  it("shows the plays trend and Top listeners for Mariana", async () => {
    await renderPage();
    expect(
      await screen.findByText("Per day, last 28 days"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Top listeners" }),
    ).toBeInTheDocument();
  });
  it("leaves the Plays column out for a server that predates plays", async () => {
    render(
      <TestProviders>
        <StudioNumbersTable
          stats={toDashboardStatsView(statsWithoutPlays)}
          personaName="Mariana Sol"
        />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    expect(screen.queryByRole("columnheader", { name: "Plays" })).toBeNull();
  });
  it("reads Not counted for shows on a podcast release", async () => {
    render(
      <TestProviders>
        <StudioNumbersTable
          stats={toDashboardStatsView(statsWithPodcastRow)}
          personaName="Late Bloomers"
        />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    expect(screen.getByText("Not counted for shows")).toBeInTheDocument();
  });
});
