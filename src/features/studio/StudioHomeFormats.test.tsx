import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioBrowsePage } from "./StudioBrowsePage";
import { StudioRoom } from "./StudioRoom";

describe("Studio home by format (demo)", () => {
  it("shows the three format shelves under All", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "New episodes" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Spoken word" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "On stage" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Chosen family dinners" }),
    ).toHaveAttribute("href", "/studio/track?id=demo-episode-late-bloomers-03");
    // The owner's draft episode stays off every home shelf.
    expect(screen.queryByText("Our parents, part two")).toBeNull();
    const newReleases = await screen.findByRole("region", {
      name: "New releases",
    });
    expect(
      await within(newReleases).findByRole("link", {
        name: "The kitchen in April",
      }),
    ).toBeInTheDocument();
  });

  it("folds the genre and mood rows and the shelves away under Podcasts", async () => {
    render(
      <TestProviders initialEntries={["/studio?format=podcast"]}>
        <StudioRoom />
      </TestProviders>,
    );
    await screen.findByRole("link", { name: "Podcasts" });
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /browse by genre/i }),
      ).toBeNull(),
    );
    expect(screen.queryByRole("heading", { name: "New episodes" })).toBeNull();
    expect(
      (await screen.findAllByRole("link", { name: "Late Bloomers" })).length,
    ).toBeGreaterThan(0);
    const newReleases = await screen.findByRole("region", {
      name: "New releases",
    });
    expect(
      await within(newReleases).findByRole("link", { name: "Late Bloomers" }),
    ).toBeInTheDocument();
    expect(
      within(newReleases).queryByRole("link", { name: "The kitchen in April" }),
    ).toBeNull();
  });

  it("browses one format and keeps it in the genre chips", async () => {
    render(
      <TestProviders initialEntries={["/studio/browse?format=spoken_word"]}>
        <StudioBrowsePage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Último elétrico" }),
    ).toBeInTheDocument();
    const genreChip = await screen.findByRole("link", {
      name: "Spoken word",
      current: false,
    });
    expect(genreChip.getAttribute("href")).toContain("format=spoken_word");
  });
});
