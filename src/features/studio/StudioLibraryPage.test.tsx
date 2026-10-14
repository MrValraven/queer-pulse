import { fireEvent, render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { StudioLibraryPage } from "./StudioLibraryPage";

const showcase = vi.hoisted(() => ({ isOn: true, hasNoPlaylists: false }));
vi.mock("./api/useStudioMyPlaylists", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioMyPlaylists")>();
  return {
    ...original,
    useStudioMyPlaylists: (
      ...args: Parameters<typeof original.useStudioMyPlaylists>
    ) => {
      const result = original.useStudioMyPlaylists(...args);
      return showcase.hasNoPlaylists ? { ...result, playlists: [] } : result;
    },
  };
});
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

beforeEach(() => {
  showcase.isOn = true;
  showcase.hasNoPlaylists = false;
  resetDemoPlaylists();
});

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path="/studio/library" element={<StudioLibraryPage />} />
        <Route
          path="/studio/liked"
          element={<div data-testid="liked-page" />}
        />
      </Routes>
    </TestProviders>,
  );
}

describe("library (demo)", () => {
  it("opens on Playlists with the member's own and a Create playlist button", async () => {
    renderAt("/studio/library");
    expect(screen.getByRole("tab", { name: "Playlists" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      await screen.findByRole("link", { name: "Kitchen tapes" }),
    ).toHaveAttribute(
      "href",
      "/studio/collection?id=demo-playlist-kitchen-tapes",
    );
    expect(
      screen.getByRole("button", { name: /create playlist/i }),
    ).toBeInTheDocument();
  });

  it("starts the Playlists grid with Liked songs, marked Private", async () => {
    renderAt("/studio/library");
    const panel = screen.getByRole("tabpanel");
    const liked = within(panel).getByRole("link", { name: "Liked songs" });
    expect(liked).toHaveAttribute("href", "/studio/liked");
    const kitchen = await within(panel).findByRole("link", {
      name: "Kitchen tapes",
    });
    expect(
      liked.compareDocumentPosition(kitchen) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(liked.closest("article")!).getByText("Private"),
    ).toBeInTheDocument();
  });

  it("keeps Liked songs above the empty Playlists state", async () => {
    showcase.hasNoPlaylists = true;
    renderAt("/studio/library");
    const panel = screen.getByRole("tabpanel");
    await within(panel).findByRole("link", { name: "Browse the studio" });
    expect(
      within(panel).getByRole("link", { name: "Liked songs" }),
    ).toHaveAttribute("href", "/studio/liked");
  });

  it("offers Playlists, Releases and Artists as the library tabs", () => {
    renderAt("/studio/library");
    expect(screen.queryByRole("tab", { name: "Tracks" })).toBeNull();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Playlists",
      "Releases",
      "Artists",
    ]);
  });

  it("opens Liked songs from the old Tracks tab link", () => {
    renderAt("/studio/library?tab=tracks");
    expect(screen.getByTestId("liked-page")).toBeInTheDocument();
  });

  it("links a withdrawn save to its release and leaves another lost save unlinked", async () => {
    renderAt("/studio/library");
    fireEvent.click(screen.getByRole("tab", { name: "Releases" }));
    const panel = await screen.findByRole("tabpanel");
    expect(
      within(panel).getByRole("link", { name: "Cidade dos santos" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: "Bairro antigo" }),
    ).toHaveAttribute("href", "/studio/album?id=demo-release-withdrawn");
    expect(within(panel).getByText("Withdrawn")).toBeInTheDocument();
    expect(within(panel).getByText("Demo tape, 2019")).toBeInTheDocument();
    expect(
      within(panel).queryByRole("link", { name: "Demo tape, 2019" }),
    ).not.toBeInTheDocument();
    expect(within(panel).getByText("No longer available")).toBeInTheDocument();
  });

  it("lists followed artists who make music", async () => {
    renderAt("/studio/library?tab=artists");
    expect(
      await screen.findByRole("link", { name: /nightform/i }),
    ).toHaveAttribute("href", "/studio/artist?id=sp-diogo-nightform");
  });

  it("keeps the paid-to-artists line to the demo showcase", () => {
    showcase.isOn = false;
    renderAt("/studio/library");
    expect(
      screen.getByText(
        "Your playlists, Liked songs, saved releases and the artists you follow",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/paid/)).not.toBeInTheDocument();
  });

  it("offers Create playlist in the empty Playlists state and opens the dialog", async () => {
    showcase.hasNoPlaylists = true;
    renderAt("/studio/library");
    const panel = screen.getByRole("tabpanel");
    await within(panel).findByRole("link", { name: "Browse the studio" });
    const createButtons = within(panel).getAllByRole("button", {
      name: /create playlist/i,
    });
    expect(createButtons).toHaveLength(1);
    const createButton = createButtons[0]!;
    fireEvent.click(createButton);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
