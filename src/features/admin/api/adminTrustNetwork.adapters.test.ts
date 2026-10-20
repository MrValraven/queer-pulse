import { describe, expect, it } from "vitest";
import { trustNetworkDtoToData } from "./adminTrustNetwork.adapters";
import type { TrustNetworkDTO, TrustNodeDTO } from "./adminTrustNetwork.api";

type NodeTrustFields = Pick<
  TrustNodeDTO,
  | "accountKind"
  | "ringId"
  | "isolatedBy"
  | "joinPath"
  | "trackRecord"
  | "activeInboundCount"
  | "activeOutboundCount"
  | "sceneIds"
>;

const NODE_TRUST_DEFAULTS: NodeTrustFields = {
  accountKind: "member",
  ringId: null,
  isolatedBy: [],
  joinPath: { kind: "unknown", bySlug: null, byName: null, at: null },
  trackRecord: { vouchesGiven: 0, laterFlaggedCount: 0 },
  activeInboundCount: 0,
  activeOutboundCount: 0,
  sceneIds: [],
};

const DTO: TrustNetworkDTO = {
  nodes: [
    {
      id: "ines",
      userId: "u-ines",
      slug: "ines",
      name: "Inês Martins",
      pronouns: "she/her",
      initials: "IM",
      tone: "jade",
      avatarUrl: null,
      joinedAt: "2023-03-01T00:00:00.000Z",
      standing: "trusted",
      inRing: false,
      sceneId: "c1",
      role: "owner",
      openReportCount: 0,
      verified: true,
      private: false,
      accountKind: "founder",
      ringId: "ring:ines",
      isolatedBy: [{ slug: "kai", name: "Kai Sousa", reason: "new" }],
      joinPath: {
        kind: "invite",
        bySlug: "kai",
        byName: "Kai Sousa",
        at: "2023-03-01T10:00:00.000Z",
      },
      trackRecord: { vouchesGiven: 4, laterFlaggedCount: 1 },
      activeInboundCount: 7,
      activeOutboundCount: 3,
      sceneIds: ["c1", "c2"],
    },
    {
      id: "kai",
      userId: "u-kai",
      slug: "kai",
      name: "Kai Sousa",
      pronouns: "xe/xem",
      initials: "KS",
      tone: "plum",
      avatarUrl: null,
      joinedAt: "2025-11-01T00:00:00.000Z",
      standing: "trusted",
      inRing: false,
      sceneId: "c1",
      role: "member",
      openReportCount: 0,
      verified: true,
      private: false,
      ...NODE_TRUST_DEFAULTS,
    },
  ],
  edges: [
    {
      id: "kai>ines",
      from: "kai",
      to: "ines",
      mutual: false,
      withdrawn: false,
      createdAt: "2025-11-02T00:00:00.000Z",
      relationship: "friends",
      note: "Instant trust.",
      anonymous: false,
      kind: "vouch",
    },
  ],
  scenes: [{ id: "c1", label: "Trans & Friends", color: "var(--jade)" }],
  truncated: false,
  rings: [
    {
      id: "ring:ines",
      memberSlugs: ["ines", "outside-member"],
      memberCount: 2,
      firstJoinedAt: "2023-03-01T00:00:00.000Z",
      lastJoinedAt: "2023-03-01T02:00:00.000Z",
      sharedVouchers: [{ slug: "kai", name: "Kai Sousa" }],
    },
  ],
  cases: [
    {
      id: "isolated:ines",
      kind: "isolated",
      subjectSlug: "ines",
      subjectName: "Inês Martins",
      ringId: null,
      memberCount: 1,
      weakVoucherCount: 1,
      openReportCount: 0,
      windowHours: null,
      score: 42,
    },
  ],
  openCaseCount: 3,
  platformStartedAt: "2023-01-01T00:00:00.000Z",
  newAccountWindowDays: 30,
};

