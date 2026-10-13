import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { useListingForm } from "../useListingForm";
import { LanguagesField } from "./LanguagesField";
import { moreLanguageMatches } from "./languagesField.data";

function Harness() {
  const form = useListingForm();
  return <LanguagesField form={form} />;
}

describe("LanguagesField", () => {
  it("toggles a common language chip", () => {
    render(<Harness />, { wrapper: TestProviders });
    const portuguese = screen.getByRole("button", { name: "Português" });
    expect(portuguese).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(portuguese);
    expect(portuguese).toHaveAttribute("aria-pressed", "true");
  });

  it("finds a language behind More languages by its English name", () => {
    render(<Harness />, { wrapper: TestProviders });
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search languages" }),
      {
        target: { value: "ukrainian" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Українська" }));
    expect(screen.getByRole("button", { name: "Українська" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("searchbox", { name: "Search languages" }),
    ).toHaveValue("");
  });

  it("keeps what the owner writes under Anything else", () => {
    render(<Harness />, { wrapper: TestProviders });
    const other = screen.getByRole("textbox", { name: "Anything else?" });
    fireEvent.change(other, { target: { value: "Galego" } });
    expect(other).toHaveValue("Galego");
  });
});

describe("moreLanguageMatches", () => {
  const t = (key: string) => key;
  it("matches unpicked codes outside the common five, and nothing for a blank query", () => {
    expect(moreLanguageMatches("  ", [], t)).toEqual([]);
    expect(moreLanguageMatches("portug", [], t)).toEqual(["lgp"]);
    expect(moreLanguageMatches("ital", ["it"], t)).toEqual([]);
  });
});
