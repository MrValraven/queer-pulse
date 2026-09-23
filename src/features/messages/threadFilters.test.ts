import { describe, expect, it } from "vitest";
import type { Conversation } from "./data";
import { filterThreadsByTab } from "./threadFilters";

const row = (id: string, claimedBy: Conversation["claimedBy"]) =>
  ({ id, unread: false, claimedBy }) as Conversation;
const threads = [
  row("free", null),
  row("mine", { handle: "tiago", name: "Tiago Costa", firstName: "Tiago" }),
  row("rui", { handle: "rui", name: "Rui Marçal", firstName: "Rui" }),
];

describe("filterThreadsByTab in a business mailbox", () => {
  it("lists only unclaimed threads under Unclaimed", () => {
    expect(
      filterThreadsByTab(threads, "unclaimed", "", new Set(), "tiago").map(
        (thread) => thread.id,
      ),
    ).toEqual(["free"]);
  });

  it("lists only the member's own claims under Mine", () => {
    expect(
      filterThreadsByTab(threads, "mine", "", new Set(), "tiago").map(
        (thread) => thread.id,
      ),
    ).toEqual(["mine"]);
  });

  it("keeps an archived claim out of both", () => {
    const archived = [
      { ...threads[1]!, archivedAt: "2026-09-20T00:00:00.000Z" },
    ];
    expect(
      filterThreadsByTab(archived, "mine", "", new Set(), "tiago"),
    ).toEqual([]);
  });
});
