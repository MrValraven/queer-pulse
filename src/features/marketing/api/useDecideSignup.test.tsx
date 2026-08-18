import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { useDecideSignup } from "./useOpportunityMutations";
import { opportunityKeys } from "./opportunityKeys";
import * as api from "./volunteering.api";
import type { SignupRow } from "./volunteering.adapters";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

describe("useDecideSignup", () => {
  const slug = "community-outreach";
  const queryKey = opportunityKeys.signups(slug, false);
  let queryClient: QueryClient;

  const row: SignupRow = {
    id: "signup-1",
    person: null,
    name: "A member",
    initials: "··",
    background: "",
    color: "",
    note: "Excited to help!",
    status: "pending",
    when: "16 Aug",
  };

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(queryKey, [row]);
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("optimistically accepts and keeps the patch once the request resolves", async () => {
    vi.spyOn(api, "decideSignup").mockResolvedValue({
      id: "signup-1",
      member: null,
      note: row.note,
      status: "accepted",
      decidedAt: "2026-08-18T00:00:00.000Z",
      createdAt: "2026-08-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useDecideSignup(slug), { wrapper });

    act(() => {
      result.current.mutate({ signupId: "signup-1", status: "accepted" });
    });

    expect(
      queryClient.getQueryData<SignupRow[]>(queryKey)?.[0]?.status,
    ).toBe("accepted");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData<SignupRow[]>(queryKey)?.[0]?.status,
    ).toBe("accepted");
  });

  it("rolls back the optimistic patch when the request fails", async () => {
    vi.spyOn(api, "decideSignup").mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useDecideSignup(slug), { wrapper });

    act(() => {
      result.current.mutate({ signupId: "signup-1", status: "accepted" });
    });
    expect(
      queryClient.getQueryData<SignupRow[]>(queryKey)?.[0]?.status,
    ).toBe("accepted");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryData<SignupRow[]>(queryKey)?.[0]?.status,
    ).toBe("pending");
  });
});
