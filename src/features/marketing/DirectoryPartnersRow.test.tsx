import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { directoryPartnersKey } from "./api/useDirectoryPartners";
import { DirectoryPage } from "./DirectoryPage";
import { DirectoryPartnerCard } from "./DirectoryPartnerCard";
import { DirectoryPartnersRow } from "./DirectoryPartnersRow";
import { resetDemoDirectoryPartners } from "./directoryPartnersDemoStore";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import type { DirectoryView } from "./useDirectoryFilters";

const ROW_NAME = "Businesses we partner with";

function newQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/** The row as the page mounts it for a view: the Online tab's own row on
 *  the Online view, the List row everywhere else. */
function rowFor(view: DirectoryView, hasActiveFilters = false) {
  return (
    <DirectoryPartnersRow
      view={view}
      shownOnView={view === "online" ? "online" : "list"}
      hasActiveFilters={hasActiveFilters}
      isPhone={false}
    />
  );
}

/** Renders the row on its own QueryClient and hands the client back, so a
 *  test can wait for the demo partners read to finish. */
function renderRow(view: DirectoryView, queryClient = newQueryClient()) {
  render(
    <TestProviders queryClient={queryClient}>{rowFor(view)}</TestProviders>,
  );
  return queryClient;
}

function cardHrefs(region: HTMLElement) {
  return within(region)
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"))
    .filter((href) => href?.startsWith("/local/directory/"));
}

/** Waits until the demo partners read has loaded its partners, so a missing
 *  row is the row's own decision and the query is past its loading state. */
async function waitForPartnersLoaded(queryClient: QueryClient) {
  await waitFor(() => {
    expect(queryClient.isFetching()).toBe(0);
    expect(queryClient.getQueryState(directoryPartnersKey(true))?.status).toBe(
      "success",
    );
  });
}

describe("DirectoryPartnersRow", () => {
  beforeEach(() => resetDemoDirectoryPartners());

  it("shows every showing partner in order on the list view", async () => {
    renderRow("list");
    const region = await screen.findByRole("region", { name: ROW_NAME });
    expect(cardHrefs(region)).toEqual([
      "/local/directory/livraria-bertha",
      "/local/directory/queer-supper-club",
      "/local/directory/fio-solto",
    ]);
    expect(within(region).getByText("Members get 10% off")).toBeInTheDocument();
    expect(within(region).queryByText("Noite Aberta")).toBeNull();
  });

  it("keeps only partners that sell online on the Online view", async () => {
    renderRow("online");
    const region = await screen.findByRole("region", { name: ROW_NAME });
    expect(cardHrefs(region)).toEqual([
      "/local/directory/livraria-bertha",
      "/local/directory/fio-solto",
    ]);
  });

  it("renders no row on the Online view when no partner sells online", async () => {
    resetDemoDirectoryPartners([
      { slug: "queer-supper-club", note: null, publicState: "showing" },
    ]);
    const queryClient = renderRow("online");
    await waitForPartnersLoaded(queryClient);
    expect(screen.queryByRole("region", { name: ROW_NAME })).toBeNull();
  });

  it("renders no row on the map view", async () => {
    const queryClient = renderRow("map");
    await waitForPartnersLoaded(queryClient);
    expect(screen.queryByRole("region", { name: ROW_NAME })).toBeNull();
  });

  it("folds away while a search or filter is active", async () => {
    // One client across both renders, so the partners stay loaded and only
    // the active filter closes the row.
    const queryClient = newQueryClient();
    const { rerender } = render(
      <TestProviders queryClient={queryClient}>{rowFor("list")}</TestProviders>,
    );
    await screen.findByRole("region", { name: ROW_NAME });
    rerender(
      <TestProviders queryClient={queryClient}>
        {rowFor("list", true)}
      </TestProviders>,
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("region", { name: ROW_NAME }),
    );
  });

  it("renders no row when no partner is showing", async () => {
    resetDemoDirectoryPartners([]);
    const queryClient = renderRow("list");
    await waitForPartnersLoaded(queryClient);
    expect(screen.queryByRole("region", { name: ROW_NAME })).toBeNull();
  });

  it("shows no note line for a partner with a blank note", async () => {
    resetDemoDirectoryPartners([
      {
        slug: "livraria-bertha",
        note: "Members get 10% off",
        publicState: "showing",
      },
      { slug: "fio-solto", note: "   ", publicState: "showing" },
    ]);
    renderRow("list");
    const region = await screen.findByRole("region", { name: ROW_NAME });
    const cardLinks = within(region).getAllByRole("link");
    const fioSoltoLink = cardLinks.find(
      (link) => link.getAttribute("href") === "/local/directory/fio-solto",
    );
    const berthaLink = cardLinks.find(
      (link) =>
        link.getAttribute("href") === "/local/directory/livraria-bertha",
    );
    expect(fioSoltoLink).toBeDefined();
    expect(fioSoltoLink?.querySelector("[data-partner-note]")).toBeNull();
    expect(berthaLink?.querySelector("[data-partner-note]")).not.toBeNull();
  });

  it("keeps the List row closed on the Online view", async () => {
    const queryClient = newQueryClient();
    render(
      <TestProviders queryClient={queryClient}>
        <DirectoryPartnersRow
          view="online"
          shownOnView="list"
          hasActiveFilters={false}
          isPhone={false}
        />
      </TestProviders>,
    );
    await waitForPartnersLoaded(queryClient);
    expect(screen.queryByRole("region", { name: ROW_NAME })).toBeNull();
  });
});

