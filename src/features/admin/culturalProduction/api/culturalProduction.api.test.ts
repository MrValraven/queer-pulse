import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

interface ApiClientMocks {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  apiPatch: Mock<(path: string, body?: unknown) => Promise<unknown>>;
  apiPost: Mock<(path: string, body?: unknown) => Promise<unknown>>;
  apiPut: Mock<(path: string, body?: unknown) => Promise<unknown>>;
  apiDelete: Mock<(path: string) => Promise<unknown>>;
}

const mocks: ApiClientMocks = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(() =>
    Promise.resolve({ items: [] }),
  ),
  apiPatch: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
  apiPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
  apiPut: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
  apiDelete: vi.fn<(path: string) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
}));

vi.mock("../../../../shared/api/client", () => ({
  apiGet: (path: string) => mocks.apiGet(path),
  apiPatch: (path: string, body?: unknown) => mocks.apiPatch(path, body),
  apiPost: (path: string, body?: unknown) => mocks.apiPost(path, body),
  apiPut: (path: string, body?: unknown) => mocks.apiPut(path, body),
  apiDelete: (path: string) => mocks.apiDelete(path),
  // `culturalProduction.types` reads it for refusals; nothing here refuses.
  ApiError: class ApiErrorStub extends Error {},
}));

import {
  assignCulturalTask,
  backCulturalIdea,
  createCulturalTaskBatch,
  deleteCulturalIdeaComment,
  getCulturalGuide,
  getCulturalTasks,
  replaceCulturalGuide,
  searchCulturalStaff,
  unassignCulturalTask,
  unbackCulturalIdea,
  updateCulturalTask,
} from "./culturalProduction.api";

const BASE_PATH = "/admin/cultural-production";

beforeEach(() => vi.clearAllMocks());

describe("culturalProduction.api", () => {
  it("sends only the set task filters", async () => {
    await getCulturalTasks({ assignedTo: null, status: null });
    expect(mocks.apiGet).toHaveBeenLastCalledWith(`${BASE_PATH}/tasks`);
    await getCulturalTasks({ assignedTo: "me", status: null });
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks?assignedTo=me`,
    );
    await getCulturalTasks({ assignedTo: null, status: "open" });
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks?status=open`,
    );
    await getCulturalTasks({ assignedTo: "unassigned", status: "done" });
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks?assignedTo=unassigned&status=done`,
    );
  });

  it("sends no q for a blank staff search", async () => {
    mocks.apiGet.mockResolvedValueOnce({ items: [{ id: "user-1" }] });
    await expect(searchCulturalStaff("   ")).resolves.toEqual([
      { id: "user-1" },
    ]);
    expect(mocks.apiGet).toHaveBeenLastCalledWith(`${BASE_PATH}/staff`);
    await searchCulturalStaff("Inês");
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      `${BASE_PATH}/staff?q=In%C3%AAs`,
    );
  });

  it("encodes every id in the path", async () => {
    await deleteCulturalIdeaComment("idea/1", "comment 2");
    expect(mocks.apiDelete).toHaveBeenLastCalledWith(
      `${BASE_PATH}/ideas/idea%2F1/comments/comment%202`,
    );
    await updateCulturalTask("task/1", { status: "done" });
    expect(mocks.apiPatch).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks/task%2F1`,
      { status: "done" },
    );
    await assignCulturalTask("task/1", { userId: "user 3" });
    expect(mocks.apiPost).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks/task%2F1/assignees`,
      { userId: "user 3" },
    );
    await unassignCulturalTask("task/1", "user 3");
    expect(mocks.apiDelete).toHaveBeenLastCalledWith(
      `${BASE_PATH}/tasks/task%2F1/assignees/user%203`,
    );
    await getCulturalGuide("guide?1");
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      `${BASE_PATH}/guides/guide%3F1`,
    );
    const replaceBody = {
      revision: 2,
      title: "Quiz night",
      eventType: "quiz_night" as const,
      locale: "en" as const,
      summary: "",
      sections: [],
    };
    await replaceCulturalGuide("guide?1", replaceBody);
    expect(mocks.apiPut).toHaveBeenLastCalledWith(
      `${BASE_PATH}/guides/guide%3F1`,
      replaceBody,
    );
    await createCulturalTaskBatch("guide?1", { eventOn: "2026-12-12" });
    expect(mocks.apiPost).toHaveBeenLastCalledWith(
      `${BASE_PATH}/guides/guide%3F1/task-batches`,
      { eventOn: "2026-12-12" },
    );
  });

  it("puts and deletes backing on the same path", async () => {
    await backCulturalIdea("idea/1");
    await unbackCulturalIdea("idea/1");
    const backingPath = `${BASE_PATH}/ideas/idea%2F1/backing`;
    expect(mocks.apiPut).toHaveBeenCalledWith(backingPath, undefined);
    expect(mocks.apiDelete).toHaveBeenCalledWith(backingPath);
  });
});
