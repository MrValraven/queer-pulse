import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraph/trustGraphModel";
import type {
  TrustGraph,
  VouchEdge,
  VouchPerson,
} from "./trustGraph/trustGraphModel";
import type { VouchGraphFilters, VouchMode } from "./vouchGraph.types";
import { EMPTY_FILTERS } from "./vouchGraphFilters";
import {
  AUTO_SECOND_HOP_MAX,
  INVITE_BUBBLE_THRESHOLD,
  deriveVisibleGraph,
} from "./vouchVisibility";
import type { VisibleGraphInput } from "./vouchVisibility";

function makePerson(id: string, extra: Partial<VouchPerson> = {}): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    pronoun: "",
    initials: id.slice(0, 2).toUpperCase(),
    tone: "jade",
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

function derive(
  graph: TrustGraph,
  focus: string,
  overrides: Partial<VisibleGraphInput> = {},
) {
  return deriveVisibleGraph({
    graph,
    focus,
    mode: "plain",
    expanded: new Set(),
    expandedBubbles: new Set(),
    filters: EMPTY_FILTERS,
    isEdgeRevealed: () => true,
    pinnedIds: new Set(),
    ...overrides,
  });
}

function withFilters(partial: Partial<VouchGraphFilters>): VouchGraphFilters {
  return { ...EMPTY_FILTERS, ...partial };
}

/** hub invites 26 leaves and has two plain vouch neighbours. */
function buildInviteFan(): TrustGraph {
  const leafIds = Array.from(
    { length: 26 },
    (_unused, index) => `leaf${String(index + 1).padStart(2, "0")}`,
  );
  const people = [
    makePerson("hub"),
    makePerson("ana"),
    makePerson("rui"),
    ...leafIds.map((leafId) => makePerson(leafId)),
  ];
  const edges = [
    makeEdge("ana", "hub"),
    makeEdge("hub", "rui"),
    ...leafIds.map((leafId) => makeEdge("hub", leafId, { kind: "invite" })),
  ];
  return buildGraph(people, edges);
}

/** focus with `neighborCount` neighbours; the first one also knows "far". */
function buildSmallEgo(neighborCount: number): TrustGraph {
  const neighborIds = Array.from(
    { length: neighborCount },
    (_unused, index) => `near${index + 1}`,
  );
  const people = [
    makePerson("focus"),
    makePerson("far"),
    ...neighborIds.map((neighborId) => makePerson(neighborId)),
  ];
  const edges = [
    ...neighborIds.map((neighborId) => makeEdge(neighborId, "focus")),
    makeEdge("far", "near1"),
  ];
  return buildGraph(people, edges);
}

describe("deriveVisibleGraph invite bubbles", () => {
  it("folds a 26-leaf invite fan into one bubble", () => {
    const graph = buildInviteFan();
    const expanded = derive(graph, "hub", {
      expandedBubbles: new Set(["hub"]),
    });
    const collapsed = derive(graph, "hub");

    expect(collapsed.bubbles).toHaveLength(1);
    const [bubble] = collapsed.bubbles;
    expect(bubble?.id).toBe("bubble:hub");
    expect(bubble?.parentId).toBe("hub");
    expect(bubble?.leafIds).toHaveLength(26);
    expect(bubble?.isExpanded).toBe(false);
    expect(expanded.visIds.length - collapsed.visIds.length).toBe(26);
    expect(collapsed.visIds.sort()).toEqual(["ana", "hub", "rui"]);
    expect(collapsed.visEdges).toHaveLength(2);
  });

  it("keeps the leaves and marks the bubble open when expanded", () => {
    const result = derive(buildInviteFan(), "hub", {
      expandedBubbles: new Set(["hub"]),
    });
    expect(result.bubbles[0]?.isExpanded).toBe(true);
    expect(result.visIds).toContain("leaf01");
    expect(result.visEdges).toHaveLength(28);
  });

  it("never folds a pinned leaf", () => {
    const result = derive(buildInviteFan(), "hub", {
      pinnedIds: new Set(["leaf05"]),
    });
    expect(result.bubbles[0]?.leafIds).toHaveLength(25);
    expect(result.visIds).toContain("leaf05");
  });

  it("makes no bubble at the threshold", () => {
    const leafIds = Array.from(
      { length: INVITE_BUBBLE_THRESHOLD },
      (_unused, index) => `leaf${index}`,
    );
    const graph = buildGraph(
      [makePerson("hub"), ...leafIds.map((leafId) => makePerson(leafId))],
      leafIds.map((leafId) => makeEdge("hub", leafId, { kind: "invite" })),
    );
    expect(derive(graph, "hub").bubbles).toEqual([]);
  });
});

