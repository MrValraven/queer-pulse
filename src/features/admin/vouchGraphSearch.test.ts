import { describe, expect, it } from "vitest";
import { createTrustGraph, ymValue } from "./trustGraph/trustGraphModel";
import type { TrustGraph, VouchPerson } from "./trustGraph/trustGraphModel";
import {
  foldForSearch,
  matchIdsInView,
  matchMembersInGraph,
} from "./vouchGraphSearch";

function makePerson(id: string, name: string, initials: string): VouchPerson {
  return {
    id,
    userId: `user-${id}`,
    name,
    pronoun: "",
    initials,
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

function buildGraph(): TrustGraph {
  const people = [
    makePerson("joao-silva", "João Silva", "JS"),
    makePerson("ines", "Inês Costa", "IC"),
    makePerson("benjamin", "Benjamin Rio", "BR"),
    makePerson("anon_4471", "Anonymous", "AN"),
    makePerson("tiago", "Tiago Costa", "TC"),
  ];
  return createTrustGraph({
    people,
    peopleById: Object.fromEntries(people.map((person) => [person.id, person])),
    edges: [],
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

const namesOf = (people: VouchPerson[]): string[] =>
  people.map((person) => person.name);

describe("foldForSearch", () => {
  it("strips accents and lowercases", () => {
    expect(foldForSearch("João")).toBe("joao");
    expect(foldForSearch("INÊS")).toBe("ines");
  });
});

describe("matchMembersInGraph", () => {
  const graph = buildGraph();

  it("matches accent-folded names", () => {
    expect(namesOf(matchMembersInGraph(graph, "joao", 8))).toEqual([
      "João Silva",
    ]);
  });

  it("puts prefix matches first, then sorts by name", () => {
    // Two surnames start with "cost"; "in" sits inside "Benjamin".
    expect(namesOf(matchMembersInGraph(graph, "cost", 8))).toEqual([
      "Inês Costa",
      "Tiago Costa",
    ]);
    expect(namesOf(matchMembersInGraph(graph, "in", 8))).toEqual([
      "Inês Costa",
      "Benjamin Rio",
    ]);
  });

  it("matches initials and slugs", () => {
    expect(namesOf(matchMembersInGraph(graph, "tc", 8))).toEqual([
      "Tiago Costa",
    ]);
    expect(namesOf(matchMembersInGraph(graph, "4471", 8))).toEqual([
      "Anonymous",
    ]);
  });

  it("honours the limit and an empty term", () => {
    expect(matchMembersInGraph(graph, "a", 2)).toHaveLength(2);
    expect(matchMembersInGraph(graph, "   ", 8)).toEqual([]);
  });
});

describe("matchIdsInView", () => {
  const graph = buildGraph();

  it("returns an empty set for an empty term", () => {
    expect(matchIdsInView(graph, ["ines", "tiago"], "")).toEqual(new Set());
  });

  it("only matches visible members", () => {
    expect(matchIdsInView(graph, ["tiago", "bubble:ines"], "costa")).toEqual(
      new Set(["tiago"]),
    );
  });
});
