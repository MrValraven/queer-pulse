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
    ) => {
      if (pageControl.shouldFail) throw new Error("browse failed");
      if (pageControl.isEmpty)
        return { items: [], pageInfo: { nextCursor: null, hasMore: false } };
      return original.demoStudioReleasesPage(cursor, genre);
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
      await screen.findByText("Pick a genre to see its releases"),
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
      screen.queryByText("Pick a genre to see its releases"),
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
});
