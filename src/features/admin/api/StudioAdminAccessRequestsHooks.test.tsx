import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioAccessGrantDTO } from "../../studio/api/studio.types";
import {
  DEMO_ACCESS_REQUESTS,
  demoAccessRequestPage,
} from "../StudioAdminAccessRequests.data";
import type {
  AdminStudioAccessRequestDTO,
  AdminStudioAccessRequestPageDTO,
} from "./studioAccessRequestsAdmin.api";
import { useGrantStudioAccess, memberStudioAccessKey } from "./useAdminStudio";
import {
  adminStudioAccessRequestsKey,
  useAdminStudioAccessRequests,
  useDismissStudioAccessRequest,
  useGrantStudioAccessRequest,
} from "./useStudioAdminAccessRequests";

const mocks = vi.hoisted(() => ({
  isDemo: false,
  grantRequest: vi.fn<(requestId: string) => Promise<unknown>>(),
  dismissRequest: vi.fn<(requestId: string) => Promise<unknown>>(),
  grantMember: vi.fn<(memberId: string) => Promise<unknown>>(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("./studioAccessRequestsAdmin.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioAccessRequestsAdmin.api")>()),
  getAdminStudioAccessRequests: (cursor: string | null) =>
    Promise.resolve(demoAccessRequestPage(cursor)),
  grantAdminStudioAccessRequest: (requestId: string) =>
    mocks.grantRequest(requestId),
  dismissAdminStudioAccessRequest: (requestId: string) =>
    mocks.dismissRequest(requestId),
}));
vi.mock("./adminStudio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./adminStudio.api")>()),
  grantMemberStudioAccess: (memberId: string) => mocks.grantMember(memberId),
}));

