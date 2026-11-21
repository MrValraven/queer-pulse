import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import type { CommunityResult } from "./useCommunity";
import {
  markSetupChecklistDismissed,
  useDismissSetupChecklist,
} from "./useDismissSetupChecklist";

const mocks = vi.hoisted(() => ({
  updateCommunity: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./communities.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  updateCommunity: mocks.updateCommunity,
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

const COMMUNITY_KEY = ["community", "club", "en"];

const emptyResult: CommunityResult = {
  community: null,
  detail: null,
  living: undefined,
  myRole: null,
  isRosterMember: false,
  myJoinRequestStatus: null,
  invitedAt: null,
  editable: null,
  setupChecklist: null,
  notFound: false,
  gated: false,
  isLoading: false,
  isError: false,
  refetch: () => {},
};

const resultWithChecklist: CommunityResult = {
  ...emptyResult,
  setupChecklist: { isDismissed: false, staffCount: 1, postCount: 0 },
};

function seededClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(COMMUNITY_KEY, resultWithChecklist);
  return queryClient;
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

function cachedChecklist(queryClient: QueryClient) {
  return queryClient.getQueryData<CommunityResult>(COMMUNITY_KEY)
    ?.setupChecklist;
}

beforeEach(() => {
  mocks.updateCommunity.mockReset();
  mocks.demoOverride.demoMode = null;
});

describe("useDismissSetupChecklist (demo mode)", () => {
  it("writes the dismissal to the demo override store", async () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(
      () => ({
        dismissal: useDismissSetupChecklist(),
        edits: useCommunityEdits(),
      }),
      { wrapper: TestProviders },
    );

    await act(async () => {
      await result.current.dismissal.mutateAsync({ slug: "queer-runners" });
    });

    expect(
      result.current.edits.overrideFor("queer-runners")
        ?.setupChecklistDismissed,
    ).toBe(true);
    expect(mocks.updateCommunity).not.toHaveBeenCalled();
  });
});

describe("useDismissSetupChecklist (live mode)", () => {
  beforeEach(() => {
    mocks.demoOverride.demoMode = false;
  });

  it("sends only setupChecklistDismissed true", async () => {
    mocks.updateCommunity.mockResolvedValue({});
    const queryClient = seededClient();
    const { result } = renderHook(() => useDismissSetupChecklist(), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "club" });
    });

    expect(mocks.updateCommunity).toHaveBeenCalledTimes(1);
    expect(mocks.updateCommunity).toHaveBeenCalledWith("club", {
      setupChecklistDismissed: true,
    });
  });

  it("hides the checklist in the cached detail before the server answers", async () => {
    mocks.updateCommunity.mockReturnValue(new Promise(() => {}));
    const queryClient = seededClient();
    const { result } = renderHook(() => useDismissSetupChecklist(), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate({ slug: "club" });
    });

    await waitFor(() =>
      expect(cachedChecklist(queryClient)?.isDismissed).toBe(true),
    );
    expect(cachedChecklist(queryClient)?.staffCount).toBe(1);
    expect(cachedChecklist(queryClient)?.postCount).toBe(0);
  });

  it("restores the cached checklist when the dismissal fails", async () => {
    mocks.updateCommunity.mockRejectedValue(
      new ApiError(400, "x", {
        code: "setup_checklist_unavailable_for_spaces",
      }),
    );
    const queryClient = seededClient();
    const { result } = renderHook(() => useDismissSetupChecklist(), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "club" }).catch(() => {});
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(cachedChecklist(queryClient)?.isDismissed).toBe(false);
  });

  it("re-reads the detail once the dismissal settles", async () => {
    mocks.updateCommunity.mockResolvedValue({});
    const queryClient = seededClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDismissSetupChecklist(), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "club" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["community", "club"],
    });
  });
});

describe("markSetupChecklistDismissed", () => {
  it("leaves a result with no checklist unchanged", () => {
    const resultWithoutChecklist: CommunityResult = { ...emptyResult };
    expect(markSetupChecklistDismissed(resultWithoutChecklist)).toBe(
      resultWithoutChecklist,
    );
  });

  it("passes an empty cache entry through", () => {
    expect(markSetupChecklistDismissed(undefined)).toBeUndefined();
  });

  it("returns a dismissed copy and keeps the original", () => {
    const dismissed = markSetupChecklistDismissed(resultWithChecklist);
    expect(dismissed).not.toBe(resultWithChecklist);
    expect(dismissed?.setupChecklist).toEqual({
      isDismissed: true,
      staffCount: 1,
      postCount: 0,
    });
    expect(resultWithChecklist.setupChecklist?.isDismissed).toBe(false);
  });
});
