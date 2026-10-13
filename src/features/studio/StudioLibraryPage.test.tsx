import { fireEvent, render, screen, within } from "@testing-library/react";
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
      <StudioLibraryPage />
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

  it("lists saved releases, an unavailable one included and unlinked", async () => {
    renderAt("/studio/library");
    fireEvent.click(screen.getByRole("tab", { name: "Releases" }));
    const panel = await screen.findByRole("tabpanel");
    expect(
      within(panel).getByRole("link", { name: "Cidade dos santos" }),
    ).toBeInTheDocument();
    expect(within(panel).getByText("Bairro antigo")).toBeInTheDocument();
    expect(
      within(panel).queryByRole("link", { name: "Bairro antigo" }),
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
        "Your playlists, plus the releases, tracks and artists you keep close",
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
