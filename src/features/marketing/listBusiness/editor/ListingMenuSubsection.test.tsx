import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  ListingMenuItemRow,
  ListingMenuSectionRow,
  ListingMenuSubsectionRow,
} from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuSectionFields } from "./ListingMenuSectionFields";

function wineRow(overrides: Partial<ListingMenuItemRow> = {}) {
  return {
    id: "wine-1",
    name: "Tempranillo",
    price: "",
    priceGlass: "",
    priceBottle: "",
    description: "",
    dietary: [],
    ...overrides,
  } satisfies ListingMenuItemRow;
}

function subsectionRow(
  overrides: Partial<ListingMenuSubsectionRow> = {},
): ListingMenuSubsectionRow {
  return { id: "sub-1", title: "Red", items: [wineRow()], ...overrides };
}

function renderSection(
  subsections: ListingMenuSubsectionRow[],
  isAtItemCeiling = false,
) {
  const section: ListingMenuSectionRow = {
    id: "section-1",
    title: "Wines",
    items: [],
    subsections,
  };
  const form = {
    addMenuSubsection: vi.fn(),
    removeMenuSubsection: vi.fn(),
    setSubsectionItemField: vi.fn(),
    setMenuSubsectionTitle: vi.fn(),
    removeSubsectionItem: vi.fn(),
  };
  render(
    <ListingMenuSectionFields
      form={form as unknown as ListingForm}
      section={section}
      currency="EUR"
      position={1}
      total={1}
      isAtItemCeiling={isAtItemCeiling}
    />,
    { wrapper: TestProviders },
  );
  return form;
}

describe("sub-sections in the menu editor", () => {
  it("shows a visible slash between the glass and bottle prices", () => {
    renderSection([subsectionRow()]);
    const divider = screen.getByText("/");
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByPlaceholderText("4.50")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("22.00")).toBeInTheDocument();
  });

  it("groups the price pair under a described label", () => {
    renderSection([subsectionRow()]);
    expect(
      screen.getByRole("group", {
        name: "Price per glass and per bottle, both optional",
      }),
    ).toBeInTheDocument();
  });

  it("writes the glass and bottle prices to their own fields", () => {
    const form = renderSection([subsectionRow()]);
    fireEvent.change(screen.getByPlaceholderText("4.50"), {
      target: { value: "5.50" },
    });
    fireEvent.change(screen.getByPlaceholderText("22.00"), {
      target: { value: "26" },
    });
    expect(form.setSubsectionItemField).toHaveBeenNthCalledWith(
      1,
      "section-1",
      "sub-1",
      "wine-1",
      { priceGlass: "5.50" },
    );
    expect(form.setSubsectionItemField).toHaveBeenNthCalledWith(
      2,
      "section-1",
      "sub-1",
      "wine-1",
      { priceBottle: "26" },
    );
  });

  it("names the field that holds a malformed glass price", () => {
    renderSection([subsectionRow({ items: [wineRow({ priceGlass: "." })] })]);
    expect(screen.getByRole("alert")).toHaveTextContent(/glass/i);
  });

  it("names each malformed price and marks both fields invalid", () => {
    renderSection([
      subsectionRow({
        items: [wineRow({ priceGlass: ".", priceBottle: "," })],
      }),
    ]);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Add digits to the per glass price");
    expect(alerts[1]).toHaveTextContent("Add digits to the per bottle price");
    expect(screen.getByPlaceholderText("4.50")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByPlaceholderText("22.00")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows wine examples on a sub-section item", () => {
    renderSection([subsectionRow()]);
    expect(screen.getByPlaceholderText("Douro Reserva")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Dark fruit, long finish"),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Flat white")).not.toBeInTheDocument();
  });

  it("adds a sub-section to the section", () => {
    const form = renderSection([]);
    fireEvent.click(screen.getByRole("button", { name: "Add a sub-section" }));
    expect(form.addMenuSubsection).toHaveBeenCalledWith("section-1");
  });

  it("disables adding a sub-section at the limit of eight", () => {
    const subsections = Array.from({ length: 8 }, (_, index) =>
      subsectionRow({ id: `sub-${index}`, title: `Group ${index}` }),
    );
    renderSection(subsections);
    expect(
      screen.getByRole("button", { name: "Add a sub-section" }),
    ).toBeDisabled();
  });

  it("disables adding a sub-section at the item ceiling", () => {
    renderSection([], true);
    expect(
      screen.getByRole("button", { name: "Add a sub-section" }),
    ).toBeDisabled();
  });

  it("removes a sub-section with no typed items without asking", () => {
    const form = renderSection([
      subsectionRow({ items: [wineRow({ name: "" })] }),
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Remove Red" }));
    expect(form.removeMenuSubsection).toHaveBeenCalledWith(
      "section-1",
      "sub-1",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks before removing a sub-section that holds typed items", () => {
    const form = renderSection([subsectionRow()]);
    fireEvent.click(screen.getByRole("button", { name: "Remove Red" }));
    expect(form.removeMenuSubsection).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove sub-section" }));
    expect(form.removeMenuSubsection).toHaveBeenCalledWith(
      "section-1",
      "sub-1",
    );
  });
});
