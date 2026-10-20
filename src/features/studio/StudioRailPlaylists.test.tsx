import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { resetStudioLibrarySeedForTests } from "./api/useStudioLibrarySaves";
import { StudioRailPlaylists } from "./StudioRailPlaylists";

beforeEach(() => {
  window.localStorage.clear();
  resetDemoPlaylists();
  resetStudioLibrarySeedForTests();
});

function renderRail() {
  render(
    <TestProviders
      initialEntries={["/studio/collection?id=demo-playlist-kitchen-tapes"]}
    >
      <StudioRailPlaylists />
    </TestProviders>,
  );
}

/** The rail link whose first line is this playlist name. */
async function findRowLink(name: string) {
  const title = await screen.findByText(name);
  return title.closest("a")!;
}

describe("rail playlists (demo)", () => {
  it("pins Liked songs first as an auto playlist", () => {
    renderRail();
    const nav = screen.getByRole("navigation");
    const [firstItem] = within(nav).getAllByRole("listitem");
    const likedLink = within(firstItem!).getByRole("link");
    expect(likedLink).toHaveAttribute("href", "/studio/liked");
    expect(likedLink).toHaveTextContent("Liked songs");
    expect(likedLink).toHaveTextContent("Auto playlist");
  });

  it("marks a collaborative playlist for screen readers", async () => {
    renderRail();
    expect(await findRowLink("For the group chat")).toHaveTextContent(
      "Collaborative",
    );
  });

  it("names the owner of a saved playlist", async () => {
    renderRail();
    expect(await findRowLink("Lisbon dyke-bar standards")).toHaveTextContent(
      "Sara Marques",
    );
  });

  it("marks the open playlist as the current page", async () => {
    renderRail();
    const kitchenLink = await findRowLink("Kitchen tapes");
    expect(kitchenLink).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /Liked songs/ }),
    ).not.toHaveAttribute("aria-current");
  });
});
