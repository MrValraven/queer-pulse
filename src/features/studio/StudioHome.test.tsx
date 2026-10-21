import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioRoom } from "./StudioRoom";

const pageControl = vi.hoisted(() => ({
  shouldFailAfterFirstPage: false,
  isEmpty: false,
  isCurationEmpty: false,
  personas: null as unknown[] | null,
}));

vi.mock("./api/studioDemoApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("./api/studioDemoApi")>();
  return {
    ...original,
    demoStudioReleasesPage: (cursor: string | null) => {
      if (pageControl.isEmpty) {
        return { items: [], pageInfo: { nextCursor: null, hasMore: false } };
      }
      if (pageControl.shouldFailAfterFirstPage && cursor) {
        throw new Error("page two failed");
      }
      return original.demoStudioReleasesPage(cursor);
    },
  };
});

vi.mock("./api/studioDemoDiscovery", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoDiscovery")>();
  return {
    ...original,
    demoStudioCuration: () =>
      pageControl.isCurationEmpty
        ? { featured: null, staffPicks: [], newThisWeek: [] }
        : original.demoStudioCuration(),
  };
});

vi.mock("./api/useStudioAccess", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAccess")>();
  return {
    ...original,
    useStudioAccess: () => {
      const access = original.useStudioAccess();
      return pageControl.personas
        ? { ...access, uploadablePersonas: pageControl.personas }
        : access;
    },
  };
});

afterEach(() => {
  pageControl.shouldFailAfterFirstPage = false;
  pageControl.isEmpty = false;
  pageControl.isCurationEmpty = false;
  pageControl.personas = null;
});

describe("Studio home (demo fixture)", () => {
  it("leads with the featured release, its staff note and a real Play button", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const hero = await screen.findByRole("region", { name: /featured/i });
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Cidade dos santos",
    );
    expect(within(hero).getByText(/kitchen in Anjos/)).toBeInTheDocument();
    expect(
      within(hero)
        .getByRole("button", { name: /play cidade dos santos/i })
        .closest("a"),
    ).toBeNull();
  });

  it("links every card to its own release and pages with Show more", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const grid = await screen.findByRole("region", { name: /new releases/i });
    // The grid holds its skeleton until curation settles; Show more appears
    // with the real cards, just under the grid's region.
    await screen.findByRole("button", { name: /show more/i });
    const hrefsBefore = within(grid)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(new Set(hrefsBefore).size).toBe(hrefsBefore.length);
    expect(
      hrefsBefore.every((href) => href?.startsWith("/studio/album?id=")),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /show more/i }));
    await waitFor(() =>
      expect(within(grid).getAllByRole("link").length).toBeGreaterThan(
        hrefsBefore.length,
      ),
    );
  });

  it("lists the artists behind the loaded releases", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const artists = await screen.findByRole("region", { name: /artists/i });
    expect(
      within(artists).getByRole("link", { name: /NIGHTFORM/ }),
    ).toHaveAttribute("href", "/studio/artist?id=sp-diogo-nightform");
  });

  it("keeps the first page on screen when Show more fails and offers Retry", async () => {
    pageControl.shouldFailAfterFirstPage = true;
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const grid = await screen.findByRole("region", { name: /new releases/i });
    const showMore = await screen.findByRole("button", {
      name: /show more/i,
    });
    const linksBefore = within(grid).getAllByRole("link").length;
    fireEvent.click(showMore);
    expect(
      await screen.findByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
    expect(within(grid).getAllByRole("link")).toHaveLength(linksBefore);
    expect(
      screen.getByRole("region", { name: /featured/i }),
    ).toBeInTheDocument();
  });

  it("offers the upload link on an empty list only to members with a persona", async () => {
    pageControl.isEmpty = true;
    pageControl.isCurationEmpty = true;
    pageControl.personas = [{ id: "persona-one" }];
    const { unmount } = render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    expect(await screen.findByText(/no releases yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /upload your first release/i }),
    ).toBeInTheDocument();
    unmount();

    pageControl.personas = [];
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    expect(await screen.findByText(/no releases yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /upload your first release/i }),
    ).toBeNull();
  });

  it("falls back to the newest release with empty curation, folds both shelves and keeps the hero out of the grid", async () => {
    pageControl.isCurationEmpty = true;
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    // The hero shows only once curation has settled, so the shelves' fold
    // below is read after the curation answer.
    const hero = await screen.findByRole("region", { name: /newest release/i });
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "The kitchen in April",
    );
    expect(screen.queryByRole("region", { name: "Staff picks" })).toBeNull();
    expect(screen.queryByRole("region", { name: "New this week" })).toBeNull();
    // The grid region exists while its skeleton shows: wait for a real card
    // before checking which card is missing.
    const grid = await screen.findByRole("region", { name: /new releases/i });
    expect(
      await within(grid).findByRole("link", { name: "Cidade dos santos" }),
    ).toBeInTheDocument();
    expect(
      within(grid).queryByRole("link", { name: "The kitchen in April" }),
    ).toBeNull();
  });

  it("shows Staff picks with their notes and New this week", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const picks = await screen.findByRole("region", { name: "Staff picks" });
    expect(
      within(picks).getByText(
        "Ninety minutes for the hour after the lights come up",
      ),
    ).toBeInTheDocument();
    expect(
      within(picks).getByRole("link", { name: "Bicha, with love" }),
    ).toHaveAttribute("href", "/studio/album?id=demo-release-home-2");
    expect(
      await screen.findByRole("region", { name: "New this week" }),
    ).toBeInTheDocument();
  });

  it("keeps the featured release out of the New releases grid", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const grid = await screen.findByRole("region", { name: /new releases/i });
    expect(
      await within(grid).findByRole("link", { name: "The kitchen in April" }),
    ).toBeInTheDocument();
    expect(
      within(grid).queryByRole("link", { name: "Cidade dos santos" }),
    ).toBeNull();
  });

  it("links each scene card to its scene page", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const scenes = await screen.findByRole("region", { name: "Local scenes" });
    expect(
      await within(scenes).findByRole("link", { name: /Mouraria fado/ }),
    ).toHaveAttribute("href", "/studio/scene?slug=mouraria-fado");
    expect(within(scenes).queryByText("Sintra choirs")).toBeNull();
  });
});
