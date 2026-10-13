import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import { DirectoryCardPills } from "./DirectoryCardPills";

const BASE = DIRECTORY_PLACES[0]!;

const LATE_FRIDAY_AND_SUNDAY_HOURS: DirectoryPlace["hours"] = {
  Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
  Sun: { open: true, intervals: [{ from: "10:00", to: "14:00" }] },
};

function renderPills(
  fields: Partial<DirectoryPlace>,
  isHiddenWhenEmpty = false,
) {
  return render(
    <DirectoryCardPills
      place={{
        ...BASE,
        member: undefined,
        ownedBy: [],
        hours: undefined,
        hostsGatherings: false,
        ...fields,
      }}
      isHiddenWhenEmpty={isHiddenWhenEmpty}
    />,
    { wrapper: TestProviders },
  );
}

/** The pill rows, in order, under the pills region. */
function pillRowsOf(container: HTMLElement): Element[] {
  const region = container.querySelector("[data-preview-region='pills']");
  return region ? Array.from(region.children) : [];
}

/** What a row prints on screen: its pills and its "+N" count, in order,
 *  leaving out the line kept for screen readers alone. */
function printedTextsOf(row: Element | undefined): string[] {
  if (!row) return [];
  return Array.from(row.children)
    .filter((child) => !child.classList.contains("visuallyHidden"))
    .map((child) => child.textContent ?? "");
}

describe("DirectoryCardPills", () => {
  it("prints row one as member-run, one owned-by tag and its count, the price, then the highlights", () => {
    const { container } = renderPills({
      member: "ines",
      ownedBy: ["trans", "women", "nonbinary"],
      price: "€€",
      highlights: ["terrace", "wifi", "dog-friendly", "kid-friendly"],
    });
    const [firstRow] = pillRowsOf(container);
    expect(printedTextsOf(firstRow)).toEqual([
      "Member-run",
      "Trans-owned",
      "+2",
      "€€",
      "Terrace or outdoor seating",
      "Wi-Fi",
      "Dog-friendly",
    ]);
  });

  it("names the owned-by tags past the first for screen readers and hides the count from them", () => {
    const { container } = renderPills({
      ownedBy: ["trans", "women", "nonbinary"],
    });
    const [firstRow] = pillRowsOf(container);
    const screenReaderLine = firstRow?.querySelector(".visuallyHidden");
    expect(screenReaderLine?.textContent).toBe("Women-owned, Non-binary-owned");
    const countChip = Array.from(firstRow?.children ?? []).find(
      (child) => child.textContent === "+2",
    );
    expect(countChip?.getAttribute("aria-hidden")).toBe("true");
  });

  it("prints no count when the listing names one owned-by tag", () => {
    const { container } = renderPills({ ownedBy: ["trans"], price: "" });
    const [firstRow] = pillRowsOf(container);
    expect(printedTextsOf(firstRow)).toEqual(["Trans-owned"]);
    expect(firstRow?.querySelector(".visuallyHidden")).toBeNull();
  });

  it("puts the badges in a second row of their own, each with a hidden icon", () => {
    const { container } = renderPills({
      price: "€€",
      highlights: ["terrace"],
      cat: "food",
      hours: LATE_FRIDAY_AND_SUNDAY_HOURS,
      hostsGatherings: true,
    });
    const [firstRow, badgeRow] = pillRowsOf(container);
    expect(printedTextsOf(firstRow)).toEqual([
      "€€",
      "Terrace or outdoor seating",
    ]);
    expect(printedTextsOf(badgeRow)).toEqual(["Open late", "Open Sundays"]);
    const badgeIcons = badgeRow?.querySelectorAll("svg") ?? [];
    expect(badgeIcons).toHaveLength(2);
    badgeIcons.forEach((icon) =>
      expect(icon.getAttribute("aria-hidden")).toBe("true"),
    );
  });

  it("drops Open late when a highlight says the kitchen is open late, and the next badge takes its place", () => {
    const { container } = renderPills({
      highlights: ["kitchen-open-late"],
      cat: "food",
      hours: LATE_FRIDAY_AND_SUNDAY_HOURS,
      hostsGatherings: true,
    });
    const [, badgeRow] = pillRowsOf(container);
    expect(printedTextsOf(badgeRow)).toEqual(["Open Sundays", "Hosts events"]);
  });

  it("drops Hosts gatherings when a highlight says the place hosts events", () => {
    const { container } = renderPills({
      highlights: ["hosts-events"],
      cat: "food",
      hours: {
        Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
      },
      hostsGatherings: true,
    });
    const [, badgeRow] = pillRowsOf(container);
    expect(printedTextsOf(badgeRow)).toEqual(["Open late"]);
  });

  it("draws no second row when the card earns no badge", () => {
    const { container } = renderPills({
      price: "€€",
      highlights: ["terrace"],
      cat: "food",
      hours: {
        Mon: { open: true, intervals: [{ from: "09:00", to: "18:00" }] },
      },
    });
    const rows = pillRowsOf(container);
    expect(rows).toHaveLength(1);
    expect(printedTextsOf(rows[0])).toEqual([
      "€€",
      "Terrace or outdoor seating",
    ]);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("draws no second row when every earned badge repeats a highlight", () => {
    const { container } = renderPills({
      highlights: ["hosts-events"],
      hostsGatherings: true,
    });
    expect(pillRowsOf(container)).toHaveLength(1);
    expect(container.textContent).not.toContain("Hosts events");
  });

  it("translates Free and keeps the empty first row on the list card", () => {
    const { container } = renderPills({ price: "", highlights: [] });
    const rows = pillRowsOf(container);
    expect(rows).toHaveLength(1);
    expect(container.textContent).toBe("");
    const { container: freeContainer } = renderPills({ price: "Free" });
    expect(printedTextsOf(pillRowsOf(freeContainer)[0])).toEqual(["Free"]);
  });

  it("renders nothing on the Online tab card when there is nothing to say", () => {
    const { container } = renderPills({ price: "", highlights: [] }, true);
    expect(container.firstChild).toBeNull();
  });

  it("shows only the badge row on the Online tab card when row one is empty", () => {
    const { container } = renderPills(
      { price: "", highlights: [], online: true, hostsGatherings: true },
      true,
    );
    const rows = pillRowsOf(container);
    expect(rows).toHaveLength(1);
    expect(printedTextsOf(rows[0])).toEqual(["Hosts events"]);
  });
});
