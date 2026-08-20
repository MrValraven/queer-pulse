import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraphData } from "./trustGraphModel";

const data: TrustGraphData = {
  people: [
    { id: "a", userId: "u-a", name: "A", pronoun: "", initials: "A", tone: "jade", joined: "2024-01", standing: "trusted", sceneId: null, role: null },
    { id: "b", userId: "u-b", name: "B", pronoun: "", initials: "B", tone: "plum", joined: "2024-02", standing: "new", sceneId: null, role: null },
    { id: "c", userId: "u-c", name: "C", pronoun: "", initials: "C", tone: "coral", joined: "2024-03", standing: "new", sceneId: null, role: null },
  ],
  peopleById: {},
  edges: [
    { id: "a>b", from: "a", to: "b", date: "2024-02" },
    { id: "b>c", from: "b", to: "c", date: "2024-03" },
  ],
  scenes: [], sceneAnchor: {}, tMin: ymValue("2024-01"), tMax: ymValue("2024-03"), truncated: false,
};
data.peopleById = Object.fromEntries(data.people.map((p) => [p.id, p]));

describe("createTrustGraph", () => {
  it("neighbors returns adjacent nodes both directions", () => {
    const graph = createTrustGraph(data);
    expect(graph.neighbors("b").sort()).toEqual(["a", "c"]);
  });
  it("shortestPath walks the trust chain", () => {
    const graph = createTrustGraph(data);
    expect(graph.shortestPath("a", "c")).toEqual(["a", "b", "c"]);
  });
  it("isIsolated is true when every inbound voucher is new/flagged", () => {
    const graph = createTrustGraph(data);
    // c is vouched only by b, whose standing is 'new' → isolated
    expect(graph.isIsolated("c")).toBe(true);
  });
});
