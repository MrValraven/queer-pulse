import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToggleMuteMode } from "./useConversationPrefs";
import type { Conversation } from "../data";

/**
 * PRD-349: `useToggleMuteMode`, the persisted counterpart to the row menu's
 * "Mentions only" item. Live mode must PATCH `/conversations/:id` with
 * `{ muteMode }` alone (via `updateConversationPrefs`) and end up with the
 * cache reflecting the new mode; demo mode must never touch the network,
 * only the query cache, mirroring every other toggle in this file.
 */

const state = vi.hoisted(() => ({ demoMode: false }));
const mocks = vi.hoisted(() => ({
  updateConversationPrefs: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));

vi.mock("./messages.api", () => ({
  updateConversationPrefs: mocks.updateConversationPrefs,
}));

afterEach(() => {
  state.demoMode = false;
  mocks.updateConversationPrefs.mockClear();
});

function conversationRow(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conv-1",
    initials: "AB",
    tint: "default",
    name: "Ana",
    pronouns: "",
    connectedSince: "",
    time: "14:02",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  client.setQueryData(["conversations"], [conversationRow()]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, client };
}

describe("useToggleMuteMode: live mode", () => {
  it("PATCHes muteMode alone, then patches the cached row", async () => {
    state.demoMode = false;
    const { wrapper, client } = createWrapper();
    const { result } = renderHook(() => useToggleMuteMode(), { wrapper });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        muteMode: "mentionsOnly",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.updateConversationPrefs).toHaveBeenCalledWith("conv-1", {
      muteMode: "mentionsOnly",
    });
    const cached = client.getQueryData<Conversation[]>(["conversations"]);
    expect(cached?.[0]?.muteMode).toBe("mentionsOnly");
  });
});

describe("useToggleMuteMode: demo mode", () => {
  it("never calls the network, but still patches the cache locally", async () => {
    state.demoMode = true;
    const { wrapper, client } = createWrapper();
    const { result } = renderHook(() => useToggleMuteMode(), { wrapper });

    act(() => {
      result.current.mutate({
        conversationId: "conv-1",
        muteMode: "mentionsOnly",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.updateConversationPrefs).not.toHaveBeenCalled();
    const cached = client.getQueryData<Conversation[]>(["conversations"]);
    expect(cached?.[0]?.muteMode).toBe("mentionsOnly");
  });
});
