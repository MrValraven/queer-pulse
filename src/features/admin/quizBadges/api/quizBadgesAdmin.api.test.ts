import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../../shared/api/client";
import {
  archiveQuizBadge,
  deleteQuizBadge,
  getQuizBadgeLibrary,
  getQuizEventBadgeSetup,
  putQuizEventBadgeSetup,
  restoreQuizBadge,
  updateQuizBadge,
  revokeQuizGameWin,
  searchQuizEvents,
} from "./quizBadgesAdmin.api";

vi.mock("../../../../shared/api/client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("quiz badges admin api", () => {
  it("reads the library from the admin badges route", async () => {
    vi.mocked(apiGet).mockResolvedValue({ items: [] });
    await expect(getQuizBadgeLibrary()).resolves.toEqual({ items: [] });
    expect(apiGet).toHaveBeenCalledWith("/admin/quizshow/badges");
  });

  it("patches the encoded badge path with the changed fields", async () => {
    await updateQuizBadge("d/1", { rarity: "rare" });
    expect(apiPatch).toHaveBeenCalledWith("/admin/quizshow/badges/d%2F1", {
      rarity: "rare",
    });
  });

  it("archives through the archive route", async () => {
    await archiveQuizBadge("d1");
    expect(apiPost).toHaveBeenCalledWith("/admin/quizshow/badges/d1/archive");
  });

  it("restores through the restore route", async () => {
    await restoreQuizBadge("d1");
    expect(apiPost).toHaveBeenCalledWith("/admin/quizshow/badges/d1/restore");
  });

  it("deletes with a DELETE on the badge", async () => {
    await deleteQuizBadge("d1");
    expect(apiDelete).toHaveBeenCalledWith("/admin/quizshow/badges/d1");
  });

  it("leaves a blank search term out of the query", async () => {
    await searchQuizEvents("  ", 2);
    expect(apiGet).toHaveBeenCalledWith("/admin/quizshow/events?page=2");
  });

  it("sends a trimmed and encoded search term before the page", async () => {
    await searchQuizEvents(" pub quiz ", 1);
    expect(apiGet).toHaveBeenCalledWith(
      "/admin/quizshow/events?q=pub%20quiz&page=1",
    );
  });

  it("encodes the ids in the setup and revoke paths", async () => {
    await getQuizEventBadgeSetup("e/1");
    expect(apiGet).toHaveBeenCalledWith("/admin/quizshow/events/e%2F1/badges");
    await revokeQuizGameWin("e/1", "w 1", "x");
    expect(apiPost).toHaveBeenCalledWith(
      "/admin/quizshow/events/e%2F1/winners/w%201/revoke",
      { reason: "x" },
    );
  });

  it("puts the setup with the games body", async () => {
    const body = { games: [{ gameNumber: 1, badgeDefinitionIds: ["d1"] }] };
    await putQuizEventBadgeSetup("e1", body);
    expect(apiPut).toHaveBeenCalledWith(
      "/admin/quizshow/events/e1/badges",
      body,
    );
  });
});
