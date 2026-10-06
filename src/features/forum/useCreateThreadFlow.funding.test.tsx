import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import { createThread, type ForumThreadResponse } from "./api/forum.api";
import { EMPTY_COMPOSE_THREAD_STATE } from "./compose/composeThread.types";
import { EMPTY_COMPOSE_FUNDING } from "./compose/composeFunding";
import { useCreateThreadFlow } from "./useCreateThreadFlow";

vi.mock("./api/forum.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createThread: vi.fn(),
}));

const ASK_STATE = {
  ...EMPTY_COMPOSE_THREAD_STATE,
  kind: "ask" as const,
  category: "funding",
  title: "Help Rui cover top surgery recovery",
  body: "Rui needs six weeks off work and help with rent.",
  funding: {
    ...EMPTY_COMPOSE_FUNDING,
    linkUrl: "https://gofundme.com/f/rui",
    goalAmount: "1500",
    askPurpose: "healthcare" as const,
    beneficiary: "someone_i_know" as const,
  },
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const listKey = [
    "forum-threads",
    false,
    "all",
    "en",
    "active",
    undefined,
    undefined,
  ];
  queryClient.setQueryData(listKey, {
    pages: [{ items: [], nextCursor: null }],
    pageParams: [undefined],
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  const hook = renderHook(
    () => useCreateThreadFlow({ demoMode: false, user: null }),
    { wrapper },
  );
  return { ...hook, queryClient, listKey };
}

describe("useCreateThreadFlow funding", () => {
  beforeEach(() => vi.mocked(createThread).mockReset());

  it("sends a fundraiser for review and mints no list row", async () => {
    vi.mocked(createThread).mockResolvedValue({
      slug: "help-rui",
      title: ASK_STATE.title,
      isPublished: false,
    } as ForumThreadResponse);
    const { result, queryClient, listKey } = setup();
    act(() =>
      result.current.publishThread({
        state: ASK_STATE,
        mode: "now",
        canPostAsOfficial: false,
      }),
    );
    await waitFor(() => expect(result.current.published?.mode).toBe("review"));
    expect(vi.mocked(createThread).mock.calls[0]?.[0]).toMatchObject({
      kind: "ask",
      submitForReview: true,
    });
    expect(
      queryClient.getQueryData<{ pages: { items: unknown[] }[] }>(listKey)
        ?.pages[0]?.items,
    ).toEqual([]);
  });

  it("exposes the contract code of a refused publish", async () => {
    vi.mocked(createThread).mockRejectedValue(
      new ApiError(400, "Bad", { code: "funding_link_host_not_allowed" }),
    );
    const { result } = setup();
    act(() =>
      result.current.publishThread({
        state: ASK_STATE,
        mode: "now",
        canPostAsOfficial: false,
      }),
    );
    await waitFor(() =>
      expect(result.current.fundingErrorCode).toBe(
        "funding_link_host_not_allowed",
      ),
    );
    expect(result.current.publishStatus).toBe("error");
  });
});