describe("deriveVisibleGraph second hop", () => {
  it(`pulls in the second hop for a ${AUTO_SECOND_HOP_MAX}-neighbour focus`, () => {
    const result = derive(buildSmallEgo(AUTO_SECOND_HOP_MAX), "focus");
    expect(result.visIds).toContain("far");
    expect(result.isSecondHopAuto).toBe(true);
  });

  it("skips the second hop above the limit", () => {
    const result = derive(buildSmallEgo(AUTO_SECOND_HOP_MAX + 1), "focus");
    expect(result.visIds).not.toContain("far");
    expect(result.isSecondHopAuto).toBe(false);
  });

  it("treats the invites tab like the plain view", () => {
    const result = derive(buildSmallEgo(2), "focus", { mode: "invites" });
    expect(result.visIds).toContain("far");
    expect(result.layoutKind).toBe("rings");
  });

  it("skips the second hop in the scenes view", () => {
    const result = derive(buildSmallEgo(2), "focus", { mode: "clusters" });
    expect(result.visIds).not.toContain("far");
  });
});

describe("deriveVisibleGraph filters", () => {
  const graph = buildGraph(
    [
      makePerson("focus"),
      makePerson("ana"),
      makePerson("lone", { standing: "flagged" }),
    ],
    [makeEdge("ana", "focus"), makeEdge("lone", "focus")],
  );
  const trustedOnly = withFilters({ standings: ["trusted"] });

  it("drops a member who fails the member filters", () => {
    const result = derive(graph, "focus", { filters: trustedOnly });
    expect(result.visIds).not.toContain("lone");
    expect(result.visIds).toContain("ana");
  });

  it("keeps a filtered-out path endpoint", () => {
    const result = derive(graph, "focus", {
      filters: trustedOnly,
      pinnedIds: new Set(["lone"]),
    });
    expect(result.visIds).toContain("lone");
    expect(result.visEdges.map((edge) => edge.id)).toContain("lone>focus");
  });

  it("reports an empty result when only the focus is left", () => {
    const result = derive(graph, "focus", {
      filters: withFilters({ standings: ["warned"] }),
    });
    expect(result.visIds).toEqual(["focus"]);
    expect(result.isFilteredEmpty).toBe(true);
  });

  it("is not filtered-empty without active filters", () => {
    const loneGraph = buildGraph([makePerson("focus")], []);
    expect(derive(loneGraph, "focus").isFilteredEmpty).toBe(false);
  });

  it("is not filtered-empty when the replay cut emptied the view", () => {
    const result = derive(graph, "focus", {
      filters: withFilters({ standings: ["warned"] }),
      isEdgeRevealed: () => false,
    });
    expect(result.visIds).toEqual(["focus"]);
    expect(result.isFilteredEmpty).toBe(false);
  });

  it("treats every standing ticked as no standing filter", () => {
    const result = derive(graph, "focus", {
      filters: withFilters({
        standings: ["trusted", "warned", "new", "flagged"],
      }),
    });
    expect(result.visIds.sort()).toEqual(["ana", "focus", "lone"]);
    expect(result.isFilteredEmpty).toBe(false);
  });

  it("drops edges by connection type and the member they carried", () => {
    const result = derive(graph, "focus", {
      filters: withFilters({ edgeKinds: ["invite"] }),
    });
    expect(result.visEdges).toEqual([]);
    expect(result.visIds).toEqual(["focus"]);
  });

  it("drops members whose edges are not revealed yet", () => {
    const result = derive(graph, "focus", {
      isEdgeRevealed: (edgeId) => edgeId === "ana>focus",
    });
    expect(result.visIds.sort()).toEqual(["ana", "focus"]);
  });
});

describe("deriveVisibleGraph modes", () => {
  const graph = buildGraph(
    [
      makePerson("focus"),
      makePerson("ana"),
      makePerson("night", { standing: "flagged" }),
      makePerson("friend"),
      makePerson("looped", { ringId: "ring:looped" }),
      ...Array.from({ length: 6 }, (_unused, index) =>
        makePerson(`near${index}`),
      ),
    ],
    [
      makeEdge("ana", "focus"),
      makeEdge("friend", "night"),
      ...Array.from({ length: 6 }, (_unused, index) =>
        makeEdge(`near${index}`, "focus"),
      ),
    ],
  );

  it("adds safety concerns and their neighbours in the safety view", () => {
    const result = derive(graph, "focus", { mode: "safety" });
    expect(result.visIds).toEqual(expect.arrayContaining(["night", "friend"]));
    expect(result.visIds).not.toContain("looped");
    expect(result.layoutKind).toBe("force");
  });

  it.each<[VouchMode, number, "rings" | "force"]>([
    ["plain", 0, "rings"],
    ["plain", 1, "force"],
    ["clusters", 0, "force"],
    ["invites", 0, "rings"],
  ])(
    "lays out %s with %i expanded as %s",
    (mode, expandedCount, layoutKind) => {
      const expanded = new Set(expandedCount > 0 ? ["ana"] : []);
      expect(derive(graph, "focus", { mode, expanded }).layoutKind).toBe(
        layoutKind,
      );
    },
  );
});
