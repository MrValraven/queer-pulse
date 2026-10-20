import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraph, VouchEdge, VouchPerson } from "./trustGraphModel";
import { findSecondHopParent, groupEgoRelations } from "./egoRelation";

function makePerson(id: string, name: string): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name,
    pronoun: "",
    initials: name.slice(0, 2).toUpperCase(),
    tone: "violet",
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
  };
}

function makeEdge(
  from: string,
  to: string,
  extra: Partial<VouchEdge> = {},
): VouchEdge {
  return { id: `${from}>${to}`, from, to, date: "2026-02", ...extra };
}

const NAMES: Record<string, string> = {
  focus: "Inês",
  mutualFriend: "Mara",
  voucherIn: "Bea",
  voucheeOut: "Caio",
  invitee: "Duda",
  withdrawn: "Ezra",
  secondHop: "Flor",
};

const edges: VouchEdge[] = [
  makeEdge("focus", "mutualFriend", { mutual: true }),
  makeEdge("voucherIn", "focus"),
  makeEdge("focus", "voucheeOut"),
  makeEdge("focus", "invitee", { kind: "invite" }),
  makeEdge("focus", "withdrawn", { withdrawn: true }),
  makeEdge("mutualFriend", "secondHop"),
  makeEdge("secondHop", "voucherIn"),
];

function buildGraph(): TrustGraph {
  const people = Object.entries(NAMES).map(([id, name]) =>
    makePerson(id, name),
  );
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

describe("groupEgoRelations", () => {
  it("classifies each visible member by its direct edges with the focus", () => {
    const graph = buildGraph();
    const relations = groupEgoRelations(
      graph,
      "focus",
      [...Object.keys(NAMES), "bubble:focus"],
      edges,
    );
    expect(relations.has("focus")).toBe(false);
    expect(relations.has("bubble:focus")).toBe(false);
    expect(Object.fromEntries(relations)).toEqual({
      mutualFriend: "mutual",
      voucherIn: "vouchedBy",
      voucheeOut: "vouchedFor",
      invitee: "invited",
      withdrawn: "withdrawnOnly",
      secondHop: "secondHop",
    });
  });

  it("only reads the visible edges it is given", () => {
    const graph = buildGraph();
    const relations = groupEgoRelations(graph, "focus", ["voucherIn"], []);
    expect(relations.get("voucherIn")).toBe("secondHop");
  });
});

describe("findSecondHopParent", () => {
  it("picks the alphabetically first direct neighbour linked to the member", () => {
    const graph = buildGraph();
    const relations = groupEgoRelations(
      graph,
      "focus",
      Object.keys(NAMES),
      edges,
    );
    const nameFor = (personId: string): string => NAMES[personId] ?? personId;
    // Linked to Mara (mutual) and Bea (vouchedBy); Bea sorts first.
    expect(
      findSecondHopParent("focus", "secondHop", edges, relations, nameFor),
    ).toBe("voucherIn");
    expect(
      findSecondHopParent("focus", "invitee", [], relations, nameFor),
    ).toBeNull();
  });
});
