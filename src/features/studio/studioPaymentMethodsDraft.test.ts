import { describe, expect, it } from "vitest";
import type { StudioPaymentMethodsView } from "./api/studioPurchases.adapters";
import { givingDraftOf, replaceBodyOf } from "./studioPaymentMethodsDraft";

function viewOf(
  methods: StudioPaymentMethodsView["methods"],
): StudioPaymentMethodsView {
  return { methods, hasItemsForSale: false, updatedAt: null };
}

describe("givingDraftOf", () => {
  it("reads an MB WAY number as its grouped display", () => {
    const draft = givingDraftOf(
      viewOf([
        {
          id: "method-1",
          kind: "mbway",
          label: null,
          value: "912345678",
          note: null,
        },
      ]),
    );
    expect(draft.intro).toBe("");
    expect(draft.rows).toHaveLength(1);
    expect(draft.rows[0]).toMatchObject({
      kind: "mbway",
      value: "912 345 678",
      label: "",
      note: "",
    });
  });

  it("keeps the stored order of the rows", () => {
    const draft = givingDraftOf(
      viewOf([
        {
          id: "a",
          kind: "link",
          label: "Ko-fi",
          value: "https://ko-fi.com/a",
          note: null,
        },
        {
          id: "b",
          kind: "mbway",
          label: null,
          value: "913456789",
          note: "Fast",
        },
      ]),
    );
    expect(draft.rows.map((row) => row.kind)).toEqual(["link", "mbway"]);
    expect(draft.rows[0]?.label).toBe("Ko-fi");
    expect(draft.rows[1]?.note).toBe("Fast");
  });

  it("starts with one blank row when nothing is stored", () => {
    expect(givingDraftOf(viewOf([])).rows).toHaveLength(1);
    expect(givingDraftOf(null).rows[0]).toMatchObject({
      kind: "link",
      value: "",
    });
  });
});

describe("replaceBodyOf", () => {
  it("turns the grouped MB WAY display back into its canonical body", () => {
    const draft = givingDraftOf(
      viewOf([
        {
          id: "method-1",
          kind: "mbway",
          label: null,
          value: "912345678",
          note: null,
        },
      ]),
    );
    expect(replaceBodyOf(draft)).toEqual({
      methods: [{ kind: "mbway", value: "912345678", label: null, note: null }],
    });
  });

  it("is null while an IBAN fails its check digits", () => {
    const draft = givingDraftOf(null);
    draft.rows = [
      {
        draftId: "bad-iban",
        kind: "iban",
        value: "PT50 0002 0123 1234 5678 9015 5",
        label: "",
        note: "",
      },
    ];
    expect(replaceBodyOf(draft)).toBeNull();
  });

  it("is null while a row is blank", () => {
    expect(replaceBodyOf(givingDraftOf(null))).toBeNull();
  });

  it("sends an empty list for a draft with no rows", () => {
    expect(replaceBodyOf({ intro: "", rows: [] })).toEqual({ methods: [] });
  });
});
