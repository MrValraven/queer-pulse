import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { eventKeys } from "../../gatherings/api/eventKeys";
import type { ProfileEventsDTO } from "./profileEvents.api";
import { useProfileEvents } from "./useProfileEvents";

interface ProfileEventsHookMockState {
  isLimited: boolean;
  getProfileEvents: Mock<
    (slug: string, signal?: AbortSignal) => Promise<ProfileEventsDTO>
  >;
}

const mockState = vi.hoisted((): ProfileEventsHookMockState => ({
  isLimited: false,
  getProfileEvents: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: false,
    available: false,
    setDemoMode: vi.fn(),
    toggle: vi.fn(),
  }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./profileEvents.api", () => ({
  getProfileEvents: mockState.getProfileEvents,
}));
vi.mock("./useMemberProfile", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMemberProfile: () => ({
    data: { member: null, limited: mockState.isLimited },
  }),
}));

const ONE_EVENT: ProfileEventsDTO = {
  upcoming: [
    {
      slug: "supper",
      title: "Supper",
      startAt: "2026-11-02T19:00:00.000Z",
      neighbourhood: "Anjos",
      role: "host",
    },
  ],
  past: [],
};

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderEventsHook(
  slug: string,
  isSelf: boolean,
  queryClient: QueryClient = makeClient(),
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useProfileEvents(slug, isSelf), { wrapper });
}

beforeEach(() => {
  mockState.isLimited = false;
  mockState.getProfileEvents.mockReset();
});

describe("useProfileEvents", () => {
  it("maps the server's lists once they land", async () => {
    mockState.getProfileEvents.mockResolvedValue(ONE_EVENT);
    const { result } = renderEventsHook("sam", false);
    await waitFor(() => expect(result.current.upcoming).toHaveLength(1));
    expect(result.current.upcoming[0]?.event.slug).toBe("supper");
    expect(result.current.isPending).toBe(false);
    expect(mockState.getProfileEvents).toHaveBeenCalledWith(
      "sam",
      expect.anything(),
    );
  });

  it("makes no request on a limited profile and reports nothing pending", () => {
    mockState.isLimited = true;
    const { result } = renderEventsHook("sam", false);
    expect(mockState.getProfileEvents).not.toHaveBeenCalled();
    expect(result.current.isLimited).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.upcoming).toEqual([]);
  });

  it("makes no request for an empty slug and reports nothing pending", () => {
    const { result } = renderEventsHook("", true);
    expect(mockState.getProfileEvents).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it.each([404, 403])("reads a %i as a missing profile", async (status) => {
    mockState.getProfileEvents.mockRejectedValue(
      new ApiError(status, "Not here"),
    );
    const { result } = renderEventsHook("sam", false);
    await waitFor(() => expect(result.current.isMissing).toBe(true));
    expect(result.current.isError).toBe(false);
  });

  it("reads a 5xx as a retryable error and exposes it", async () => {
    mockState.getProfileEvents.mockRejectedValue(
      new ApiError(503, "Service unavailable"),
    );
    const { result } = renderEventsHook("sam", false);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isMissing).toBe(false);
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("keeps the loaded rows when a background refetch fails", async () => {
    const queryClient = makeClient();
    mockState.getProfileEvents.mockResolvedValueOnce(ONE_EVENT);
    const { result } = renderEventsHook("sam", false, queryClient);
    await waitFor(() => expect(result.current.upcoming).toHaveLength(1));

    mockState.getProfileEvents.mockRejectedValueOnce(
      new ApiError(500, "Server error"),
    );
    act(() => {
      result.current.refetch();
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryState(eventKeys.byMember("sam", false))?.status,
      ).toBe("error"),
    );

    expect(result.current.isError).toBe(false);
    expect(result.current.upcoming).toHaveLength(1);
  });
});
