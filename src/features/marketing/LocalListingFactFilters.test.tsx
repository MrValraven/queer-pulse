import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  countListingFactChips,
  NO_LISTING_FACT_FILTERS,
  UNKNOWN_LISTING_FACT_COUNTS,
  type DirectoryListingFactFilters,
} from "./directoryListingFactFilters";
import { LocalListingFactFilters } from "./LocalListingFactFilters";
import { LocalMoreFilters } from "./LocalMoreFilters";
import { awaitCatalog } from "../../test/awaitCatalog";

async function renderFilters({
  isOnlineScope = false,
  count = 1,
  countWith,
  areCountsKnown = true,
  listingFacts = NO_LISTING_FACT_FILTERS,
}: {
  isOnlineScope?: boolean;
  count?: number;
  /** How many places a chip would leave, given the filters it would set.
   *  Overrides `count`. */
  countWith?: (filters: DirectoryListingFactFilters) => number;
  /** False draws the filters with every count not known yet. */
  areCountsKnown?: boolean;
  listingFacts?: typeof NO_LISTING_FACT_FILTERS;
} = {}) {
  const onToggle = vi.fn();
  render(
    <LocalListingFactFilters
      listingFacts={listingFacts}
      onToggleListingFact={onToggle}
      counts={
        areCountsKnown
          ? countListingFactChips(countWith ?? (() => count), listingFacts, [])
          : UNKNOWN_LISTING_FACT_COUNTS
      }
      isOnlineScope={isOnlineScope}
    />,
    { wrapper: TestProviders },
  );
  await awaitCatalog("marketing");
  return onToggle;
}

