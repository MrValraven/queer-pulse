import { beforeAll, describe, expect, it } from "vitest";
import { CAUSES, causeLabelKey, causeTint, isCause } from "./causes.data";
import { CAUSE_FILTERS } from "./volunteerPage.data";
import { catalogs, loadNamespace } from "../../shared/i18n/catalogs";

/**
 * `causes.data.ts` is the one place the volunteering cause taxonomy lives, and
 * these tests are what makes that claim hold: they assert against the shipped
 * `en` catalog rather than a fixture, so a cause added to the list without a
 * label fails here instead of rendering a raw key on a card.
 *
 * The `marketing` namespace loads lazily, so `beforeAll` swaps in the real
 * catalog (an empty placeholder stands in until its chunk resolves).
 */
let marketingCatalog = catalogs.en.marketing;
beforeAll(async () => {
  marketingCatalog = await loadNamespace("en", "marketing");
});

const labelFor = (key: string) =>
  marketingCatalog[key.replace(/^marketing:/, "")];

describe("the cause taxonomy", () => {
  it("labels every cause in the shipped en catalog", () => {
    const unlabelled = CAUSES.filter((cause) => !labelFor(cause.labelKey));
    expect(unlabelled.map((cause) => cause.value)).toEqual([]);
  });

  it("has no duplicate values", () => {
    const values = CAUSES.map((cause) => cause.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("gives every cause a tint", () => {
    for (const cause of CAUSES) {
      expect(causeTint(cause.value).bg).toBeTruthy();
      expect(causeTint(cause.value).color).toBeTruthy();
    }
  });

  it("falls back rather than throwing on a cause this build has not heard of", () => {
    // The API can ship a new cause ahead of a frontend deploy. A card renders
    // it with the fallback's tint and label instead of crashing the board.
    const unknown = "hypnotherapy" as (typeof CAUSES)[number]["value"];
    expect(causeLabelKey(unknown)).toBe(CAUSES[0]?.labelKey);
    expect(causeTint(undefined)).toEqual(CAUSES[0]?.tint);
  });

  it("tells a cause chip apart from a commitment chip", () => {
    // The board holds both kinds in one `filter` string, and `isCause` is what
    // decides whether it becomes an API `cause` param or a commitment filter.
    expect(isCause("mental_health")).toBe(true);
    expect(isCause("low")).toBe(false);
    expect(isCause("all")).toBe(false);
  });

  it("derives the board's cause chips from the same list", () => {
    // The chip row used to be a hand-kept copy. If it drifts from `CAUSES`, a
    // cause exists that nobody can filter by.
    expect(CAUSE_FILTERS.map((chip) => chip.f)).toEqual(
      CAUSES.map((cause) => cause.value),
    );
  });
});
