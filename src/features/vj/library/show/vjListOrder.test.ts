import { describe, expect, it } from "vitest";
import { orderVjItemsByIds, vjOrderKeyOf } from "./vjListOrder";

interface Row {
  id: string;
  name: string;
}

const idOf = (row: Row) => row.id;
const rowsOf = (...ids: string[]): Row[] =>
  ids.map((rowId) => ({ id: rowId, name: `Row ${rowId}` }));

describe("orderVjItemsByIds", () => {
  it("keeps the local order", () => {
    const rows = rowsOf("a", "b", "c");
    const ordered = orderVjItemsByIds(rows, ["c", "a", "b"], idOf);
    expect(ordered.map(idOf)).toEqual(["c", "a", "b"]);
    // The objects are the server's own, so a fresh name shows at once.
    expect(ordered[0]).toBe(rows[2]);
  });

  it("puts new ids last and drops ids that left", () => {
    const rows = rowsOf("a", "b", "d");
    const ordered = orderVjItemsByIds(rows, ["b", "c", "a"], idOf);
    expect(ordered.map(idOf)).toEqual(["b", "a", "d"]);
  });

  it("an empty local order is the server order", () => {
    const rows = rowsOf("a", "b", "c");
    const fromNull = orderVjItemsByIds(rows, null, idOf);
    expect(fromNull.map(idOf)).toEqual(["a", "b", "c"]);
    expect(fromNull).not.toBe(rows);
    expect(orderVjItemsByIds(rows, [], idOf).map(idOf)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("vjOrderKeyOf", () => {
  it("gives equal keys for equal orders and different keys otherwise", () => {
    expect(vjOrderKeyOf(["a", "b"])).toBe(vjOrderKeyOf(["a", "b"]));
    expect(vjOrderKeyOf(["a", "b"])).not.toBe(vjOrderKeyOf(["b", "a"]));
  });
});
