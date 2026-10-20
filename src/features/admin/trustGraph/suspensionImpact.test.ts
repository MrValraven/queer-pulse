import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraphModel";
import type { TrustGraph, VouchEdge, VouchPerson } from "./trustGraphModel";
import { soleVoucheesOf } from "./suspensionImpact";

function makePerson(
  id: string,
  name: string,
  activeInboundCount: number,
): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name,
    pronoun: "",
    initials: name.slice(0, 2).toUpperCase(),
    tone: "plum",
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
    activeInboundCount,
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

describe("soleVoucheesOf", () => {
  it("lists only members whose single active vouch comes from the voucher", () => {
    const graph = buildGraph(
      [
        makePerson("voucher", "Vera", 0),
        makePerson("zoe", "Zoe", 1),
        makePerson("ana", "Ana", 1),
        makePerson("twoInbound", "Bea", 2),
        makePerson("withdrawn", "Caio", 1),
        makePerson("unrelated", "Duda", 1),
      ],
      [
        makeEdge("voucher", "zoe"),
        makeEdge("voucher", "ana"),
        makeEdge("voucher", "twoInbound"),
        makeEdge("voucher", "withdrawn", { withdrawn: true }),
        makeEdge("zoe", "unrelated"),
      ],
    );
    expect(soleVoucheesOf(graph, "voucher")).toEqual(["ana", "zoe"]);
  });

  it("returns an empty list when the voucher vouches for no one", () => {
    const graph = buildGraph([makePerson("voucher", "Vera", 0)], []);
    expect(soleVoucheesOf(graph, "voucher")).toEqual([]);
  });
});
