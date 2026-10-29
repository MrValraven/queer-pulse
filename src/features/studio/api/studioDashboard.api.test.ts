import { describe, expect, it, vi } from "vitest";
import { apiGet } from "../../../shared/api/client";
import {
  getStudioArtistMilestones,
  getStudioArtistPlacements,
  getStudioArtistPlays,
  getStudioMilestoneCard,
  getStudioTopSupporters,
} from "./studioDashboard.api";

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: vi.fn(() => Promise.resolve({})),
}));

describe("Studio dashboard raw calls", () => {
  it("encodes the persona and the cursor, and leaves the cursor off page one", async () => {
    await getStudioArtistPlacements("p 1", "c/2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/artists/p%201/placements?cursor=c%2F2",
    );
    await getStudioArtistPlacements("p1", null);
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/p1/placements");
  });

  it("reads milestones and one milestone card", async () => {
    await getStudioArtistMilestones("p1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/p1/milestones");
    await getStudioMilestoneCard("m 1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/milestones/m%201");
  });

  it("reads 28 days of plays and the top listeners", async () => {
    await getStudioArtistPlays("p 1");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/artists/p%201/plays?days=28",
    );
    await getStudioTopSupporters("p1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/p1/supporters");
  });
});
