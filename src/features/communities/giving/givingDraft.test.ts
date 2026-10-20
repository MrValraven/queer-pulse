import { describe, expect, it } from "vitest";
import type { CommunityGivingDTO } from "../api/communityGiving.api";
import {
  draftFromGiving,
  draftToBody,
  emptyGivingDraftRow,
  isGivingDraftDirty,
  validateGivingDraft,
  type GivingDraft,
} from "./givingDraft";

describe("givingDraft", () => {
  it("blocks a blank row from saving", () => {
    const blank: GivingDraft = {
      intro: "",
      rows: [{ ...emptyGivingDraftRow() }],
    };
    expect(validateGivingDraft(blank).hasErrors).toBe(true);
    expect(draftToBody(blank)).toBeNull();
  });

  it("trims text fields and sends normalized values", () => {
    const filled: GivingDraft = {
      intro: "  For rent  ",
      rows: [
        {
          draftId: "a",
          kind: "mbway",
          value: "+351 912 345 678",
          label: " ",
          note: "",
        },
      ],
    };
    expect(draftToBody(filled)).toEqual({
      intro: "For rent",
      methods: [{ kind: "mbway", label: null, value: "912345678", note: null }],
    });
  });

  it("sends an IBAN compact and a scheme-less link with https", () => {
    const filled: GivingDraft = {
      intro: "",
      rows: [
        {
          draftId: "c",
          kind: "iban",
          value: "pt50 0002 0123 1234 5678 9015 4",
          label: "",
          note: "",
        },
        {
          draftId: "d",
          kind: "link",
          value: "ko-fi.com/runners",
          label: "",
          note: "",
        },
      ],
    };
    expect(draftToBody(filled)?.methods.map((method) => method.value)).toEqual([
      "PT50000201231234567890154",
      "https://ko-fi.com/runners",
    ]);
  });

  it("allows saving zero rows to clear the section", () => {
    expect(draftToBody({ intro: "", rows: [] })).toEqual({
      intro: null,
      methods: [],
    });
  });

  it("flags text over its limit", () => {
    expect(
      validateGivingDraft({ intro: "x".repeat(401), rows: [] }).intro,
    ).toBe("tooLong");
    expect(
      validateGivingDraft({
        intro: "",
        rows: [
          {
            draftId: "b",
            kind: "link",
            value: "https://ko-fi.com/a",
            label: "x".repeat(61),
            note: "",
          },
        ],
      }).rows.b?.label,
    ).toBe("tooLong");
  });

  it("starts from the stored section and reads clean until something changes", () => {
    const giving: CommunityGivingDTO = {
      intro: "Rent",
      methods: [
        {
          id: "m1",
          kind: "mbway",
          label: null,
          value: "912345678",
          note: null,
          position: 0,
        },
      ],
      updatedAt: "2026-10-01T10:00:00.000Z",
    };
    const initial = draftFromGiving(giving);
    expect(initial.rows[0]?.value).toBe("912 345 678");
    const copy: GivingDraft = {
      intro: initial.intro,
      rows: initial.rows.map((row) => ({
        ...row,
        draftId: `${row.draftId}-copy`,
      })),
    };
    expect(isGivingDraftDirty(copy, initial)).toBe(false);
    expect(
      isGivingDraftDirty({ ...copy, intro: "Rent and snacks" }, initial),
    ).toBe(true);
  });

  it("starts an empty section with one blank row", () => {
    expect(draftFromGiving(null).rows).toHaveLength(1);
  });
});
