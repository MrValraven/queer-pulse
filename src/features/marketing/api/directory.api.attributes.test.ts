import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDirectoryPage } from "./directory.api";

const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  apiGet: apiGetMock,
}));

describe("the directory's fact filters on the wire", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiGetMock.mockResolvedValue([]);
  });

  it("sends every fact param comma-joined, before the page", async () => {
    await getDirectoryPage({
      page: 1,
      listingFacts: {
        attributes: ["terrace", "wifi"],
        entryMode: "walkIn",
        payments: ["card"],
        languages: ["pt", "en"],
        practices: ["chosen-name"],
      },
    });
    expect(apiGetMock.mock.calls[0]?.[0]).toBe(
      "/directory?attr=terrace%2Cwifi&entry=walkIn&pay=card&lang=pt%2Cen&practice=chosen-name&page=1",
    );
  });

  it("sends none of them when no fact filter is on, and owned=migrant as given", async () => {
    await getDirectoryPage({ page: 1, owned: ["migrant"] });
    expect(apiGetMock.mock.calls[0]?.[0]).toBe(
      "/directory?owned=migrant&page=1",
    );
  });
});
