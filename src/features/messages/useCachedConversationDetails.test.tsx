import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { Conversation } from "./data";
import { useCachedConversationDetails } from "./useCachedConversationDetails";

// V4: a session row past the loaded inbox pages follows its cached detail
// read, so a remote rename patched into that entry reaches the row.

const GROUP_ID = "11111111-1111-1111-1111-111111111111";

function detailKey(conversationId: string) {
  return ["conversation-detail", conversationId, false] as const;
}

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: GROUP_ID,
    initials: "PB",
    tint: "plum",
    name: "Pride Brunch",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useCachedConversationDetails", () => {
  it("follows a patch written into a cached detail entry", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    const { result } = renderHook(
      () => useCachedConversationDetails([GROUP_ID], true),
      { wrapper: createWrapper(queryClient) },
    );
    expect(result.current.get(GROUP_ID)?.name).toBe("Pride Brunch");

    act(() => {
      queryClient.setQueryData(
        detailKey(GROUP_ID),
        conversation({ name: "Sunday Brunch" }),
      );
    });
    expect(result.current.get(GROUP_ID)?.name).toBe("Sunday Brunch");
  });

  it("keeps the same map while the entries it reads stay unchanged", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    const { result, rerender } = renderHook(
      () => useCachedConversationDetails([GROUP_ID], true),
      { wrapper: createWrapper(queryClient) },
    );
    const firstSnapshot = result.current;
    act(() => {
      queryClient.setQueryData(["conversations"], []);
    });
    rerender();
    expect(result.current).toBe(firstSnapshot);
  });

  it("holds nothing for an id with no cached read", () => {
    const queryClient = new QueryClient();
    const { result } = renderHook(
      () => useCachedConversationDetails([GROUP_ID], true),
      { wrapper: createWrapper(queryClient) },
    );
    expect(result.current.size).toBe(0);
  });

  it("reads nothing in demo mode", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    const { result } = renderHook(
      () => useCachedConversationDetails([GROUP_ID], false),
      { wrapper: createWrapper(queryClient) },
    );
    expect(result.current.size).toBe(0);
  });
});
