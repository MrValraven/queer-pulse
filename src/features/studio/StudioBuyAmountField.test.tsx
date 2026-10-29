import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioPriceView } from "./api/studioPurchases.adapters";
import { StudioBuyAmountField } from "./StudioBuyAmountField";

// The studio catalog loads lazily, so the first query of each test waits.

interface FieldOptions {
  price: StudioPriceView;
  valueText?: string;
  errorKey?: string | null;
}

function renderField(options: FieldOptions, language: "en" | "pt" = "en") {
  window.localStorage.setItem("qp.lang", language);
  render(
    <TestProviders>
      <StudioBuyAmountField
        price={options.price}
        valueText={options.valueText ?? String(options.price.amountCents / 100)}
        onValueTextChange={vi.fn()}
        errorKey={options.errorKey ?? null}
        isDisabled={false}
      />
    </TestProviders>,
  );
}

describe("StudioBuyAmountField", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("shows a fixed price read-only", async () => {
    renderField({ price: { mode: "fixed", amountCents: 300 } });
    expect(await screen.findByText("€3")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(
      screen.queryByRole("group", { name: "Suggested amounts" }),
    ).toBeNull();
  });

  it("offers the minimum and two higher amounts as pressed buttons", async () => {
    renderField({
      price: { mode: "name_your_price", amountCents: 0 },
      valueText: "0",
    });
    const group = await screen.findByRole("group", {
      name: "Suggested amounts",
    });
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["€0", "€1", "€2"]);
    expect(within(group).getByRole("button", { name: "€0" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(group).getByRole("button", { name: "€1" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("names the range under the input", async () => {
    renderField({
      price: { mode: "name_your_price", amountCents: 300 },
      valueText: "3",
    });
    const input = await screen.findByRole("textbox", {
      name: "Your amount in euros",
    });
    expect(input).toHaveAccessibleDescription("€3 or more, up to €500");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("reads a PT decimal comma and names a refused amount", async () => {
    renderField(
      {
        price: { mode: "name_your_price", amountCents: 300 },
        valueText: "2,50",
        errorKey: "studio:errors.reason.studio_purchase_amount_below_minimum",
      },
      "pt",
    );
    const input = await screen.findByRole("textbox", {
      name: "O teu valor em euros",
    });
    expect(input).toHaveValue("2,50");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("O valor está abaixo do mínimo definido"),
    ).toBeInTheDocument();
  });
});
