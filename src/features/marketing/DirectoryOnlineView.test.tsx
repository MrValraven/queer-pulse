import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryPage } from "./DirectoryPage";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import { ONLINE_DIRECTORY_PLACES } from "./directoryOnlinePlaces.data";
import {
  ACCESSIBILITY_QUESTION_SLUGS,
  type AccessibilitySlug,
} from "./listBusiness/listingAccessibility.data";

function renderDirectory(search: string) {
  return render(<DirectoryPage />, {
    wrapper: ({ children }) => (
      <TestProviders initialEntries={[`/local/directory${search}`]}>
        {children}
      </TestProviders>
    ),
  });
}

describe("DirectoryPage, Online tab", () => {
  it("shows every online-only business and none of the places with a door", async () => {
    renderDirectory("?view=online");

    const constellation = await screen.findByRole(
      "list",
      { name: /online-only businesses around/i },
      { timeout: 3000 },
    );
    const nodes = within(constellation).getAllByRole("link");
    expect(nodes).toHaveLength(ONLINE_DIRECTORY_PLACES.length);

    for (const place of ONLINE_DIRECTORY_PLACES) {
      expect(screen.getAllByText(place.name).length).toBeGreaterThan(0);
    }
    // A physical place from the same registry stays on the List and Map tabs.
    expect(screen.queryByText("Atelier Pulso")).not.toBeInTheDocument();
  });

  it("marks the Online view as the one selected", async () => {
    renderDirectory("?view=online");
    const online = await screen.findByRole("button", { name: "Online" });
    expect(online).toHaveAttribute("aria-pressed", "true");
  });

  it("counts online businesses in the results header", async () => {
    renderDirectory("?view=online");
    const total = ONLINE_DIRECTORY_PLACES.length;
    expect(
      await screen.findByText(
        (_, element) =>
          element?.tagName === "SPAN" &&
          element.textContent ===
            `Showing ${total} of ${total} online businesses`,
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });
});

describe("LocalFilterFields, online scope", () => {
  const noop = () => {};
  const fields: LocalFilterFieldsProps = {
    categories: [],
    onToggleCategory: noop,
    onClearCategories: noop,
    categoryCounts: { all: 0 },
    // An incomplete loaded set keeps every chip pickable whatever the counts
    // say, and each count above zero would keep a chip pickable on its own.
    chipCounts: {
      openNow: 1,
      safe: 1,
      access: Object.fromEntries(
        ACCESSIBILITY_QUESTION_SLUGS.map((slug) => [slug, 1]),
      ) as Record<AccessibilitySlug, number>,
      vibes: {},
    },
    isLoadedSetComplete: false,
    query: "",
    onQueryChange: noop,
    vibes: [],
    onToggleVibe: noop,
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
