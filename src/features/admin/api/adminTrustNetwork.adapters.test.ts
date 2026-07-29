import { describe, expect, it } from "vitest";
import { trustNetworkDtoToData } from "./adminTrustNetwork.adapters";
import type { TrustNetworkDTO } from "./adminTrustNetwork.api";

const DTO: TrustNetworkDTO = {
  nodes: [
    {
      id: "ines", slug: "ines", name: "Inês Martins", pronouns: "she/her",
      initials: "IM", tone: "jade", avatarUrl: null, joinedAt: "2023-03-01T00:00:00.000Z",
      standing: "trusted", sceneId: "c1", role: "owner", openReportCount: 0,
      verified: true, private: false,
    },
    {
      id: "kai", slug: "kai", name: "Kai Sousa", pronouns: "xe/xem",
      initials: "KS", tone: "plum", avatarUrl: null, joinedAt: "2025-11-01T00:00:00.000Z",
      standing: "trusted", sceneId: "c1", role: "member", openReportCount: 0,
      verified: true, private: false,
    },
  ],
  edges: [
    {
      id: "kai>ines", from: "kai", to: "ines", mutual: false, withdrawn: false,
      createdAt: "2025-11-02T00:00:00.000Z", relationship: "friends",
      note: "Instant trust.", anonymous: false,
    },
  ],
  scenes: [{ id: "c1", label: "Trans & Friends", color: "var(--jade)" }],
  truncated: false,
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
});
