import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryMenuSection } from "./DirectoryMenuSection";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import type {
  ListingMenu,
  ListingMenuItem,
} from "./listBusiness/listingMenu.data";

function renderSection(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

function placeWith(menu: ListingMenu): DirectoryPlace {
  return { ...DIRECTORY_PLACES[0]!, pricingMode: "menu", menu };
}

const section = (title: string) => ({
  title,
  items: [
    { name: `${title} item`, price: "2.50", description: "", dietary: [] },
  ],
  subsections: [],
});

describe("sub-sections and glass / bottle prices", () => {
  const wines = (items: ListingMenuItem[]): ListingMenu => ({
    currency: "EUR",
    sections: [
      {
        title: "Wines",
        items: [],
        subsections: [{ title: "Red", items }],
      },
    ],
    file: null,
    link: "",
  });
  const wine = (overrides: Partial<ListingMenuItem>): ListingMenuItem => ({
    name: "Dão Tinto",
    price: "",
    description: "",
    dietary: [],
    ...overrides,
  });

  it("shows both prices on one line divided by a slash", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith(
          wines([wine({ priceGlass: "12.00", priceBottle: "48.00" })]),
        )}
      />,
    );
    const priceCell = screen.getByRole("img", {
      name: "€12.00 per glass, €48.00 per bottle",
    });
    expect(priceCell).toHaveTextContent("€12.00 / €48.00");
  });

  it("says which price it is when only one exists", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith(
          wines([
            wine({ name: "Pet-Nat", priceBottle: "42.00" }),
            wine({ name: "Bical", priceGlass: "8.00" }),
          ]),
        )}
      />,
    );
    expect(screen.getByText("€42.00 per bottle")).toBeInTheDocument();
    expect(screen.getByText("€8.00 per glass")).toBeInTheDocument();
  });

  it("renders sub-section titles as h4 under the section h3", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith(wines([wine({ priceBottle: "30.00" })]))}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Wines" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 4, name: "Red" }),
    ).toBeInTheDocument();
  });

  it("shows the glass / bottle legend only when an item has both prices", () => {
    const { unmount } = renderSection(
      <DirectoryMenuSection
        place={placeWith(wines([wine({ priceBottle: "30.00" })]))}
      />,
    );
    expect(screen.queryByText("Glass / bottle")).toBeNull();
    unmount();
    renderSection(
      <DirectoryMenuSection
        place={placeWith(
          wines([wine({ priceGlass: "6.00", priceBottle: "30.00" })]),
        )}
      />,
    );
    expect(screen.getByText("Glass / bottle")).toBeInTheDocument();
  });

  it("counts dietary labels of sub-section items in the summary", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith(
          wines([wine({ priceBottle: "30.00", dietary: ["vegan"] })]),
        )}
      />,
    );
    expect(screen.getByText(/Labels on this menu: Vegan/)).toBeInTheDocument();
  });

  it("keeps the jump chips to section titles", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          currency: "EUR",
          sections: [
            section("Coffee"),
            section("Cakes"),
            {
              title: "Wines",
              items: [],
              subsections: [
                { title: "Red", items: [wine({ priceBottle: "30.00" })] },
              ],
            },
          ],
          file: null,
          link: "",
        })}
      />,
    );
    const chips = within(screen.getByRole("navigation"));
    expect(chips.getByRole("button", { name: "Wines" })).toBeInTheDocument();
    expect(chips.queryByRole("button", { name: "Red" })).toBeNull();
  });

  it("still shows the single price of an item without glass or bottle", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith(wines([wine({ price: "12.00" })]))}
      />,
    );
    expect(screen.getByText("€12.00")).toBeInTheDocument();
  });
});
