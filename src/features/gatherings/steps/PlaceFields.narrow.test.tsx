import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ONLINE_HOOD_VALUE } from "./dateNotes.data";
import { PlaceFields, type PlaceFieldsForm } from "./PlaceFields";

function buildPlaceForm(
  overrides: Partial<PlaceFieldsForm> = {},
): PlaceFieldsForm {
  return {
    hood: "Mouraria",
    venue: "A Tasca",
    venueListingId: null,
    venueListing: null,
    address: "Rua 1",
    directions: "",
    onlineUrl: "",
    onlineUrlValid: true,
    isVenueListingRefused: false,
    setHood: vi.fn(),
    setVenue: vi.fn(),
    setVenueListingId: vi.fn(),
    setVenueListing: vi.fn(),
    setAddress: vi.fn(),
    setDirections: vi.fn(),
    setOnlineUrl: vi.fn(),
    ...overrides,
  };
}

describe("PlaceFields with a narrowed form", () => {
  it("renders the address fields from a plain object holding only the place members", () => {
    render(
      <TestProviders>
        <PlaceFields form={buildPlaceForm()} />
      </TestProviders>,
    );
    expect(screen.getByDisplayValue("Rua 1")).toBeInTheDocument();
  });

  it("asks for the join link when the hood is Online", () => {
    render(
      <TestProviders>
        <PlaceFields form={buildPlaceForm({ hood: ONLINE_HOOD_VALUE })} />
      </TestProviders>,
    );
    expect(screen.getByRole("textbox", { name: /link/i })).toBeInTheDocument();
  });
});
