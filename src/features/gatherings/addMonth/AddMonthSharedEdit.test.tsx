import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AddMonthCostValues, AddMonthPlaceValues } from "./addMonthState";
import { AddMonthSharedEdit } from "./AddMonthSharedEdit";
import { awaitCatalog } from "../../../test/awaitCatalog";

const dispatch = vi.fn();

const PLACE: AddMonthPlaceValues = {
  hood: "Mouraria",
  venue: "A Tasca",
  venueListingId: null,
  venueListing: null,
  address: "Rua da Mouraria 12",
  directions: "",
  onlineUrl: "",
};

const FREE_COST: AddMonthCostValues = {
  costKind: "free",
  cost: "",
  paymentUrl: "",
  paymentInstructions: "",
};

async function renderEdit(
  overrides: {
    place?: Partial<AddMonthPlaceValues>;
    cost?: Partial<AddMonthCostValues>;
    isVenueListingRefused?: boolean;
  } = {},
) {
  const view = render(
    <TestProviders>
      <AddMonthSharedEdit
        place={{ ...PLACE, ...overrides.place }}
        cost={{ ...FREE_COST, ...overrides.cost }}
        dispatch={dispatch}
        isVenueListingRefused={overrides.isVenueListingRefused ?? false}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
}

describe("AddMonthSharedEdit", () => {
  beforeEach(() => {
    dispatch.mockClear();
  });

  it("renders the wizard's place fields with the month's values", async () => {
    await renderEdit();
    expect(screen.getByDisplayValue("Rua da Mouraria 12")).toBeInTheDocument();
  });

  it("patches the place when the address changes", async () => {
    await renderEdit();
    fireEvent.change(screen.getByDisplayValue("Rua da Mouraria 12"), {
      target: { value: "Rua Nova 3" },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: "patchPlace",
      patch: { address: "Rua Nova 3" },
    });
  });

  it("patches the cost when Pay what you can is chosen", async () => {
    await renderEdit();
    fireEvent.click(screen.getByRole("button", { name: "Pay what you can" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "patchCost",
      patch: { costKind: "pay-what-you-can" },
    });
  });

  it("shows the payment fields once the cost is paid", async () => {
    await renderEdit({ cost: { costKind: "fixed", cost: "10 EUR" } });
    expect(screen.getByLabelText(/^Payment link/)).toBeInTheDocument();
  });

  it("resets place and cost to the template's with one action", async () => {
    await renderEdit();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Use the starting event's place and cost",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "resetShared" });
  });

  it("names a venue the directory refused", async () => {
    await renderEdit({ isVenueListingRefused: true });
    expect(
      screen.getByText(/This venue can't be linked to an event any more/),
    ).toBeInTheDocument();
  });
});
