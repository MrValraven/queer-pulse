import { describe, expect, it } from "vitest";
import { catalogs } from "./index";
import type { Namespace } from "../types";

const namespaces = Object.keys(catalogs.en) as Namespace[];

describe("catalog parity", () => {
  it.each(namespaces)(
    "pt/%s declares exactly the keys en/%s declares",
    (namespace) => {
      const enKeys = Object.keys(catalogs.en[namespace]).sort();
      const ptKeys = Object.keys(catalogs.pt[namespace]).sort();
      expect(ptKeys).toEqual(enKeys);
    },
  );

  it.each(namespaces)("pt/%s has no empty values", (namespace) => {
    const blank = Object.entries(catalogs.pt[namespace])
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });
});
