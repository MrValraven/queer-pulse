import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraph, VouchEdge, VouchPerson } from "./trustGraphModel";
import { compareMembers } from "./compareMembers";

function makePerson(
  id: string,
  name: string,
  extra: Partial<VouchPerson> = {},
): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name,
    pronoun: "",
    initials: name.slice(0, 2).toUpperCase(),
    tone: "amber",
    joined: "2026-01",
    joinedAt: "2026-01-01T12:00:00.000Z",
    standing: "trusted",
    sceneId: null,
    role: null,
    accountKind: "member",
    ringId: null,
    isolatedBy: [],
    joinPath: { kind: "unknown", byId: null, byName: null, at: null },
    trackRecord: { vouchesGiven: 0, laterFlaggedCount: 0 },
    activeInboundCount: 0,
    activeOutboundCount: 0,
    sceneIds: [],
    ...extra,
  };
}

function makeEdge(
  from: string,
  to: string,
  extra: Partial<VouchEdge> = {},
): VouchEdge {
  return { id: `${from}>${to}`, from, to, date: "2026-02", ...extra };
}

function buildGraph(people: VouchPerson[], edges: VouchEdge[]): TrustGraph {
  return createTrustGraph({
    people,
    peopleById: Object.fromEntries(people.map((person) => [person.id, person])),
    edges,
    scenes: [],
    sceneAnchor: {},
    tMin: ymValue("2026-01"),
    tMax: ymValue("2026-12"),
    truncated: false,
    rings: [],
    cases: [],
    openCaseCount: 0,
    platformStartedAt: "2026-01-01T00:00:00.000Z",
    newAccountWindowDays: 5,
  });
}

const people = [
  makePerson("first", "Ana", {
    joinedAt: "2026-03-01T23:30:00.000Z",
    sceneIds: ["lisbon", "porto", "braga"],
  }),
  makePerson("second", "Rui", {
    joinedAt: "2026-03-05T00:15:00.000Z",
    sceneIds: ["braga", "lisbon"],
  }),
  makePerson("zara", "Zara"),
  makePerson("bea", "Bea"),
  makePerson("kai", "Kai"),
  makePerson("lemon", "Lemon"),
];

describe("compareMembers", () => {
  it("lists active shared vouchers sorted by name", () => {
    const graph = buildGraph(people, [
      makeEdge("zara", "first"),
      makeEdge("zara", "second"),
      makeEdge("bea", "first"),
      makeEdge("second", "bea", { mutual: true }),
      makeEdge("kai", "first"),
      makeEdge("kai", "second", { withdrawn: true }),
      makeEdge("lemon", "first"),
    ]);
    const comparison = compareMembers(graph, "first", "second");
    expect(comparison.sharedVoucherIds).toEqual(["bea", "zara"]);
  });

  it("measures the join gap in whole calendar days", () => {
    const graph = buildGraph(people, []);
    const comparison = compareMembers(graph, "first", "second");
    expect(Number.isInteger(comparison.joinGapDays)).toBe(true);
    expect(comparison.joinGapDays).toBe(4);
    expect(compareMembers(graph, "second", "first").joinGapDays).toBe(4);
    expect(compareMembers(graph, "zara", "bea").joinGapDays).toBe(0);
  });

  it("keeps shared scenes in the first member's order", () => {
    const graph = buildGraph(people, []);
    expect(compareMembers(graph, "first", "second").sharedSceneIds).toEqual([
      "lisbon",
      "braga",
    ]);
  });
});
