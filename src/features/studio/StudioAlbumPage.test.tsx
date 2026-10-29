import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { DEMO_DEFAULT_RELEASE_ID } from "./api/studioDemoMe.data";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import { StudioAlbumPage } from "./StudioAlbumPage";

beforeEach(() => resetDemoCreditLedger());

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
      await screen.findByRole("button", { name: /^more actions$/i }),
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
      name: /^more actions$/i,
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
      screen.queryByRole("button", { name: "Like Bairro antigo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^more actions$/i }),
    ).not.toBeInTheDocument();
    // A taken-down release streams nothing, so its rows carry no track menu.
    expect(
      screen.queryByRole("button", { name: /^more actions for /i }),
    ).not.toBeInTheDocument();
  });
});

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname + location.search}
    </output>
  );
}

describe("StudioAlbumPage: a release our team took down", () => {
  it("shows the withdrawn view in place, at the same URL", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/album?id=demo-release-withdrawn"]}
      >
        <StudioAlbumPage />
        <LocationProbe />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "This release was withdrawn",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Studio home" }),
    ).toHaveAttribute("href", "/studio");
    expect(
      screen.getByRole("link", { name: "How takedowns work" }),
    ).toHaveAttribute("href", "/studio/rights");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/studio/album?id=demo-release-withdrawn",
    );
  });

  it("keeps the not-found state for a release that does not exist", async () => {
    render(
      <TestProviders initialEntries={["/studio/album?id=demo-release-nope"]}>
        <StudioAlbumPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "We can't find that in Studio",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("This release was withdrawn"),
    ).not.toBeInTheDocument();
  });
});

function renderAt(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <StudioAlbumPage />
    </TestProviders>,
  );
}

describe("StudioAlbumPage: buying and the supporter wall (demo)", () => {
  beforeEach(() => resetDemoPurchases());

  it("puts the Buy panel above the support card and drops the old demo buy card", async () => {
    renderAt("/studio/album?id=demo-release-home-1");
    const side = await screen.findByRole("region", { name: /^Buy / });
    expect(
      within(side).getByRole("button", { name: /^Buy .+ by Rita Ferreira$/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Buy .* €/ })).toBeNull();
    expect(document.querySelector('a[href="/studio/checkout"]')).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Pay what you can/ }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /^Tip/ })).toBeNull();
  });

  it("shows the supporter wall under the tracklist on Mariana's album", async () => {
    renderAt(`/studio/album?id=${DEMO_DEFAULT_RELEASE_ID}`);
    expect(
      await screen.findByRole("heading", { name: "Supported by" }),
    ).toBeInTheDocument();
  });

  it("shows no Buy panel and no wall on a lip-sync mix", async () => {
    renderAt("/studio/album?id=demo-release-vanda-sunday-mass");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("region", { name: /^Buy / })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Supported by" })).toBeNull();
  });

  it("shows no ledger card and no per-play line in demo", async () => {
    renderAt(`/studio/album?id=${DEMO_DEFAULT_RELEASE_ID}`);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText(/Public ledger for/)).toBeNull();
    expect(screen.queryByText(/^Every play pays/)).toBeNull();
  });

  it("moves focus to the Buy panel heading from the Buy shortcut", async () => {
    renderAt("/studio/album?id=demo-release-home-1");
    const side = await screen.findByRole("region", { name: /^Buy / });
    const shortcut = await screen.findByRole("button", {
      name: /^Buy (album|EP|single|release)$/,
    });
    fireEvent.click(shortcut);
    await waitFor(() =>
      expect(within(side).getByRole("heading", { level: 2 })).toHaveFocus(),
    );
  });

  it("shows no Buy shortcut where the panel offers no Buy button", async () => {
    renderAt("/studio/album?id=demo-release-vanda-sunday-mass");
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("button", {
        name: /^Buy (album|EP|single|release)$/,
      }),
    ).toBeNull();
  });
});
