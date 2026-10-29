import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toArtistView } from "./api/studio.adapters";
import { demoStudioArtist } from "./api/studioDemoApi";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { DEMO_ARTIST_MARIANA } from "./api/studioDemoMe.data";
import { studioKeys } from "./api/studioQueryKeys";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioArtistPage } from "./StudioArtistPage";

beforeEach(() => resetDemoCreditLedger());

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

describe("StudioArtistPage artist tools (demo fixture)", () => {
  it("shows a visitor the Upcoming card with Notify me and the support links", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    const upcoming = await screen.findByRole("region", { name: "Upcoming" });
    expect(
      within(upcoming).getByText("Night bus (extended)"),
    ).toBeInTheDocument();
    expect(
      within(upcoming).getByRole("button", {
        name: "Notify me when Night bus (extended) is out",
      }),
    ).toBeInTheDocument();
    const support = screen.getByRole("region", { name: "Support NIGHTFORM" });
    expect(
      within(support).getByRole("link", { name: /bandcamp/i }),
    ).toHaveAttribute("target", "_blank");
  });

  it("puts Press kit in a visitor's overflow menu", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "More about NIGHTFORM" }),
    );
    expect(
      await screen.findByRole("menuitem", { name: "Press kit" }),
    ).toHaveAttribute("href", "/studio/press?id=sp-diogo-nightform");
  });

  it("shows the persona's updates in the About tab", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("tab", { name: "About" }));
    expect(
      await screen.findByRole("heading", { name: "Updates" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "new single in nine days, Night bus, the long version",
      ),
    ).toBeInTheDocument();
  });

  it("gives the owner Edit on an upcoming release, without Notify me", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    const upcoming = await screen.findByRole("region", { name: "Upcoming" });
    expect(
      within(upcoming).getByRole("link", { name: "Edit Maré alta" }),
    ).toHaveAttribute(
      "href",
      "/studio/upload?release=demo-release-scheduled-mare-alta",
    );
    expect(
      within(upcoming).queryByRole("button", { name: /notify me/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "More about Mariana Sol" }),
    ).toBeNull();
  });
});

describe("StudioArtistMain playlists", () => {
  it("lists the persona's public playlists under a Public playlists heading", () => {
    const artistView = toArtistView(demoStudioArtist(DEMO_ARTIST_MARIANA.id));
    expect(artistView.playlists.length).toBeGreaterThan(0);
    render(
      <TestProviders>
        <StudioArtistMain tab="music" artist={artistView} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Public playlists" }),
    ).toBeInTheDocument();
    const [firstPlaylist] = artistView.playlists;
    expect(
      screen.getByRole("link", { name: firstPlaylist?.name }),
    ).toBeInTheDocument();
  });

  it("renders no Public playlists section when the persona has none", () => {
    const artistView = {
      ...toArtistView(demoStudioArtist(DEMO_ARTIST_MARIANA.id)),
      playlists: [],
    };
    render(
      <TestProviders>
        <StudioArtistMain tab="music" artist={artistView} />
      </TestProviders>,
    );
    expect(
      screen.queryByRole("heading", { level: 2, name: "Public playlists" }),
    ).not.toBeInTheDocument();
  });
});

describe("artist discovery (demo)", () => {
  it("lists the releases an artist appears on, with the roles, and related artists", async () => {
    render(
      <TestProviders initialEntries={["/studio/artist?id=sp-diogo-nightform"]}>
        <StudioArtistPage />
      </TestProviders>,
    );
    const appearsOn = await screen.findByRole("region", { name: "Appears on" });
    expect(
      within(appearsOn).getByRole("link", { name: "Cidade dos santos" }),
    ).toBeInTheDocument();
    expect(
      within(appearsOn).getByText("Mariana Sol · Producer"),
    ).toBeInTheDocument();
    const related = await screen.findByRole("region", {
      name: "Related artists",
    });
    const relatedNames = within(related)
      .getAllByRole("link")
      .map((link) => link.textContent ?? "");
    expect(relatedNames[0]).toMatch(/Mariana Sol/);
    expect(relatedNames).toHaveLength(4);
  });

  it("folds Appears on away for an artist with no accepted credits", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <TestProviders
        queryClient={queryClient}
        initialEntries={["/studio/artist?id=sp-jordan-lechatdashinko"]}
      >
        <StudioArtistPage />
      </TestProviders>,
    );
    await screen.findByRole("region", { name: "Related artists" });
    // The two reads land on their own clocks: wait for the Appears on answer
    // itself before reading the fold.
    await waitFor(() =>
      expect(
        queryClient.getQueryState(
          studioKeys.appearsOn(true, "sp-jordan-lechatdashinko"),
        )?.status,
      ).toBe("success"),
    );
    expect(screen.queryByRole("region", { name: "Appears on" })).toBeNull();
  });
});

describe("StudioArtistPage: no demo subscribe or tip entry points", () => {
  const artists = [
    { id: DEMO_ARTIST_MARIANA.id, name: "Mariana Sol" },
    { id: "sp-diogo-nightform", name: "NIGHTFORM" },
  ];

  it.each(artists)(
    "shows $name with no ledger card, subscribe card, pay pill or Tip",
    async ({ id, name }) => {
      render(
        <TestProviders initialEntries={[`/studio/artist?id=${id}`]}>
          <StudioArtistPage />
        </TestProviders>,
      );
      expect(
        await screen.findByRole("heading", { level: 1, name }),
      ).toBeInTheDocument();
      const checkoutLinks = screen
        .queryAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/studio/checkout");
      expect(checkoutLinks).toHaveLength(0);
      expect(screen.queryByRole("button", { name: "One-off tip" })).toBeNull();
      expect(screen.queryByRole("button", { name: /^Tip/ })).toBeNull();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByText(/no platform cut/)).toBeNull();
      expect(screen.queryByText("Or tip on top of streaming.")).toBeNull();
      expect(screen.queryByText(`${name} · this month`)).toBeNull();
    },
  );
});
