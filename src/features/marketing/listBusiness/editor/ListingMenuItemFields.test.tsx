import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { ListingMenuItemRow } from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuItemFields } from "./ListingMenuItemFields";

const flatWhite: ListingMenuItemRow = {
  id: "item-1",
  name: "Flat white",
  price: "2.50",
  description: "",
  dietary: [],
};

function renderItem(item: ListingMenuItemRow = flatWhite) {
  const form = {
    setMenuItemField: vi.fn(),
    toggleMenuItemDietary: vi.fn(),
    moveMenuItem: vi.fn(),
    removeMenuItem: vi.fn(),
  };
  render(
    <ListingMenuItemFields
      form={form as unknown as ListingForm}
      sectionId="section-1"
      item={item}
      currency="EUR"
      position={2}
      total={3}
    />,
    { wrapper: TestProviders },
  );
  return form;
}

describe("ListingMenuItemFields", () => {
  it("renders a single price field for a direct item", () => {
    renderItem();
    expect(screen.getAllByPlaceholderText("2.50")).toHaveLength(1);
    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("writes the typed price to the price field of the item", () => {
    const form = renderItem();
    fireEvent.change(screen.getByPlaceholderText("2.50"), {
      target: { value: "3.20" },
    });
    expect(form.setMenuItemField).toHaveBeenCalledWith("section-1", "item-1", {
      price: "3.20",
    });
  });

  it("writes the description through the shared extras", () => {
    const form = renderItem();
    fireEvent.change(
      screen.getByPlaceholderText("Double shot, whole or oat milk"),
      { target: { value: "Oat milk" } },
    );
    expect(form.setMenuItemField).toHaveBeenCalledWith("section-1", "item-1", {
      description: "Oat milk",
    });
  });

  it("routes move and remove buttons to the form with the item id", () => {
    const form = renderItem();
    fireEvent.click(screen.getByRole("button", { name: "Move Flat white up" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Move Flat white down" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Flat white" }));
    expect(form.moveMenuItem).toHaveBeenNthCalledWith(
      1,
      "section-1",
      "item-1",
      -1,
    );
    expect(form.moveMenuItem).toHaveBeenNthCalledWith(
      2,
      "section-1",
      "item-1",
      1,
    );
    expect(form.removeMenuItem).toHaveBeenCalledWith("section-1", "item-1");
  });
});
