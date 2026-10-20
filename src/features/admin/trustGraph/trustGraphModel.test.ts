import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraphData, TrustRing, VouchPerson } from "./trustGraphModel";

function makePerson(
  overrides: Partial<VouchPerson> & Pick<VouchPerson, "id">,
): VouchPerson {
  return {
    userId: `u-${overrides.id}`,
    name: overrides.id.toUpperCase(),
    pronoun: "",
    initials: overrides.id.toUpperCase(),
    tone: "jade",
    joined: "2024-01",
    standing: "trusted",
    sceneId: null,
    role: null,
    joinedAt: "2024-01-01T00:00:00.000Z",
    accountKind: "member",
    ringId: null,
    isolatedBy: [],
    joinPath: { kind: "unknown", byId: null, byName: null, at: null },
    trackRecord: { vouchesGiven: 0, laterFlaggedCount: 0 },
    activeInboundCount: 0,
    activeOutboundCount: 0,
    sceneIds: [],
    ...overrides,
  };
}

const RING: TrustRing = {
  id: "ring:b",
  memberIds: ["b", "c"],
  memberCount: 2,
  firstJoinedAt: "2024-02-01T00:00:00.000Z",
  lastJoinedAt: "2024-03-01T00:00:00.000Z",
  sharedVouchers: [{ id: "a", name: "A" }],
};

const data: TrustGraphData = {
  people: [
    makePerson({ id: "a", accountKind: "founder" }),
    makePerson({
      id: "b",
      tone: "plum",
      joined: "2024-02",
      joinedAt: "2024-02-01T00:00:00.000Z",
      standing: "new",
      ringId: "ring:b",
    }),
    makePerson({
      id: "c",
      tone: "coral",
      joined: "2024-03",
      joinedAt: "2024-03-01T00:00:00.000Z",
      standing: "new",
      ringId: "ring:b",
      isolatedBy: [{ id: "b", name: "B", reason: "ring" }],
    }),
    makePerson({ id: "d", standing: "new" }),
    makePerson({ id: "e", standing: "new" }),
  ],
  peopleById: {},
  edges: [
    { id: "a>b", from: "a", to: "b", date: "2024-02" },
    { id: "b>c", from: "b", to: "c", date: "2024-03" },
    { id: "d>c", from: "d", to: "c", date: "2024-03", withdrawn: true },
    { id: "a>d", from: "a", to: "d", date: "2024-03" },
    { id: "d>e", from: "d", to: "e", date: "2024-03" },
  ],
  scenes: [],
  sceneAnchor: {},
  tMin: ymValue("2024-01"),
  tMax: ymValue("2024-03"),
  truncated: false,
  rings: [RING],
  cases: [],
  openCaseCount: 0,
  platformStartedAt: "2024-01-01T00:00:00.000Z",
  newAccountWindowDays: 30,
};
data.peopleById = Object.fromEntries(
  data.people.map((person) => [person.id, person]),
);

describe("createTrustGraph", () => {
  it("neighbors returns adjacent nodes both directions", () => {
    const graph = createTrustGraph(data);
    expect(graph.neighbors("b").sort()).toEqual(["a", "c"]);
  });
  it("neighbors skips withdrawn edges unless asked", () => {
    const graph = createTrustGraph(data);
    expect(graph.neighbors("c")).toEqual(["b"]);
    expect(graph.neighbors("c", true).sort()).toEqual(["b", "d"]);
  });
  it("shortestPath walks the trust chain", () => {
    const graph = createTrustGraph(data);
    expect(graph.shortestPath("a", "c")).toEqual(["a", "b", "c"]);
  });
  it("findEdge answers in either direction", () => {
    const graph = createTrustGraph(data);
    expect(graph.findEdge("c", "b")?.id).toBe("b>c");
    expect(graph.findEdge("b", "c")?.id).toBe("b>c");
    expect(graph.findEdge("a", "c")).toBeUndefined();
  });
  it("incidentEdges lists every edge touching a node, withdrawn included", () => {
    const graph = createTrustGraph(data);
    expect(graph.incidentEdges("c").map((edge) => edge.id)).toEqual([
      "b>c",
      "d>c",
    ]);
    expect(graph.incidentEdges("nobody")).toEqual([]);
  });
  it("activeInboundEdges keeps only active edges pointing at the node", () => {
    const graph = createTrustGraph(data);
    expect(graph.activeInboundEdges("c").map((edge) => edge.id)).toEqual([
      "b>c",
    ]);
    expect(graph.activeInboundEdges("a")).toEqual([]);
  });
  it("activeOutboundEdges keeps only active edges leaving the node", () => {
    const graph = createTrustGraph(data);
    expect(
      graph
        .activeOutboundEdges("a")
        .map((edge) => edge.id)
        .sort(),
    ).toEqual(["a>b", "a>d"]);
    expect(graph.activeOutboundEdges("d").map((edge) => edge.id)).toEqual([
      "d>e",
    ]);
    expect(graph.activeOutboundEdges("c")).toEqual([]);
  });
  it("isIsolated reads the backend isolatedBy list", () => {
    const graph = createTrustGraph(data);
    expect(graph.isIsolated("c")).toBe(true);
    // e is vouched only by d, a new account, yet its isolatedBy is empty:
    // the backend decides, so the model reports e as not isolated.
    expect(graph.isIsolated("e")).toBe(false);
    expect(graph.isIsolated("nobody")).toBe(false);
  });
  it("ringById finds a ring by id", () => {
    const graph = createTrustGraph(data);
    expect(graph.ringById("ring:b")).toBe(RING);
    expect(graph.ringById("ring:missing")).toBeUndefined();
  });
});
