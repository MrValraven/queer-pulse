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

function renderRelease(id: string) {
  render(
    <TestProviders initialEntries={[`/studio/album?id=${id}`]}>
      <StudioAlbumPage />
    </TestProviders>,
  );
}

describe("StudioAlbumPage, Studio v3", () => {
  it("shows a visitor an upcoming release with Notify me and no Play or Save", async () => {
    renderRelease("demo-release-scheduled-night-bus");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Night bus (extended)",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText(/^Out .+ at \d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText(/^2 tracks, out /)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /play night bus/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^save/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add release to playlist" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "More actions" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    const notify = screen.getByRole("button", {
      name: "Notify me when Night bus (extended) is out",
    });
    expect(notify).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(notify);
    await waitFor(() => expect(notify).toHaveAttribute("aria-pressed", "true"));
    expect(await screen.findByText("We'll tell you")).toBeInTheDocument();
  });

  it("keeps Play and the tracklist for the owner of a scheduled release", async () => {
    renderRelease("demo-release-scheduled-mare-alta");
    expect(
      await screen.findByRole("button", { name: /play maré alta/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /notify me when/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^1 track, out /)).not.toBeInTheDocument();
  });

  it("offers Report on an upcoming release to a visitor", async () => {
    renderRelease("demo-release-scheduled-night-bus");
    fireEvent.click(
      await screen.findByRole("button", { name: "More actions" }),
    );
    expect(
      await screen.findByRole("menuitem", { name: /report/i }),
    ).toBeInTheDocument();
  });

  it("gives the owner of a scheduled release a More menu with no Report", async () => {
    renderRelease("demo-release-scheduled-mare-alta");
    await screen.findByRole("button", { name: /play maré alta/i });
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(
      await screen.findByRole("menuitem", { name: /copy link/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /report/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the version note and the buy link on a published release", async () => {
    renderRelease("demo-release-cidade-dos-santos");
    expect(await screen.findByText(/^Version 2 ·/)).toBeInTheDocument();
    expect(
      screen.getByText(/whole field recording of my grandmother/),
    ).toBeInTheDocument();
    const support = screen.getByRole("region", {
      name: "Buy and support Mariana Sol",
    });
    expect(
      within(support).getByRole("link", { name: /buy on bandcamp/i }),
    ).toHaveAttribute(
      "href",
      "https://marianasol.bandcamp.com/album/cidade-dos-santos",
    );
  });
});
