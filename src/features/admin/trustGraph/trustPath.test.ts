import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraph, VouchEdge, VouchPerson } from "./trustGraphModel";
import {
  findTrustPath,
  inboundTrustLinks,
  outboundTrustLinks,
} from "./trustPath";
import { describeTrustPath } from "./trustPathSentence";

function makePerson(id: string, name: string): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name,
    pronoun: "",
    initials: name.slice(0, 2).toUpperCase(),
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
  };
}

function makeEdge(
  from: string,
  to: string,
  extra: Partial<VouchEdge> = {},
): VouchEdge {
  return { id: `${from}>${to}`, from, to, date: "2026-02", ...extra };
}

function buildGraph(edges: VouchEdge[]): TrustGraph {
  const people = ["ana", "rui", "lemon", "sol", "kai", "zed"].map((id) =>
    makePerson(id, id.charAt(0).toUpperCase() + id.slice(1)),
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

const isAlwaysUsable = (): boolean => true;

describe("findTrustPath", () => {
  it("prefers a longer directed path over a shorter undirected one", () => {
    const graph = buildGraph([
      makeEdge("ana", "rui"),
      makeEdge("rui", "lemon"),
      makeEdge("lemon", "sol"),
      makeEdge("zed", "ana"),
      makeEdge("zed", "sol"),
    ]);
    const path = findTrustPath(graph, "ana", "sol", isAlwaysUsable);
    expect(path?.isDirected).toBe(true);
    expect(path?.nodeIds).toEqual(["ana", "rui", "lemon", "sol"]);
    expect(path?.steps.every((step) => step.isForward)).toBe(true);
  });

  it("returns an end-to-start directed path in voucher to vouchee order", () => {
    const graph = buildGraph([makeEdge("rui", "ana")]);
    const path = findTrustPath(graph, "ana", "rui", isAlwaysUsable);
    expect(path?.isDirected).toBe(true);
    expect(path?.nodeIds).toEqual(["rui", "ana"]);
  });

  it("falls back to an undirected path with per-step direction", () => {
    const graph = buildGraph([makeEdge("ana", "kai"), makeEdge("rui", "kai")]);
    const path = findTrustPath(graph, "ana", "rui", isAlwaysUsable);
    expect(path?.isDirected).toBe(false);
    expect(path?.nodeIds).toEqual(["ana", "kai", "rui"]);
    expect(path?.steps.map((step) => step.isForward)).toEqual([true, false]);
  });

  it("skips a withdrawn edge", () => {
    const graph = buildGraph([
      makeEdge("ana", "rui", { withdrawn: true }),
      makeEdge("ana", "kai"),
      makeEdge("kai", "rui"),
    ]);
    const path = findTrustPath(graph, "ana", "rui", isAlwaysUsable);
    expect(path?.nodeIds).toEqual(["ana", "kai", "rui"]);
    expect(path?.edgeIds).toEqual(["ana>kai", "kai>rui"]);
  });

  it("returns null when only withdrawn or unusable edges connect them", () => {
    const graph = buildGraph([
      makeEdge("ana", "rui", { withdrawn: true }),
      makeEdge("ana", "kai", { date: "2026-09" }),
      makeEdge("kai", "rui"),
    ]);
    const isRevealedByMay = (edge: VouchEdge): boolean =>
      ymValue(edge.date) <= ymValue("2026-05");
    expect(findTrustPath(graph, "ana", "rui", isRevealedByMay)).toBeNull();
  });

  it("walks a single mutual edge in either direction as a forward vouch", () => {
    const graph = buildGraph([
      makeEdge("rui", "ana", { mutual: true, kind: "invite" }),
    ]);
    const path = findTrustPath(graph, "ana", "rui", isAlwaysUsable);
    expect(path?.isDirected).toBe(true);
    expect(path?.nodeIds).toEqual(["ana", "rui"]);
    expect(path?.steps[0]).toMatchObject({ kind: "vouch", isForward: true });
  });

  it("walks the real row of a two-row mutual pair", () => {
    // The vouch back is listed first, so its mutual reverse half is seen
    // before the real invite row.
    const graph = buildGraph([
      makeEdge("ana", "rui", { mutual: true }),
      makeEdge("rui", "ana", { mutual: true, kind: "invite" }),
    ]);
    const fromRui = findTrustPath(graph, "rui", "ana", isAlwaysUsable);
    expect(fromRui?.edgeIds).toEqual(["rui>ana"]);
    expect(fromRui?.steps[0]).toMatchObject({ kind: "invite" });
    const fromAna = findTrustPath(graph, "ana", "rui", isAlwaysUsable);
    expect(fromAna?.edgeIds).toEqual(["ana>rui"]);
    expect(fromAna?.steps[0]).toMatchObject({ kind: "vouch" });
  });
});

describe("trust links", () => {
  const twoRowMutualGraph = (): TrustGraph =>
    buildGraph([
      makeEdge("ana", "rui", { mutual: true }),
      makeEdge("rui", "ana", { mutual: true, kind: "invite" }),
      makeEdge("kai", "ana", { mutual: true }),
    ]);

  it("counts a two-row mutual pair once per member, real row first", () => {
    const graph = twoRowMutualGraph();
    const inbound = inboundTrustLinks(graph, "ana");
    expect(inbound.map((link) => link.voucherId)).toEqual(["rui", "kai"]);
    expect(inbound[0]).toMatchObject({ kind: "invite" });
    expect(inbound[0]?.edge.id).toBe("rui>ana");
    const outbound = outboundTrustLinks(graph, "ana");
    expect(outbound.map((link) => link.voucheeId)).toEqual(["rui", "kai"]);
    expect(outbound[0]?.edge.id).toBe("ana>rui");
    expect(outbound[1]).toMatchObject({ kind: "vouch" });
  });
});

describe("describeTrustPath", () => {
  const fakeTranslate = (
    key: string,
    values?: Record<string, string | number>,
  ): string =>
    [key.split(".").slice(-2).join("."), ...Object.values(values ?? {})].join(
      "|",
    );

  it("builds a first clause, then next clauses, wrapped when undirected", () => {
    const graph = buildGraph([
      makeEdge("ana", "rui"),
      makeEdge("lemon", "rui", { kind: "invite" }),
    ]);
    const path = findTrustPath(graph, "ana", "lemon", isAlwaysUsable)!;
    expect(describeTrustPath(path, graph, fakeTranslate)).toBe(
      "path.undirected|first.vouch|Ana|Rui, next.inviteBackward|Lemon",
    );
  });
});
