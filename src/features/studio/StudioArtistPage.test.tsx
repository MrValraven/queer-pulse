import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toArtistView } from "./api/studio.adapters";
import { demoStudioArtist } from "./api/studioDemoApi";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import { studioKeys } from "./api/studioQueryKeys";
import { StudioArtistPage } from "./StudioArtistPage";

describe("StudioArtistPage (demo fixture)", () => {
  it("shows the artist from data with a working tablist", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "NIGHTFORM" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute(
      "href",
      "/p/nightform",
    );
    const about = screen.getByRole("tab", { name: "About" });
    fireEvent.click(about);
    expect(about).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Synths, a drum machine",
    );
  });

  it("gives the owner a Your releases panel with the takedown reason", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    expect(within(panel).getByText("Cartas ao mar")).toBeInTheDocument();
    expect(within(panel).getByText(/check the sample/)).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: /edit cartas ao mar/i }),
    ).toHaveAttribute(
      "href",
      "/studio/upload?release=demo-release-draft-cartas-ao-mar",
    );
  });

  it("asks before deleting a draft", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    fireEvent.click(
      within(panel).getByRole("button", { name: /delete cartas ao mar/i }),
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("offers a published release only Edit and Unpublish", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    const row = within(panel).getByText("Devoção").closest("li");
    expect(row).not.toBeNull();
    const rowScope = within(row as HTMLElement);
    expect(
      rowScope.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["Unpublish"]);
    expect(
      rowScope.getByRole("button", { name: /unpublish devoção/i }),
    ).toBeInTheDocument();
    expect(
      rowScope.getByRole("link", { name: /edit devoção/i }),
    ).toBeInTheDocument();
  });

  it("shows a taken-down release's reason with no actions", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    const row = within(panel).getByText("Bairro antigo").closest("li");
    expect(row).not.toBeNull();
    const rowScope = within(row as HTMLElement);
    expect(rowScope.getByText(/check the sample/)).toBeInTheDocument();
    expect(rowScope.queryAllByRole("button")).toHaveLength(0);
    expect(rowScope.queryByRole("link", { name: /^edit/i })).toBeNull();
  });

  it("shows no Your releases panel on another member's artist page", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "NIGHTFORM" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /your releases/i })).toBeNull();
  });

  it("moves focus to the page heading when deleting the only draft empties the panel", async () => {
    // The demo owner with one draft and nothing else, seeded into the cache.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const ownerView = toArtistView(demoStudioArtist(DEMO_ARTIST_MARIANA.id));
    queryClient.setQueryData(studioKeys.artist(true, DEMO_ARTIST_MARIANA.id), {
      ...ownerView,
      releases: [],
      singles: [],
      ownerReleases: (ownerView.ownerReleases ?? []).filter(
        (release) => release.status === "draft",
      ),
    });
    render(
      <TestProviders
        queryClient={queryClient}
        initialEntries={[`/studio/artist?id=${DEMO_ARTIST_MARIANA.id}`]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(
      within(panel).getByRole("button", { name: /delete cartas ao mar/i }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete draft" }),
    );
    const heading = screen.getByRole("heading", { level: 1 });
    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(screen.queryByRole("region", { name: /your releases/i })).toBeNull();
  });

  it("shows the Studio not-found state for an unknown artist", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=nobody"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    expect(await screen.findByText(/can't find/i)).toBeInTheDocument();
  });
});