describe("LocalListingFactFilters", () => {
  it("offers the way in, ways to pay, languages and practices on the List tab", async () => {
    await renderFilters();
    expect(
      screen.getByRole("radiogroup", { name: "How to get in" }),
    ).toBeInTheDocument();
    for (const legend of ["Ways to pay", "Languages", "Inclusion practices"]) {
      expect(screen.getByRole("group", { name: legend })).toBeInTheDocument();
    }
  });

  it("offers the ways in as radios with the chosen one checked", async () => {
    await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, entryMode: "membersOnly" },
    });
    const group = screen.getByRole("radiogroup", { name: "How to get in" });
    const radios = within(group).getAllByRole("radio");
    const wayInLabels = [
      "Walk in anytime",
      "Booking recommended",
      "By appointment only",
      "Members only",
    ];
    // Each chip also prints its count, hidden from its accessible name.
    expect(radios).toHaveLength(wayInLabels.length);
    radios.forEach((radio, index) =>
      expect(radio).toHaveAccessibleName(wayInLabels[index]),
    );
    const membersOnly = screen.getByRole("radio", { name: "Members only" });
    expect(membersOnly).toHaveAttribute("aria-checked", "true");
    expect(membersOnly).not.toHaveAttribute("aria-pressed");
    expect(membersOnly).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("radio", { name: "Walk in anytime" }),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("clears the way in when the checked radio is pressed again", async () => {
    const onToggle = await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, entryMode: "walkIn" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Walk in anytime" }));
    expect(onToggle).toHaveBeenCalledWith({
      kind: "entryMode",
      mode: "walkIn",
    });
  });

  it("moves the way in with the arrow keys, wrapping at the ends", async () => {
    const onToggle = await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, entryMode: "walkIn" },
    });
    const walkIn = screen.getByRole("radio", { name: "Walk in anytime" });
    fireEvent.keyDown(walkIn, { key: "ArrowRight" });
    expect(onToggle).toHaveBeenLastCalledWith({
      kind: "entryMode",
      mode: "bookingRecommended",
    });
    expect(
      screen.getByRole("radio", { name: "Booking recommended" }),
    ).toHaveFocus();
    fireEvent.keyDown(walkIn, { key: "ArrowLeft" });
    expect(onToggle).toHaveBeenLastCalledWith({
      kind: "entryMode",
      mode: "membersOnly",
    });
  });

  it("leaves Space on the checked radio to the click that clears it", async () => {
    const onToggle = await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, entryMode: "walkIn" },
    });
    fireEvent.keyDown(screen.getByRole("radio", { name: "Walk in anytime" }), {
      key: " ",
    });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("skips an unpickable way in with the arrow keys", async () => {
    const onToggle = await renderFilters({
      countWith: (filters) =>
        filters.entryMode === "bookingRecommended" ? 0 : 1,
    });
    const booking = screen.getByRole("radio", { name: "Booking recommended" });
    expect(booking).toBeDisabled();
    expect(booking).toHaveAttribute("tabindex", "-1");
    const walkIn = screen.getByRole("radio", { name: "Walk in anytime" });
    expect(walkIn).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(walkIn, { key: "ArrowRight" });
    expect(onToggle).toHaveBeenCalledWith({
      kind: "entryMode",
      mode: "appointmentOnly",
    });
  });

  it("leaves the way in and the ways to pay out of the Online tab", async () => {
    await renderFilters({ isOnlineScope: true });
    expect(screen.queryByRole("group", { name: "How to get in" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Ways to pay" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Harm reduction available" }),
    ).toBeNull();
  });

  it("keeps a chosen practice the Online tab does not offer, so it can be turned off", async () => {
    await renderFilters({
      isOnlineScope: true,
      listingFacts: {
        ...NO_LISTING_FACT_FILTERS,
        practices: ["harm-reduction"],
      },
    });
    expect(
      screen.getByRole("button", { name: "Harm reduction available" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("sends the chip's own change", async () => {
    const onToggle = await renderFilters();
    fireEvent.click(screen.getByRole("button", { name: "MB WAY" }));
    expect(onToggle).toHaveBeenCalledWith({ kind: "payment", method: "mbway" });
  });

  it("disables a narrowing chip at zero once loaded and keeps another language pickable", async () => {
    // MB WAY leaves no place; English counts the places that speak it.
    await renderFilters({
      countWith: (filters) => (filters.payments.includes("mbway") ? 0 : 2),
      listingFacts: { ...NO_LISTING_FACT_FILTERS, languages: ["pt"] },
    });
    expect(screen.getByRole("button", { name: "MB WAY" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "English" })).toBeEnabled();
  });

  it("keeps the uncommon languages hidden after a language is picked", async () => {
    await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, languages: ["pt"] },
    });
    expect(screen.queryByRole("button", { name: "Italiano" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show more languages" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("reveals the other languages from Show more languages", async () => {
    await renderFilters();
    fireEvent.click(
      screen.getByRole("button", { name: "Show more languages" }),
    );
    expect(
      screen.getByRole("button", { name: "Italiano" }),
    ).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Show fewer languages" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls");
    expect(
      document.getElementById(toggle.getAttribute("aria-controls")!),
    ).toContainElement(screen.getByRole("button", { name: "Italiano" }));
  });

  it("keeps a picked uncommon language in view while the others are hidden", async () => {
    await renderFilters({
      listingFacts: { ...NO_LISTING_FACT_FILTERS, languages: ["uk"] },
    });
    expect(screen.getByRole("button", { name: "Українська" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("button", { name: "Italiano" })).toBeNull();
  });

  it("keeps every chip pickable while its count is not known yet", async () => {
    await renderFilters({ areCountsKnown: false });
    expect(screen.getByRole("button", { name: "MB WAY" })).toBeEnabled();
  });
});

describe("LocalMoreFilters", () => {
  it("lists the chosen category's attributes first, then Around the place and Pricing", async () => {
    render(
      <LocalMoreFilters
        listingFacts={NO_LISTING_FACT_FILTERS}
        onToggleListingFact={vi.fn()}
        counts={countListingFactChips(() => 1, NO_LISTING_FACT_FILTERS, [])}
        isOnlineScope={false}
        categories={["health"]}
      />,
      { wrapper: TestProviders },
    );
    await awaitCatalog("marketing");
    fireEvent.click(screen.getByRole("button", { name: "Show more filters" }));
    const [care, around, pricing] = ["Care", "Around the place", "Pricing"].map(
      (heading) => screen.getByText(heading),
    );
    expect(care!.compareDocumentPosition(around!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(around!.compareDocumentPosition(pricing!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      screen.queryByRole("button", { name: "Sexual health and PrEP" }),
    ).toBeNull();
  });

  it("opens on its own when an attribute filter arrives later, and stays open after it goes", async () => {
    const props = {
      onToggleListingFact: vi.fn(),
      counts: countListingFactChips(() => 1, NO_LISTING_FACT_FILTERS, []),
      isOnlineScope: false,
      categories: [],
    };
    const { rerender } = render(
      <LocalMoreFilters listingFacts={NO_LISTING_FACT_FILTERS} {...props} />,
      { wrapper: TestProviders },
    );
    await awaitCatalog("marketing");
    expect(
      screen.getByRole("button", { name: "Show more filters" }),
    ).toHaveAttribute("aria-expanded", "false");
    rerender(
      <LocalMoreFilters
        listingFacts={{ ...NO_LISTING_FACT_FILTERS, attributes: ["wifi"] }}
        {...props}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Hide more filters" }),
    ).toHaveAttribute("aria-expanded", "true");
    rerender(
      <LocalMoreFilters listingFacts={NO_LISTING_FACT_FILTERS} {...props} />,
    );
    expect(
      screen.getByRole("button", { name: "Hide more filters" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("opens on its own when an attribute filter is already on", async () => {
    render(
      <LocalMoreFilters
        listingFacts={{ ...NO_LISTING_FACT_FILTERS, attributes: ["wifi"] }}
        onToggleListingFact={vi.fn()}
        counts={countListingFactChips(() => 1, NO_LISTING_FACT_FILTERS, [])}
        isOnlineScope={false}
        categories={[]}
      />,
      { wrapper: TestProviders },
    );
    await awaitCatalog("marketing");
    expect(
      screen.getByRole("button", { name: "Hide more filters" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
