import { describe, expect, it } from "vitest";
import {
  buildConnectionRows,
  countConnections,
  countVisibleInbound,
} from "./useVouchConnectionList";
import {
  createTrustGraph,
  type TrustGraphData,
  type VouchEdge,
  type VouchPerson,
} from "./trustGraph/trustGraphModel";

function makePerson(id: string, name: string): VouchPerson {
  return {
    id,
    userId: `u-${id}`,
    name,
    pronoun: "",
    initials: name.slice(0, 2),
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
  };
}

const people = [
  makePerson("me", "Me"),
  makePerson("ana", "Ana"),
  makePerson("bea", "Bea"),
  makePerson("cris", "Cris"),
  makePerson("ines", "Inês"),
];

const edges: VouchEdge[] = [
  { id: "e1", from: "cris", to: "me", date: "2024-03" },
  { id: "e2", from: "ana", to: "me", date: "2024-01", withdrawn: true },
  { id: "e3", from: "bea", to: "me", date: "2024-02" },
  { id: "e4", from: "ines", to: "me", date: "2024-05" },
  { id: "e5", from: "me", to: "ana", date: "2024-04", kind: "invite" },
  { id: "e6", from: "me", to: "bea", date: "2024-04" },
];

const data: TrustGraphData = {
  people,
  peopleById: Object.fromEntries(people.map((person) => [person.id, person])),
  edges,
  scenes: [],
  sceneAnchor: {},
  tMin: 0,
  tMax: 0,
  truncated: false,
  rings: [],
  cases: [],
  openCaseCount: 0,
  platformStartedAt: "2024-01-01T00:00:00.000Z",
  newAccountWindowDays: 7,
};
const graph = createTrustGraph(data);

function otherIds(rows: { otherId: string }[]): string[] {
  return rows.map((row) => row.otherId);
}

function build(overrides: Partial<Parameters<typeof buildConnectionRows>[0]>) {
  return buildConnectionRows({
    graph,
    personId: "me",
    tab: "vouchedBy",
    query: "",
    sort: "name",
    shouldHideWithdrawn: false,
    ...overrides,
  });
}

describe("buildConnectionRows", () => {
  it("sorts by name and puts withdrawn rows last", () => {
    expect(otherIds(build({ sort: "name" }))).toEqual([
      "bea",
      "cris",
      "ines",
      "ana",
    ]);
  });

  it("sorts newest first and oldest first, withdrawn still last", () => {
    expect(otherIds(build({ sort: "newest" }))).toEqual([
      "ines",
      "cris",
      "bea",
      "ana",
    ]);
    expect(otherIds(build({ sort: "oldest" }))).toEqual([
      "bea",
      "cris",
      "ines",
      "ana",
    ]);
  });

  it("hides withdrawn rows on request", () => {
    expect(otherIds(build({ shouldHideWithdrawn: true }))).not.toContain("ana");
  });

  it("filters by name without accents or case", () => {
    expect(otherIds(build({ query: "INES" }))).toEqual(["ines"]);
    expect(build({ query: "zzz" })).toEqual([]);
  });

  it("splits outbound edges into vouched for and invited", () => {
    expect(otherIds(build({ tab: "invited" }))).toEqual(["ana"]);
    expect(otherIds(build({ tab: "vouchedFor" }))).toEqual(["bea"]);
  });

  it("flags withdrawn rows", () => {
    const rows = build({});
    expect(rows[rows.length - 1]?.isWithdrawn).toBe(true);
  });
});

describe("countConnections", () => {
  it("counts each tab and drops withdrawn rows when hidden", () => {
    expect(countConnections(graph, "me", false)).toEqual({
      vouchedBy: 4,
      vouchedFor: 1,
      invited: 1,
    });
    expect(countConnections(graph, "me", true).vouchedBy).toBe(3);
  });
});

describe("two-row mutual pairs", () => {
  // Live stores a mutual pair as two rows, both flagged mutual. Dee and me
  // vouch for each other; I invited Eli, who vouched back.
  const mutualPeople = [
    makePerson("me", "Me"),
    makePerson("dee", "Dee"),
    makePerson("eli", "Eli"),
  ];
  const mutualGraph = createTrustGraph({
    ...data,
    people: mutualPeople,
    peopleById: Object.fromEntries(
      mutualPeople.map((person) => [person.id, person]),
    ),
    edges: [
      { id: "m1", from: "me", to: "dee", date: "2024-02", mutual: true },
      { id: "m2", from: "dee", to: "me", date: "2024-03", mutual: true },
      { id: "m3", from: "eli", to: "me", date: "2024-04", mutual: true },
      {
        id: "m4",
        from: "me",
        to: "eli",
        date: "2024-04",
        mutual: true,
        kind: "invite",
      },
    ],
  });

  function buildMutual(tab: "vouchedBy" | "vouchedFor" | "invited") {
    return buildConnectionRows({
      graph: mutualGraph,
      personId: "me",
      tab,
      query: "",
      sort: "name",
      shouldHideWithdrawn: false,
    });
  }

  it("lists each partner once per tab", () => {
    expect(otherIds(buildMutual("vouchedBy"))).toEqual(["dee", "eli"]);
    expect(otherIds(buildMutual("vouchedFor"))).toEqual(["dee"]);
    expect(otherIds(buildMutual("invited"))).toEqual(["eli"]);
  });

  it("does not double the counts", () => {
    expect(countConnections(mutualGraph, "me", false)).toEqual({
      vouchedBy: 2,
      vouchedFor: 1,
      invited: 1,
    });
    expect(countVisibleInbound(mutualGraph, "me")).toBe(2);
  });
});
