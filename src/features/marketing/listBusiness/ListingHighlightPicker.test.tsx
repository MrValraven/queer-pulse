import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { ListingHighlightPicker } from "./ListingHighlightPicker";
import { useListingForm } from "./useListingForm";

function Harness({ initial }: { initial: ListingDraft }) {
  const form = useListingForm(initial);
  return <ListingHighlightPicker form={form} />;
}

function draftWith(attributes: string[], highlights: string[]): ListingDraft {
  return { ...blankDraft(), attributes, highlights };
}

describe("ListingHighlightPicker", () => {
  it("keeps a chip past the cap focusable, and pressing it changes nothing", () => {
    render(
      <Harness
        initial={draftWith(
          ["terrace", "wifi", "laptop-friendly", "dog-friendly"],
          ["terrace", "wifi", "laptop-friendly"],
        )}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    const capped = screen.getByRole("button", { name: "Dog-friendly" });
    expect(capped).toHaveAttribute("aria-disabled", "true");
    expect(capped).not.toBeDisabled();
    capped.focus();
    expect(capped).toHaveFocus();
    fireEvent.click(capped);
    expect(capped).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
  });

  it("lets a picked chip at the cap be unpicked", () => {
    render(
      <Harness
        initial={draftWith(
          ["terrace", "wifi", "laptop-friendly", "dog-friendly"],
          ["terrace", "wifi", "laptop-friendly"],
        )}
      />,
      { wrapper: TestProviders },
    );
    const wifi = screen.getByRole("button", { name: "Wi-Fi" });
    expect(wifi).not.toHaveAttribute("aria-disabled");
    fireEvent.click(wifi);
    expect(wifi).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dog-friendly" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("counts a stored sensitive highlight as nothing and shows no chip for it", () => {
    render(
      <Harness
        initial={draftWith(
          ["terrace", "sexual-health-prep"],
          ["sexual-health-prep"],
        )}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("0 of 3")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sexual health and PrEP" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Terrace or outdoor seating" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves an attribute outside the offer out of a new draft's highlights", () => {
    // Vegan options belongs to Food & drink, which this draft no longer picks.
    render(
      <Harness
        initial={draftWith(["terrace", "vegan-options"], ["vegan-options"])}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("0 of 3")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Vegan options" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Terrace or outdoor seating" }),
    ).toBeInTheDocument();
  });

  it("keeps a carried attribute a highlight while editing a listing", () => {
    render(
      <Harness
        initial={{
          ...draftWith(["terrace", "vegan-options"], ["vegan-options"]),
          managementRole: "owner",
        }}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Vegan options" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