describe("trustNetworkDtoToData", () => {
  it("indexes people by id and derives the joined 'YYYY-MM'", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.peopleById["ines"]!.name).toBe("Inês Martins");
    expect(data.peopleById["ines"]!.joined).toBe("2023-03");
    expect(data.edges[0]!.date).toBe("2025-11");
    expect(data.tMin).toBeLessThanOrEqual(data.tMax);
  });

  it("spreads a scene anchor per distinct scene", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.sceneAnchor["c1"]).toEqual(
      expect.objectContaining({
        x: expect.any(Number) as unknown as number,
        y: expect.any(Number) as unknown as number,
      }),
    );
  });

  it("keeps the full ISO joinedAt and passes pronouns through", () => {
    const ines = trustNetworkDtoToData(DTO).peopleById["ines"]!;
    expect(ines.joinedAt).toBe("2023-03-01T00:00:00.000Z");
    expect(ines.pronoun).toBe("she/her");
  });

  it("maps account kind, ring id and community ids", () => {
    const ines = trustNetworkDtoToData(DTO).peopleById["ines"]!;
    expect(ines.accountKind).toBe("founder");
    expect(ines.ringId).toBe("ring:ines");
    expect(ines.sceneIds).toEqual(["c1", "c2"]);
  });

  it("maps isolatedBy slugs to member ids", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.peopleById["ines"]!.isolatedBy).toEqual([
      { id: "kai", name: "Kai Sousa", reason: "new" },
    ]);
    expect(data.peopleById["kai"]!.isolatedBy).toEqual([]);
  });

  it("maps the join path, bySlug becoming byId", () => {
    const ines = trustNetworkDtoToData(DTO).peopleById["ines"]!;
    expect(ines.joinPath).toEqual({
      kind: "invite",
      byId: "kai",
      byName: "Kai Sousa",
      at: "2023-03-01T10:00:00.000Z",
    });
  });

  it("maps the track record and platform-wide vouch counts", () => {
    const ines = trustNetworkDtoToData(DTO).peopleById["ines"]!;
    expect(ines.trackRecord).toEqual({ vouchesGiven: 4, laterFlaggedCount: 1 });
    expect(ines.activeInboundCount).toBe(7);
    expect(ines.activeOutboundCount).toBe(3);
  });

  it("maps rings, memberSlugs to memberIds and shared vouchers to refs", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.rings).toEqual([
      {
        id: "ring:ines",
        memberIds: ["ines", "outside-member"],
        memberCount: 2,
        firstJoinedAt: "2023-03-01T00:00:00.000Z",
        lastJoinedAt: "2023-03-01T02:00:00.000Z",
        sharedVouchers: [{ id: "kai", name: "Kai Sousa" }],
      },
    ]);
  });

  it("maps cases, subjectSlug becoming subjectId", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.cases).toEqual([
      {
        id: "isolated:ines",
        kind: "isolated",
        subjectId: "ines",
        subjectName: "Inês Martins",
        ringId: null,
        memberCount: 1,
        weakVoucherCount: 1,
        openReportCount: 0,
        windowHours: null,
        score: 42,
      },
    ]);
  });

  it("passes the platform-wide case count and clock through", () => {
    const data = trustNetworkDtoToData(DTO);
    expect(data.openCaseCount).toBe(3);
    expect(data.platformStartedAt).toBe("2023-01-01T00:00:00.000Z");
    expect(data.newAccountWindowDays).toBe(30);
  });

  it("passes edge kind through from DTO to model", () => {
    const dto: TrustNetworkDTO = {
      nodes: [
        {
          id: "a",
          userId: "u-a",
          slug: "a",
          name: "Ana Reis",
          pronouns: "she/her",
          initials: "AR",
          tone: "jade",
          avatarUrl: null,
          joinedAt: "2023-03-01T00:00:00.000Z",
          standing: "trusted",
          inRing: false,
          sceneId: "c1",
          role: "owner",
          openReportCount: 0,
          verified: true,
          private: false,
          ...NODE_TRUST_DEFAULTS,
        },
        {
          id: "b",
          userId: "u-b",
          slug: "b",
          name: "Bruno Alves",
          pronouns: "he/him",
          initials: "BA",
          tone: "plum",
          avatarUrl: null,
          joinedAt: "2025-11-01T00:00:00.000Z",
          standing: "trusted",
          inRing: false,
          sceneId: "c1",
          role: "member",
          openReportCount: 0,
          verified: true,
          private: false,
          ...NODE_TRUST_DEFAULTS,
        },
        {
          id: "c",
          userId: "u-c",
          slug: "c",
          name: "Carla Nunes",
          pronouns: "she/her",
          initials: "CN",
          tone: "coral",
          avatarUrl: null,
          joinedAt: "2026-01-01T00:00:00.000Z",
          standing: "trusted",
          inRing: false,
          sceneId: "c1",
          role: "member",
          openReportCount: 0,
          verified: true,
          private: false,
          ...NODE_TRUST_DEFAULTS,
        },
      ],
      edges: [
        {
          id: "a>b",
          from: "a",
          to: "b",
          mutual: false,
          withdrawn: false,
          createdAt: "2026-01-15T00:00:00.000Z",
          relationship: null,
          note: null,
          anonymous: false,
          kind: "invite",
        },
        {
          id: "a>c",
          from: "a",
          to: "c",
          mutual: false,
          withdrawn: false,
          createdAt: "2026-02-15T00:00:00.000Z",
          relationship: null,
          note: null,
          anonymous: false,
          kind: "vouch",
        },
      ],
      scenes: [],
      truncated: false,
      rings: [],
      cases: [],
      openCaseCount: 0,
      platformStartedAt: "2023-01-01T00:00:00.000Z",
      newAccountWindowDays: 30,
    };
    const data = trustNetworkDtoToData(dto);
    expect(data.edges.find((edge) => edge.id === "a>b")?.kind).toBe("invite");
    expect(data.edges.find((edge) => edge.id === "a>c")?.kind).toBe("vouch");
  });
});
