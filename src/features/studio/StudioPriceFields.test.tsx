import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
} from "./api/studioDemoMe.data";
import { resetDemoPurchases } from "./api/studioDemoPurchases";
import {
  STUDIO_RELEASE_PRICE_FIELD_ID,
  StudioPriceFields,
} from "./StudioPriceFields";

type FieldsProps = Parameters<typeof StudioPriceFields>[0];

function renderFields(overrides: Partial<FieldsProps> = {}) {
  const props: FieldsProps = {
    amountInputId: STUDIO_RELEASE_PRICE_FIELD_ID,
    legendKey: "studio:purchase.price.legend",
    priceMode: "not_for_sale",
    priceText: "",
    onPriceModeChange: vi.fn(),
    onPriceTextChange: vi.fn(),
    errorKey: null,
    subprofileId: DEMO_ARTIST_MARIANA.id,
    isReleaseOut: true,
    ...overrides,
  };
  render(
    <TestProviders>
      <StudioPriceFields {...props} />
    </TestProviders>,
  );
  return props;
}

beforeEach(() => resetDemoPurchases());

describe("StudioPriceFields", () => {
  it("offers three choices and the amount only for a price", () => {
    renderFields({ priceMode: "not_for_sale" });
    expect(screen.getByRole("radio", { name: "Not for sale" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Fixed price" })).toBeVisible();
    expect(
      screen.getByRole("radio", { name: "Buyers name the price" }),
    ).toBeVisible();
    // Inside a closed Collapse, so it is not mounted.
    expect(
      screen.queryByRole("textbox", { name: "Price in euros" }),
    ).toBeNull();
  });

  it("labels the amount and its range by mode", () => {
    renderFields({ priceMode: "name_your_price", priceText: "0" });
    expect(
      screen.getByRole("textbox", { name: "Minimum in euros" }),
    ).toHaveValue("0");
    expect(
      screen.getByText("From €0 to €500. Buyers can pay more, up to €500"),
    ).toBeInTheDocument();
  });

  it("gives the amount the id the error summary links to", () => {
    renderFields({ priceMode: "fixed", priceText: "5" });
    expect(
      screen.getByRole("textbox", { name: "Price in euros" }),
    ).toHaveAttribute("id", STUDIO_RELEASE_PRICE_FIELD_ID);
  });

  it("names the refused price under the field", () => {
    renderFields({
      priceMode: "fixed",
      priceText: "0.50",
      errorKey: "studio:errors.reason.studio_price_out_of_range",
    });
    const amount = screen.getByRole("textbox", { name: "Price in euros" });
    const errorLine = screen.getByText(
      "A fixed price runs from €1 to €500, and a minimum from €0 to €500",
    );
    expect(errorLine).toBeInTheDocument();
    expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(amount.getAttribute("aria-describedby")).toContain(errorLine.id);
  });

  it("reports a picked mode and typed amount", () => {
    const props = renderFields({ priceMode: "fixed", priceText: "" });
    fireEvent.click(
      screen.getByRole("radio", { name: "Buyers name the price" }),
    );
    expect(props.onPriceModeChange).toHaveBeenCalledWith("name_your_price");
    fireEvent.change(screen.getByRole("textbox", { name: "Price in euros" }), {
      target: { value: "3,50" },
    });
    expect(props.onPriceTextChange).toHaveBeenCalledWith("3,50");
  });

  it("asks for a way to get paid first and links to Getting paid for that persona", async () => {
    const props = renderFields({ subprofileId: DEMO_ARTIST_LATE_BLOOMERS.id });
    expect(
      await screen.findByText("Add a way to get paid before you set a price"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Add a way to get paid" }),
    ).toHaveAttribute(
      "href",
      `/studio/settings?persona=${DEMO_ARTIST_LATE_BLOOMERS.id}#getting-paid`,
    );
    const fixed = screen.getByRole("radio", { name: "Fixed price" });
    expect(fixed).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(fixed);
    expect(props.onPriceModeChange).not.toHaveBeenCalled();
  });

  it("says buying opens once the release is out", () => {
    renderFields({ priceMode: "fixed", priceText: "3", isReleaseOut: false });
    expect(
      screen.getByText("Buying opens once the release is out"),
    ).toBeInTheDocument();
  });

  it("states that buyers pay the artist directly", () => {
    renderFields();
    expect(
      screen.getByText(
        "Buyers pay you directly with your ways to get paid, and you confirm each payment",
      ),
    ).toBeInTheDocument();
  });
});
