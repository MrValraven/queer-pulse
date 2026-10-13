import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAlbumPage } from "./StudioAlbumPage";

describe("StudioAlbumPage (demo fixture)", () => {
  it("formats the hero facts from data", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/album?id=demo-release-cidade-dos-santos"]}
      >
        <StudioAlbumPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Cidade dos santos",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Album · 11 tracks · \d+ min/)).toBeInTheDocument();
  });

  it("opens the report dialog for this release from the overflow menu", async () => {
    // A release the demo member does not own (Mariana's are the demo owner's).
    render(
      <TestProviders initialEntries={["/studio/album?id=demo-release-home-4"]}>
        <StudioAlbumPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /more actions/i }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /report release/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("hands focus back to the menu trigger when the report dialog closes", async () => {
    render(
      <TestProviders initialEntries={["/studio/album?id=demo-release-home-4"]}>
        <StudioAlbumPage />
      </TestProviders>,
    );
    const trigger = await screen.findByRole("button", {
      name: /more actions/i,
    });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: /report release/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("shows its owner a taken-down release with staff's reason and blocks Play", async () => {
    // Mariana's releases belong to the demo member.
    render(
      <TestProviders
        initialEntries={["/studio/album?id=demo-release-taken-down-bairro"]}
      >
        <StudioAlbumPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Bairro antigo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Taken down")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Taken down by QueerPulse staff: A rights holder asked us to check the sample on this track",
      ),
    ).toBeInTheDocument();
    const playButtons = screen.getAllByRole("button", {
      name: "Play Bairro antigo",
    });
    expect(playButtons.length).toBeGreaterThan(0);
    for (const playButton of playButtons)
      expect(playButton).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByRole("button", { name: /^save$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /more actions/i }),
    ).not.toBeInTheDocument();
  });
});
