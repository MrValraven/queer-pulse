import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useSendToConversations } from "./useSendToConversations";

const mutateAsync = vi.fn();
vi.mock("../api/useMessageMutations", () => ({
  useSendMessage: () => ({ mutateAsync }),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
// The demo send's chunk fails to load, the way it does offline.
vi.mock("./demoShareSend", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("useSendToConversations when the demo send fails to load", () => {
  it("settles every share as failed so Send leaves its sending state", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSendToConversations(), {
      wrapper,
    });
    const outcomes = await result.current.sendToMany(
      ["priya", "porto-mentors"],
      "Look at this",
    );
    expect(outcomes).toEqual([
      { conversationId: "priya", ok: false },
      { conversationId: "porto-mentors", ok: false },
    ]);
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
