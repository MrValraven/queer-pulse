import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { readDemoThread } from "../api/demoThreadCache";
import { useSendToConversations } from "./useSendToConversations";

const mutateAsync = vi.fn();
vi.mock("../api/useMessageMutations", () => ({
  useSendMessage: () => ({ mutateAsync }),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

describe("useSendToConversations in demo", () => {
  it("lands every share in its thread without the network", async () => {
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
      { conversationId: "priya", ok: true },
      { conversationId: "porto-mentors", ok: true },
    ]);
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(readDemoThread(queryClient, "priya")[0]?.body).toBe("Look at this");
    expect(readDemoThread(queryClient, "porto-mentors")[0]?.body).toBe(
      "Look at this",
    );
  });
});
