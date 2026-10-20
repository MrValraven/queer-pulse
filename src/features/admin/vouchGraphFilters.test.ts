import { describe, expect, it } from "vitest";
import type { VouchEdge, VouchPerson } from "./trustGraph/trustGraphModel";
import type { VouchGraphFilters } from "./vouchGraph.types";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  edgeFilterKind,
  isEdgeAllowedByFilters,
  isPersonAllowedByFilters,
} from "./vouchGraphFilters";

function makeEdge(extra: Partial<VouchEdge> = {}): VouchEdge {
  return { id: "ana>rui", from: "ana", to: "rui", date: "2026-05", ...extra };
}

function makePerson(extra: Partial<VouchPerson> = {}): VouchPerson {
  return {
    id: "ana",
    userId: "user-ana",
    name: "Ana",
    pronoun: "",
    initials: "AN",
    tone: "jade",
    joined: "2026-01",
    joinedAt: "2026-01-01T12:00:00.000Z",
    standing: "trusted",
    sceneId: "lisbon",
    role: null,
    accountKind: "member",
    ringId: null,
    isolatedBy: [],
    joinPath: { kind: "unknown", byId: null, byName: null, at: null },
    trackRecord: { vouchesGiven: 0, laterFlaggedCount: 0 },
    activeInboundCount: 0,
    activeOutboundCount: 0,
    sceneIds: ["lisbon", "porto"],
    ...extra,
  };
}

function withFilters(partial: Partial<VouchGraphFilters>): VouchGraphFilters {
  return { ...EMPTY_FILTERS, ...partial };
}

describe("countActiveFilters", () => {
  it("counts nothing for the empty filters", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it("counts each narrowing field once, the month range as one", () => {
    const filters = withFilters({
      standings: ["trusted"],
      sceneId: "lisbon",
      isVerifiedOnly: true,
      connectedFrom: "2026-01",
      connectedTo: "2026-06",
      edgeKinds: ["vouch"],
      shouldHideWithdrawn: true,
    });
    expect(countActiveFilters(filters)).toBe(6);
  });

  it("ignores lists that select every option", () => {
    const filters = withFilters({
      standings: ["trusted", "warned", "new", "flagged"],
      edgeKinds: ["invite", "vouch", "mutual"],
    });
    expect(countActiveFilters(filters)).toBe(0);
  });
});

describe("edgeFilterKind", () => {
  it("puts mutual before invite before vouch", () => {
    expect(edgeFilterKind(makeEdge({ mutual: true, kind: "invite" }))).toBe(
      "mutual",
    );
    expect(edgeFilterKind(makeEdge({ kind: "invite" }))).toBe("invite");
    expect(edgeFilterKind(makeEdge())).toBe("vouch");
  });
});

describe("isEdgeAllowedByFilters", () => {
  it("passes every edge with empty filters", () => {
    expect(
      isEdgeAllowedByFilters(makeEdge({ withdrawn: true }), EMPTY_FILTERS),
    ).toBe(true);
  });

  it("filters by connection type", () => {
    const invitesOnly = withFilters({ edgeKinds: ["invite"] });
    expect(isEdgeAllowedByFilters(makeEdge(), invitesOnly)).toBe(false);
    expect(
      isEdgeAllowedByFilters(makeEdge({ kind: "invite" }), invitesOnly),
    ).toBe(true);
  });

  it("hides withdrawn edges when asked", () => {
    const filters = withFilters({ shouldHideWithdrawn: true });
    expect(isEdgeAllowedByFilters(makeEdge({ withdrawn: true }), filters)).toBe(
      false,
    );
  });

  it("keeps the month bounds inclusive", () => {
    const filters = withFilters({
      connectedFrom: "2026-05",
      connectedTo: "2026-07",
    });
    expect(isEdgeAllowedByFilters(makeEdge({ date: "2026-05" }), filters)).toBe(
      true,
    );
    expect(isEdgeAllowedByFilters(makeEdge({ date: "2026-07" }), filters)).toBe(
      true,
    );
    expect(isEdgeAllowedByFilters(makeEdge({ date: "2026-04" }), filters)).toBe(
      false,
    );
    expect(isEdgeAllowedByFilters(makeEdge({ date: "2026-08" }), filters)).toBe(
      false,
    );
  });
});

describe("isPersonAllowedByFilters", () => {
  it("filters by standing", () => {
    const flaggedOnly = withFilters({ standings: ["flagged"] });
    expect(isPersonAllowedByFilters(makePerson(), flaggedOnly)).toBe(false);
  });

  it("matches any of the member's scenes", () => {
    expect(
      isPersonAllowedByFilters(makePerson(), withFilters({ sceneId: "porto" })),
    ).toBe(true);
    expect(
      isPersonAllowedByFilters(makePerson(), withFilters({ sceneId: "faro" })),
    ).toBe(false);
  });

  it("requires verification when asked", () => {
    const verifiedOnly = withFilters({ isVerifiedOnly: true });
    expect(isPersonAllowedByFilters(makePerson(), verifiedOnly)).toBe(false);
    expect(
      isPersonAllowedByFilters(makePerson({ verified: true }), verifiedOnly),
    ).toBe(true);
  });
});
