import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdultDirectory, getDirectoryPage } from "./directory.api";

/** `apiGet` is mocked so each read can be asserted by the path it asks for. */
const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  apiGet: apiGetMock,
}));

describe("the Online tab's reads", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiGetMock.mockResolvedValue([]);
  });

  it("asks the paged directory for listings that sell online", async () => {
    await getDirectoryPage({ online: true, page: 2 });
    expect(apiGetMock).toHaveBeenCalledWith("/directory?online=true&page=2");
  });

  it("leaves the online filter out of the other tabs' reads", async () => {
    await getDirectoryPage({ page: 1 });
    expect(apiGetMock.mock.calls[0]?.[0]).toBe("/directory?page=1");
  });

  it("reads the 18+ shops from the member-only endpoint with the search", async () => {
    await getAdultDirectory({ q: "lace & leather" });
    expect(apiGetMock.mock.calls[0]?.[0]).toBe(
      "/directory/adult?q=lace+%26+leather",
    );
    await getAdultDirectory();
    expect(apiGetMock.mock.calls[1]?.[0]).toBe("/directory/adult");
  });
});
