import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryMenuSection } from "./DirectoryMenuSection";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import type { ListingMenu } from "./listBusiness/listingMenu.data";

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
    { name: `${title} item`, price: "2 EUR", description: "", dietary: [] },
  ],
});

describe("DirectoryMenuSection", () => {
  it("renders nothing for an empty menu", () => {
    const { container } = renderSection(
      <DirectoryMenuSection
        place={placeWith({ sections: [], file: null, link: "" })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders only the footer link when the menu is just a link", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [],
          file: null,
          link: "https://example.pt/menu",
        })}
      />,
    );
    expect(
      screen.getByRole("link", { name: /menu on their site/i }),
    ).toHaveAttribute("href", "https://example.pt/menu");
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });

  it("adds https:// to a link saved without a scheme, so it never resolves as an in-app path", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [],
          file: null,
          link: "cafe.pt/menu",
        })}
      />,
    );
    expect(
      screen.getByRole("link", { name: /menu on their site/i }),
    ).toHaveAttribute("href", "https://cafe.pt/menu");
  });

  it("labels a PDF file as a PDF", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [],
          file: {
            url: "https://api.test/files/x.pdf",
            contentType: "application/pdf",
            fileName: "Menu.pdf",
          },
          link: "",
        })}
      />,
    );
    expect(
      screen.getByRole("link", { name: /full menu \(pdf\)/i }),
    ).toBeInTheDocument();
  });

  it("hides the jump chips below three sections and shows them from three", () => {
    const { unmount } = renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [section("Coffee"), section("Cakes")],
          file: null,
          link: "",
        })}
      />,
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    unmount();
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [section("Coffee"), section("Cakes"), section("Drinks")],
          file: null,
          link: "",
        })}
      />,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows dietary labels as readable text", () => {
    renderSection(
      <DirectoryMenuSection
        place={placeWith({
          sections: [
            {
              title: "Cakes",
              items: [
                {
                  name: "Orange cake",
                  price: "2.20 EUR",
                  description: "",
                  dietary: ["vegan", "glutenFree"],
                },
              ],
            },
          ],
          file: null,
          link: "",
        })}
      />,
    );
    expect(screen.getAllByText("Vegan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gluten-free").length).toBeGreaterThan(0);
  });
});
