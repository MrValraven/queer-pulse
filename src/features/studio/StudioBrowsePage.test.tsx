import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioBrowsePage } from "./StudioBrowsePage";
import { StudioHomeGenres } from "./StudioGenreChips";

const pageControl = vi.hoisted(() => ({
  isEmpty: false,
  shouldFail: false,
  hasNoGenres: false,
  shouldGenresFail: false,
}));
vi.mock("./api/studioDemoApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("./api/studioDemoApi")>();
  return {
    ...original,
    demoStudioGenres: () => {
      if (pageControl.shouldGenresFail) throw new Error("genres failed");
      if (pageControl.hasNoGenres) return { genres: [] };
      return original.demoStudioGenres();
    },
    demoStudioReleasesPage: (
      cursor: string | null,
      genre: Parameters<typeof original.demoStudioReleasesPage>[1],
      mood: Parameters<typeof original.demoStudioReleasesPage>[2],
    ) => {
      if (pageControl.shouldFail) throw new Error("browse failed");
      if (pageControl.isEmpty)
        return { items: [], pageInfo: { nextCursor: null, hasMore: false } };
      return original.demoStudioReleasesPage(cursor, genre, mood);
    },
  };
});

afterEach(() => {
  pageControl.isEmpty = false;
  pageControl.shouldFail = false;
  pageControl.hasNoGenres = false;
  pageControl.shouldGenresFail = false;
});

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioBrowsePage />
    </TestProviders>,
  );
}

describe("genre browsing (demo)", () => {
  it("lists one genre's releases with that chip marked current", async () => {
    renderAt("/studio/browse?genre=fado");
    const grid = await screen.findByRole("region", {
      name: /releases in fado/i,
    });
    expect(
      within(grid).getByRole("link", { name: "Cidade dos santos" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /fado/i, current: "page" }),
    ).toHaveAttribute("href", "/studio/browse?genre=fado");
  });

  it("asks for a genre when none is chosen", async () => {
    renderAt("/studio/browse");
    expect(
      await screen.findByText("Pick a genre or a mood to see its releases"),
    ).toBeInTheDocument();
  });

  it("says so when a genre has no releases yet", async () => {
    pageControl.isEmpty = true;
    renderAt("/studio/browse?genre=folk");
    expect(
      await screen.findByText("No releases in Folk yet"),
    ).toBeInTheDocument();
  });

  it("offers Retry when the list cannot load", async () => {
    pageControl.shouldFail = true;
    renderAt("/studio/browse?genre=folk");
    expect(
      await screen.findByRole("button", { name: /try again|retry/i }),
    ).toBeInTheDocument();
  });

  it("says no genres exist yet when the genre read succeeds empty", async () => {
    pageControl.hasNoGenres = true;
    renderAt("/studio/browse");
    expect(await screen.findByText(/genres show up here/i)).toBeInTheDocument();
  });

  it("offers Retry in place of the chips and the pick prompt when the genre read fails", async () => {
    pageControl.shouldGenresFail = true;
    renderAt("/studio/browse");
    expect(
      await screen.findByRole("button", { name: /try again|retry/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Pick a genre or a mood to see its releases"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/genres show up here/i)).not.toBeInTheDocument();
  });

  it("puts a chip row on Studio home linking to each genre", async () => {
    render(
      <TestProviders>
        <StudioHomeGenres />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Electronic" }),
    ).toHaveAttribute("href", "/studio/browse?genre=electronic");
  });

  it("browses by mood alone, with the Any genre chip current", async () => {
    renderAt("/studio/browse?mood=tender");
    const grid = await screen.findByRole("region", {
      name: "Tender releases",
    });
    expect(
      within(grid).getByRole("link", { name: "The kitchen in April" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Any genre", current: "page" }),
    ).toHaveAttribute("href", "/studio/browse?mood=tender");
  });

  it("keeps the other filter on every chip", async () => {
    renderAt("/studio/browse?genre=fado&mood=tender");
    expect(await screen.findByRole("link", { name: "Folk" })).toHaveAttribute(
      "href",
      "/studio/browse?genre=folk&mood=tender",
    );
    // The mood row reads its own list, so it lands on its own clock.
    expect(
      await screen.findByRole("link", { name: "Tender", current: "page" }),
    ).toHaveAttribute("href", "/studio/browse?genre=fado&mood=tender");
    expect(
      await screen.findByRole("link", { name: "Any mood" }),
    ).toHaveAttribute("href", "/studio/browse?genre=fado");
  });

  it("names both filters when nothing matches", async () => {
    pageControl.isEmpty = true;
    renderAt("/studio/browse?genre=fado&mood=tender");
    expect(
      await screen.findByText(
        "Nothing in Fado / contemporary with the mood Tender yet",
      ),
    ).toBeInTheDocument();
  });

  it("offers one Play radio button per chosen filter", async () => {
    renderAt("/studio/browse?genre=fado&mood=tender");
    expect(
      await screen.findByRole("button", {
        name: "Play Fado / contemporary radio",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play Tender radio" }),
    ).toBeInTheDocument();
  });

  it("offers no radio before a filter is chosen", async () => {
    renderAt("/studio/browse");
    await screen.findByText("Pick a genre or a mood to see its releases");
    expect(screen.queryByRole("button", { name: /radio/i })).toBeNull();
  });

  it("adds a mood row after the genres", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioHomeGenres />
      </TestProviders>,
    );
    const moods = await screen.findByRole("navigation", { name: "Moods" });
    expect(
      within(moods).getByRole("link", { name: "Late night" }),
    ).toHaveAttribute("href", "/studio/browse?mood=late-night");
  });
});
