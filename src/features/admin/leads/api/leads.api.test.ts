import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

interface ApiClientMocks {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  apiPatch: Mock<(path: string, body?: unknown) => Promise<unknown>>;
  apiPost: Mock<(path: string, body?: unknown) => Promise<unknown>>;
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
  apiDelete: vi.fn<(path: string) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
}));

vi.mock("../../../../shared/api/client", () => ({
  apiGet: (path: string) => mocks.apiGet(path),
  apiPatch: (path: string, body?: unknown) => mocks.apiPatch(path, body),
  apiPost: (path: string, body?: unknown) => mocks.apiPost(path, body),
  apiDelete: (path: string) => mocks.apiDelete(path),
  // `leads.types` reads it for refusals; nothing here refuses.
  ApiError: class ApiErrorStub extends Error {},
}));

import {
  assignLeadStaff,
  editLeadNote,
  getLeads,
  revertLeadStageChange,
  searchLeadPersonas,
  searchLeadStaff,
  unassignLeadStaff,
} from "./leads.api";
import { EMPTY_LEAD_FILTERS } from "./leads.types";

beforeEach(() => vi.clearAllMocks());

describe("leads.api", () => {
  it("sends only the filters that are set", async () => {
    await getLeads(
      {
        q: " ",
        stage: "contacted",
        type: null,
        isDueOnly: true,
        assignedTo: null,
      },
      "c1",
    );
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/leads?stage=contacted&due=true&cursor=c1",
    );
  });

  it("sends no query string with no filters", async () => {
    await getLeads(EMPTY_LEAD_FILTERS, null);
    expect(mocks.apiGet).toHaveBeenCalledWith("/admin/leads");
  });

  it("sends the trimmed search and the type", async () => {
    await getLeads({ ...EMPTY_LEAD_FILTERS, q: " Maré ", type: "venue" }, null);
    const requestedPath = mocks.apiGet.mock.calls[0]?.[0] ?? "";
    const params = new URLSearchParams(requestedPath.split("?")[1]);
    expect(params.get("q")).toBe("Maré");
    expect(params.get("type")).toBe("venue");
    expect(params.has("due")).toBe(false);
  });

  it("encodes the ids in a note path", async () => {
    await editLeadNote("lead/1", "entry 2", { body: "Hi" });
    expect(mocks.apiPatch).toHaveBeenCalledWith(
      "/admin/leads/lead%2F1/entries/entry%202",
      { body: "Hi" },
    );
  });

  it("posts a stage change revert with no body", async () => {
    await revertLeadStageChange("lead/1", "entry 2");
    expect(mocks.apiPost).toHaveBeenCalledWith(
      "/admin/leads/lead%2F1/entries/entry%202/revert",
      undefined,
    );
  });

  it("unwraps the persona search items", async () => {
    await expect(searchLeadPersonas("@vanda")).resolves.toEqual([]);
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/leads/personas/search?q=%40vanda",
    );
  });

  it("sends the In charge view before the cursor", () => {
    void getLeads(
      { ...EMPTY_LEAD_FILTERS, stage: "contacted", assignedTo: "me" },
      "c1",
    );
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/leads?stage=contacted&assignedTo=me&cursor=c1",
    );
  });

  it("asks for the staff preview with no q and answers the items", async () => {
    mocks.apiGet.mockResolvedValueOnce({ items: [{ id: "u1" }] });
    await expect(searchLeadStaff("  ")).resolves.toEqual([{ id: "u1" }]);
    expect(mocks.apiGet).toHaveBeenLastCalledWith("/admin/leads/staff");
    await searchLeadStaff("Inês");
    expect(mocks.apiGet).toHaveBeenLastCalledWith(
      "/admin/leads/staff?q=In%C3%AAs",
    );
  });

  it("assigns and unassigns with both ids encoded", async () => {
    await assignLeadStaff("lead/1", { userId: "u1" });
    expect(mocks.apiPost).toHaveBeenCalledWith(
      "/admin/leads/lead%2F1/assignees",
      { userId: "u1" },
    );
    await unassignLeadStaff("lead/1", "user/2");
    expect(mocks.apiDelete).toHaveBeenCalledWith(
      "/admin/leads/lead%2F1/assignees/user%2F2",
    );
  });
});
