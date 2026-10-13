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
  pageControl.personas = null;
});

describe("Studio home (demo fixture)", () => {
  it("leads with the newest release and plays it from a real button", async () => {
    render(
      <TestProviders initialEntries={["/studio"]}>
        <StudioRoom />
      </TestProviders>,
    );
    const hero = await screen.findByRole("region", { name: /newest release/i });
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "The kitchen in April",
    );
    expect(
      within(hero)
        .getByRole("button", { name: /play the kitchen in april/i })
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
    const hrefsBefore = within(grid)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(new Set(hrefsBefore).size).toBe(hrefsBefore.length);
    expect(
      hrefsBefore.every((href) => href?.startsWith("/studio/album?id=")),
    ).toBe(true);
    fireEvent.click(within(grid).getByRole("button", { name: /show more/i }));
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
    const linksBefore = within(grid).getAllByRole("link").length;
    fireEvent.click(within(grid).getByRole("button", { name: /show more/i }));
    expect(
      await within(grid).findByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
    expect(within(grid).getAllByRole("link")).toHaveLength(linksBefore);
    expect(
      screen.getByRole("region", { name: /newest release/i }),
    ).toBeInTheDocument();
  });

  it("offers the upload link on an empty list only to members with a persona", async () => {
    pageControl.isEmpty = true;
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
});
