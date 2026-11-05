import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

interface ApiClientMocks {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  apiPatch: Mock<(path: string, body?: unknown) => Promise<unknown>>;
}

const mocks: ApiClientMocks = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(() =>
    Promise.resolve({ items: [] }),
  ),
  apiPatch: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
}));

vi.mock("../../../../shared/api/client", () => ({
  apiGet: (path: string) => mocks.apiGet(path),
  apiPatch: (path: string, body?: unknown) => mocks.apiPatch(path, body),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  // `leads.types` reads it for refusals; nothing here refuses.
  ApiError: class ApiErrorStub extends Error {},
}));

import { editLeadNote, getLeads, searchLeadPersonas } from "./leads.api";
import { EMPTY_LEAD_FILTERS } from "./leads.types";

beforeEach(() => vi.clearAllMocks());

describe("leads.api", () => {
  it("sends only the filters that are set", async () => {
    await getLeads(
      { q: " ", stage: "contacted", type: null, isDueOnly: true },
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

  it("unwraps the persona search items", async () => {
    await expect(searchLeadPersonas("@vanda")).resolves.toEqual([]);
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/leads/personas/search?q=%40vanda",
    );
  });
});