const GRANT: StudioAccessGrantDTO = {
  userId: "member",
  grantedAt: "2026-10-28T10:00:00.000Z",
  grantedBy: { id: "staff", displayName: "Sofia" },
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function loadedRows(
  data: InfiniteData<AdminStudioAccessRequestPageDTO> | undefined,
): AdminStudioAccessRequestDTO[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

/** Both pages of the 34-row list, loaded through the hook. */
async function loadBothPages(
  wrapper: ({ children }: { children: ReactNode }) => ReactNode,
) {
  const rendered = renderHook(
    () => ({
      list: useAdminStudioAccessRequests(),
      grant: useGrantStudioAccessRequest(),
      dismiss: useDismissStudioAccessRequest(),
    }),
    { wrapper },
  );
  await waitFor(() => expect(rendered.result.current.list.data).toBeDefined());
  await act(() => rendered.result.current.list.fetchNextPage());
  await waitFor(() =>
    expect(rendered.result.current.list.data?.pages).toHaveLength(2),
  );
  return rendered;
}

function artistRow(): AdminStudioAccessRequestDTO {
  const row = DEMO_ACCESS_REQUESTS.find((request) => request.wantsToRelease);
  if (!row) throw new Error("the fixture has an artist request");
  return row;
}

function listenerRow(): AdminStudioAccessRequestDTO {
  const row = DEMO_ACCESS_REQUESTS.find((request) => !request.wantsToRelease);
  if (!row) throw new Error("the fixture has a listener request");
  return row;
}

beforeEach(() => {
  mocks.isDemo = false;
  mocks.grantRequest.mockReset();
  mocks.dismissRequest.mockReset();
  mocks.grantMember.mockReset();
});

describe("Waiting for Studio fixture", () => {
  it("holds 34 requests, 9 artists first and 6 from an invite, over two pages", () => {
    expect(DEMO_ACCESS_REQUESTS).toHaveLength(34);
    expect(
      DEMO_ACCESS_REQUESTS.slice(0, 9).every((row) => row.wantsToRelease),
    ).toBe(true);
    expect(
      DEMO_ACCESS_REQUESTS.filter((row) => row.wantsToRelease),
    ).toHaveLength(9);
    expect(DEMO_ACCESS_REQUESTS.filter((row) => row.isFromInvite)).toHaveLength(
      6,
    );
    const firstPage = demoAccessRequestPage(null);
    expect(firstPage.items).toHaveLength(30);
    expect(firstPage.nextCursor).not.toBeNull();
    expect(demoAccessRequestPage(firstPage.nextCursor).items).toHaveLength(4);
    expect(demoAccessRequestPage(firstPage.nextCursor).nextCursor).toBeNull();
  });
});

describe("Waiting for Studio hooks (live)", () => {
  it("pages on demand and never fetches the next page by itself", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminStudioAccessRequests(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("grants a request: the row leaves every page, the counts drop and the drawer line reads again", async () => {
    const { queryClient, wrapper } = setup();
    mocks.grantRequest.mockResolvedValue(GRANT);
    const { result } = await loadBothPages(wrapper);
    const row = artistRow();
    queryClient.setQueryData(memberStudioAccessKey(false, row.member.id), null);
    await act(() => result.current.grant.mutateAsync(row));
    expect(mocks.grantRequest).toHaveBeenCalledWith(row.id);
    await waitFor(() =>
      expect(loadedRows(result.current.list.data)).toHaveLength(33),
    );
    expect(loadedRows(result.current.list.data).map((r) => r.id)).not.toContain(
      row.id,
    );
    for (const page of result.current.list.data?.pages ?? []) {
      expect(page.totalCount).toBe(33);
      expect(page.artistCount).toBe(8);
    }
    expect(
      queryClient.getQueryState(memberStudioAccessKey(false, row.member.id))
        ?.isInvalidated,
    ).toBe(true);
  });

  it("dismisses a request without touching the artist count of a listener row", async () => {
    const { wrapper } = setup();
    mocks.dismissRequest.mockResolvedValue(undefined);
    const { result } = await loadBothPages(wrapper);
    const row = listenerRow();
    await act(() => result.current.dismiss.mutateAsync(row));
    expect(mocks.dismissRequest).toHaveBeenCalledWith(row.id);
    await waitFor(() =>
      expect(loadedRows(result.current.list.data)).toHaveLength(33),
    );
    for (const page of result.current.list.data?.pages ?? []) {
      expect(page.totalCount).toBe(33);
      expect(page.artistCount).toBe(9);
    }
  });

  it("removes the row of a 404 studio_access_request_not_found and still throws the refusal", async () => {
    const { wrapper } = setup();
    mocks.grantRequest.mockRejectedValue(
      new ApiError(404, "Not found", {
        statusCode: 404,
        code: "studio_access_request_not_found",
        message: "Not found",
      }),
    );
    const { result } = await loadBothPages(wrapper);
    const row = artistRow();
    const error = await act(() =>
      result.current.grant.mutateAsync(row).catch((caught: unknown) => caught),
    );
    expect(error).toBeInstanceOf(ApiError);
    await waitFor(() =>
      expect(
        loadedRows(result.current.list.data).map((r) => r.id),
      ).not.toContain(row.id),
    );
    expect(result.current.list.data?.pages[0]?.artistCount).toBe(8);
  });

  it("removes the row of a dismiss that answers 404 studio_access_request_not_found", async () => {
    const { wrapper } = setup();
    mocks.dismissRequest.mockRejectedValue(
      new ApiError(404, "Not found", {
        statusCode: 404,
        code: "studio_access_request_not_found",
        message: "Not found",
      }),
    );
    const { result } = await loadBothPages(wrapper);
    const row = listenerRow();
    const error = await act(() =>
      result.current.dismiss
        .mutateAsync(row)
        .catch((caught: unknown) => caught),
    );
    expect(error).toBeInstanceOf(ApiError);
    await waitFor(() =>
      expect(
        loadedRows(result.current.list.data).map((request) => request.id),
      ).not.toContain(row.id),
    );
    expect(result.current.list.data?.pages[0]?.totalCount).toBe(33);
    expect(result.current.list.data?.pages[0]?.artistCount).toBe(9);
  });

  it("keeps the row when the failure is any other refusal", async () => {
    const { wrapper } = setup();
    mocks.dismissRequest.mockRejectedValue(new ApiError(500, "Server error"));
    const { result } = await loadBothPages(wrapper);
    await act(() =>
      result.current.dismiss
        .mutateAsync(listenerRow())
        .catch((caught: unknown) => caught),
    );
    expect(loadedRows(result.current.list.data)).toHaveLength(34);
  });

  it("marks the list stale when the member drawer grants access", async () => {
    const { queryClient, wrapper } = setup();
    mocks.grantMember.mockResolvedValue(GRANT);
    queryClient.setQueryData(adminStudioAccessRequestsKey(false), {
      pages: [demoAccessRequestPage(null)],
      pageParams: [null],
    });
    const { result } = renderHook(() => useGrantStudioAccess(), { wrapper });
    await act(() => result.current.mutateAsync({ memberId: "m1" }));
    expect(mocks.grantMember).toHaveBeenCalledWith("m1");
    expect(
      queryClient.getQueryState(adminStudioAccessRequestsKey(false))
        ?.isInvalidated,
    ).toBe(true);
  });
});

describe("Waiting for Studio hooks (demo)", () => {
  it("grants in the demo without the network and writes the grant to the drawer key", async () => {
    mocks.isDemo = true;
    const { queryClient, wrapper } = setup();
    const { result } = await loadBothPages(wrapper);
    const row = listenerRow();
    await act(() => result.current.grant.mutateAsync(row));
    expect(mocks.grantRequest).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(loadedRows(result.current.list.data)).toHaveLength(33),
    );
    expect(
      queryClient.getQueryData<StudioAccessGrantDTO>(
        memberStudioAccessKey(true, row.member.id),
      )?.userId,
    ).toBe(row.member.id);
  });

  it("drops the member's waiting row when the drawer grants access", async () => {
    mocks.isDemo = true;
    const { wrapper } = setup();
    const { result } = await loadBothPages(wrapper);
    const row = artistRow();
    const drawerGrant = renderHook(() => useGrantStudioAccess(), { wrapper });
    await act(() =>
      drawerGrant.result.current.mutateAsync({ memberId: row.member.id }),
    );
    await waitFor(() =>
      expect(
        loadedRows(result.current.list.data).map((r) => r.id),
      ).not.toContain(row.id),
    );
    expect(result.current.list.data?.pages[0]?.totalCount).toBe(33);
  });
});
