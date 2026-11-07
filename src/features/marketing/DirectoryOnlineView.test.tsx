import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryPage } from "./DirectoryPage";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import { AUTH_STORAGE_KEY } from "./cookies.data";
import {
  countListingFactChips,
  NO_LISTING_FACT_FILTERS,
} from "./directoryListingFactFilters";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "./directoryOnlinePlaces.data";
import { isSellingOnline } from "./listBusiness/listingOnline.data";
import { LISTING_OWNED_BY } from "./listBusiness/listingOwnedBy.data";
import { CONSTELLATION_LIMIT } from "./onlineConstellation";
import { ACCESSIBILITY_QUESTION_SLUGS } from "./listBusiness/listingAccessibility.data";
import { awaitCatalog } from "../../test/awaitCatalog";

/** The demo Online tab's pool: online-only listings and places that also
 *  sell online. The 18+ fixture sits outside `DIRECTORY_PLACES`. */
const SELLING_ONLINE = DIRECTORY_PLACES.filter((place) =>
  isSellingOnline(place),
);
const ADULT_SHOP_NAME = "Toque Macio";

async function renderDirectory(search: string) {
  const view = render(<DirectoryPage />, {
    wrapper: ({ children }) => (
      <TestProviders initialEntries={[`/local/directory${search}`]}>
        {children}
      </TestProviders>
    ),
  });
  await awaitCatalog("marketing");
  return view;
}

/** Resolves once the results header counts `total` online businesses. The
 *  sentence's line wraps it in a second span with the same text, so only the
 *  innermost span that holds the whole sentence matches. */
function findOnlineCount(total: number) {
  const sentence = `Showing ${total} of ${total} online businesses`;
  return screen.findByText(
    (_, element) =>
      element?.tagName === "SPAN" &&
      element.textContent === sentence &&
      !Array.from(element.children).some(
        (child) => child.textContent === sentence,
      ),
    undefined,
    { timeout: 3000 },
  );
}

describe("DirectoryPage, Online tab", () => {
  afterEach(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  });

  it("shows every business that sells online and none of the places that only have a door", async () => {
    await renderDirectory("?view=online");

    const constellation = await screen.findByRole(
      "list",
      { name: /selling online around/i },
      { timeout: 3000 },
    );
    const nodes = within(constellation).getAllByRole("link");
    expect(nodes).toHaveLength(
      Math.min(SELLING_ONLINE.length, CONSTELLATION_LIMIT),
    );

    for (const place of SELLING_ONLINE) {
      expect(screen.getAllByText(place.name).length).toBeGreaterThan(0);
    }
    // A physical place from the same registry stays on the List and Map tabs.
    expect(screen.queryByText("Atelier Pulso")).not.toBeInTheDocument();
    // The 18+ shop is never part of the public pool.
    expect(screen.queryByText(ADULT_SHOP_NAME)).not.toBeInTheDocument();
  });

  it("marks the Online view as the one selected", async () => {
    await renderDirectory("?view=online");
    const online = await screen.findByRole("button", { name: "Online" });
    expect(online).toHaveAttribute("aria-pressed", "true");
  });

  it("counts online businesses in the results header", async () => {
    await renderDirectory("?view=online");
    expect(await findOnlineCount(SELLING_ONLINE.length)).toBeInTheDocument();
  });

  it("drops Open now on the way into the Online tab", async () => {
    await renderDirectory("?view=list&open=now");
    const openNowChip = /open now.*remove filter/i;
    expect(
      await screen.findAllByRole("button", { name: openNowChip }),
    ).not.toHaveLength(0);

    fireEvent.click(await screen.findByRole("button", { name: "Online" }));

    await waitFor(() =>
      expect(
        screen.queryAllByRole("button", { name: openNowChip }),
      ).toHaveLength(0),
    );
    expect(screen.getByRole("button", { name: "Online" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("ignores Open now in a direct link to the Online tab", async () => {
    await renderDirectory("?view=online&open=now");

    expect(await findOnlineCount(SELLING_ONLINE.length)).toBeInTheDocument();
    expect(
      screen.queryAllByRole("button", { name: /open now.*remove filter/i }),
    ).toHaveLength(0);
  });

  it("ignores a place type the Online tab does not offer in a direct link", async () => {
    await renderDirectory("?view=online&cat=culture");

    expect(await findOnlineCount(SELLING_ONLINE.length)).toBeInTheDocument();
    expect(
      screen.queryAllByRole("button", { name: /culture.*remove filter/i }),
    ).toHaveLength(0);
  });

  it("shows no 18+ shop to a visitor who is signed out, even with adult=1", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    await renderDirectory("?view=online&adult=1");

    expect(await findOnlineCount(SELLING_ONLINE.length)).toBeInTheDocument();
    expect(screen.queryByText(ADULT_SHOP_NAME)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show 18+ shops" }),
    ).not.toBeInTheDocument();
  });

  it("merges the 18+ shop for a signed-in member with the chip on", async () => {
    await renderDirectory("?view=online&adult=1");

    expect(
      (
        await screen.findAllByText(ADULT_SHOP_NAME, undefined, {
          timeout: 3000,
        })
      ).length,
    ).toBeGreaterThan(0);
    // Counted once: the header adds the 18+ shop to the pool a single time.
    const total = SELLING_ONLINE.length + ADULT_ONLINE_DIRECTORY_PLACES.length;
    expect(await findOnlineCount(total)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show 18+ shops" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("LocalFilterFields, online scope", () => {
  const noop = () => {};
  const fields: LocalFilterFieldsProps = {
    categories: [],
    onToggleCategory: noop,
    onClearCategories: noop,
    categoryCounts: { all: 0 },
    // Each count above zero keeps a chip pickable, and a category with no
    // count is not known yet, which keeps it pickable too.
    chipCounts: {
      openNow: 1,
      safe: 1,
      access: Object.fromEntries(
        ACCESSIBILITY_QUESTION_SLUGS.map((slug) => [slug, 1]),
      ),
      owned: Object.fromEntries(LISTING_OWNED_BY.map((value) => [value, 1])),
      listingFacts: countListingFactChips(() => 1, NO_LISTING_FACT_FILTERS, []),
    },
    query: "",
    onQueryChange: noop,
    listingFacts: NO_LISTING_FACT_FILTERS,
    onToggleListingFact: noop,
    safeOnly: false,
    onToggleSafeOnly: noop,
    openNow: false,
    onToggleOpenNow: noop,
    access: [],
    onToggleAccess: noop,
    owned: [],
    onToggleOwned: noop,
    sort: "default",
    onSortChange: noop,
    isLocationOn: false,
  };

  // The flat "sheet" variant renders every group without a drawer to open.
  function renderFields(isOnlineScope: boolean) {
    return render(
      <LocalFilterFields
        {...fields}
        variant="sheet"
        isOnlineScope={isOnlineScope}
      />,
      { wrapper: TestProviders },
    );
  }

  it("offers 'Open now' for places with a door", async () => {
    renderFields(false);
    expect(
      await screen.findByRole("button", { name: /open now/i }),
    ).toBeInTheDocument();
  });

  it("leaves out 'Open now' on the Online tab, keeping the safe-space filter", async () => {
    renderFields(true);
    expect(
      await screen.findByRole("button", { name: /verified safe spaces/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open now/i }),
    ).not.toBeInTheDocument();
  });
});
