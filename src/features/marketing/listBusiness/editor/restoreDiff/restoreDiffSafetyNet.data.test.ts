import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../../../shared/i18n/types";
import {
  fallbackFieldChange,
  isVisibleFieldChange,
} from "./restoreDiffSafetyNet.data";

/** Hands back the key, so assertions can name exactly which copy was used. */
const t: TFunction = (key) => key;
const DIFF_PREFIX = "marketing:listBusiness.editor.restore.diff";

describe("isVisibleFieldChange", () => {
  it("sees a text entry only when some words differ", () => {
    const base = { kind: "text" as const, key: "name", labelKey: "label" };
    expect(
      isVisibleFieldChange({
        ...base,
        segments: [{ kind: "same", text: "Rosa" }],
      }),
    ).toBe(false);
    expect(
      isVisibleFieldChange({
        ...base,
        segments: [{ kind: "added", text: "Rosa" }],
      }),
    ).toBe(true);
  });

  it("treats a spacing-only mark as nothing to see", () => {
    expect(
      isVisibleFieldChange({
        kind: "text",
        key: "name",
        labelKey: "label",
        segments: [
          { kind: "same", text: "Livraria" },
          { kind: "added", text: " " },
          { kind: "same", text: " Rosa" },
        ],
      }),
    ).toBe(false);
  });

  it("sees paragraphs only when one of them marks real text", () => {
    const paragraphsWith = (text: string) => ({
      kind: "paragraphs" as const,
      key: "whatItIs",
      labelKey: "label",
      paragraphs: [
        {
          key: "paragraph-1",
          status: "added" as const,
          position: 1,
          segments: [{ kind: "added" as const, text }],
        },
      ],
    });
    expect(isVisibleFieldChange(paragraphsWith("  "))).toBe(false);
    expect(isVisibleFieldChange(paragraphsWith("Open late"))).toBe(true);
  });

  it("sees a choice only when its two sides read differently", () => {
    const base = { kind: "choice" as const, key: "price", labelKey: "label" };
    expect(isVisibleFieldChange({ ...base, before: "€", after: "€" })).toBe(
      false,
    );
    expect(isVisibleFieldChange({ ...base, before: "€", after: "€€" })).toBe(
      true,
    );
  });

  it("sees sets, paragraphs and rows only when they hold something", () => {
    expect(
      isVisibleFieldChange({
        kind: "set",
        key: "tags",
        labelKey: "label",
        added: [],
        removed: [],
      }),
    ).toBe(false);
    expect(
      isVisibleFieldChange({
        kind: "paragraphs",
        key: "whatItIs",
        labelKey: "label",
        paragraphs: [],
      }),
    ).toBe(false);
    expect(
      isVisibleFieldChange({
        kind: "rows",
        key: "hours",
        labelKey: "label",
        rows: [],
      }),
    ).toBe(false);
  });
});

describe("fallbackFieldChange", () => {
  it("shows two differing plain values as a choice", () => {
    expect(
      fallbackFieldChange({
        t,
        key: "online",
        labelKey: "label",
        before: false,
        after: true,
      }),
    ).toEqual({
      kind: "choice",
      key: "online",
      labelKey: "label",
      before: `${DIFF_PREFIX}.value.no`,
      after: `${DIFF_PREFIX}.value.yes`,
    });
  });

  it("joins string lists in their stored order", () => {
    const change = fallbackFieldChange({
      t,
      key: "tags",
      labelKey: "label",
      before: ["books", "tea"],
      after: ["tea", "books"],
    });
    expect(change).toMatchObject({
      kind: "choice",
      before: "books, tea",
      after: "tea, books",
    });
  });

  it("says the details differ when the values cannot be read out", () => {
    expect(
      fallbackFieldChange({
        t,
        key: "photos",
        labelKey: "label",
        before: { wide: "a" },
        after: { wide: "b" },
      }),
    ).toEqual({
      kind: "rows",
      key: "photos",
      labelKey: "label",
      rows: [
        {
          key: "photos.changed",
          status: "changed",
          label: `${DIFF_PREFIX}.row.otherChange`,
          before: `${DIFF_PREFIX}.value.onScreen`,
          after: `${DIFF_PREFIX}.value.savedCopy`,
        },
      ],
    });
  });

  it("says the details differ when two plain values read the same", () => {
    const change = fallbackFieldChange({ t, key: "name", labelKey: "label" });
    expect(change.kind).toBe("rows");
  });
});