describe("DirectoryPage, partners row placement", () => {
  beforeEach(() => resetDemoDirectoryPartners());

  it("puts the Online tab's row under the Sold online band and above the cards", async () => {
    render(
      <TestProviders initialEntries={["/local/directory?view=online"]}>
        <DirectoryPage />
      </TestProviders>,
    );
    const region = await screen.findByRole(
      "region",
      { name: ROW_NAME },
      { timeout: 3000 },
    );
    // Only the Online tab's own row opens; the List row stays closed.
    expect(screen.getAllByRole("region", { name: ROW_NAME })).toHaveLength(1);
    const band = screen.getByText("Sold online").closest("section");
    if (!band) throw new Error("The Sold online band did not render");
    expect(
      band.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The same business's storefront card in the grid, past the band's node
    // and the row's own card.
    const gridCard = screen
      .getAllByRole("link")
      .find(
        (link) =>
          link.getAttribute("href") === "/local/directory/livraria-bertha" &&
          !region.contains(link) &&
          !band.contains(link),
      );
    if (!gridCard) throw new Error("The grid card did not render");
    expect(
      region.compareDocumentPosition(gridCard) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

const BERTHA = DIRECTORY_PLACES.find(
  (place) => place.slug === "livraria-bertha",
);

/** Renders one partner card for a variant of Livraria Bertha and returns
 *  its link. */
function renderCard(fields: Partial<DirectoryPlace>, note: string | null) {
  if (!BERTHA) throw new Error("The Livraria Bertha fixture is missing");
  render(
    <TestProviders>
      <DirectoryPartnerCard place={{ ...BERTHA, ...fields }} note={note} />
    </TestProviders>,
  );
  return screen.getByRole("link");
}

const WORKS_ACROSS_LISBON = {
  allOfCity: true,
  parishes: [],
  alsoTravelsTo: [],
  byAppointment: false,
};

describe("DirectoryPartnerCard", () => {
  it("names the card by the business and leaves the thumb out", () => {
    const link = renderCard({ photos: undefined }, null);
    expect(link).toHaveAccessibleName(/^Livraria Bertha/);
    expect(link).not.toHaveAttribute("title");
  });

  it("shows a place's neighbourhood", () => {
    const link = renderCard({ online: false, mobile: false }, null);
    expect(within(link).getByText("Príncipe Real")).toBeInTheDocument();
  });

  it("shows Online with the city for an online business that gives one", () => {
    const link = renderCard({ online: true, city: "Porto" }, null);
    expect(within(link).getByText("Online · Porto")).toBeInTheDocument();
  });

  it("shows Online alone for an online business with no city", () => {
    const link = renderCard({ online: true, city: undefined }, null);
    expect(within(link).getByText("Online")).toBeInTheDocument();
  });

  it("shows where an out-and-about business works", () => {
    const link = renderCard(
      {
        online: false,
        mobile: true,
        latitude: null,
        longitude: null,
        mobileDetails: WORKS_ACROSS_LISBON,
      },
      null,
    );
    expect(within(link).getByText("Works across Lisbon")).toBeInTheDocument();
  });

  it("shows the meeting point of an out-and-about business that has one", () => {
    const link = renderCard(
      {
        online: false,
        mobile: true,
        hood: "Arroios",
        latitude: 38.73,
        longitude: -9.13,
        mobileDetails: WORKS_ACROSS_LISBON,
      },
      null,
    );
    expect(within(link).getByText("Meets in Arroios")).toBeInTheDocument();
  });

  it("shows the note trimmed with its heart", () => {
    const link = renderCard({}, "  Members get 10% off  ");
    const noteLine = link.querySelector("[data-partner-note]");
    expect(noteLine).toHaveTextContent(/^Members get 10% off$/);
    expect(noteLine?.querySelector("svg")).not.toBeNull();
  });
});
