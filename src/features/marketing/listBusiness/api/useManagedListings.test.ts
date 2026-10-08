import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_MANAGED_LISTINGS } from "./managedListings.data";
import { useManagedListings } from "./useManagedListings";

const state = vi.hoisted(() => ({ demoMode: true, loggedIn: false }));
const getManagedListings = vi.hoisted(() => vi.fn());

vi.mock("../../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));
vi.mock("../../../../app/providers/authContext", () => ({
  useAuth: () => ({ user: null, loggedIn: state.loggedIn }),
}));
vi.mock("./managedListings.api", () => ({ getManagedListings }));

afterEach(() => {
  state.demoMode = true;
  state.loggedIn = false;
  getManagedListings.mockReset();
});

function renderManaged() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return renderHook(() => useManagedListings(), { wrapper });
}

describe("useManagedListings", () => {
  it("answers demo with the fixture and never calls the network", () => {
    const { result } = renderManaged();
    expect(result.current.items).toBe(DEMO_MANAGED_LISTINGS);
    expect(result.current.isResolving).toBe(false);
    expect(getManagedListings).not.toHaveBeenCalled();
  });

  it("asks nothing for a signed-out visitor in live mode", () => {
    state.demoMode = false;
    const { result } = renderManaged();
    expect(result.current.items).toEqual([]);
    expect(getManagedListings).not.toHaveBeenCalled();
  });

  it("keeps resolving after the read fails, so an empty list is not trusted", async () => {
    state.demoMode = false;
    state.loggedIn = true;
    getManagedListings.mockRejectedValue(new Error("network"));
    const { result } = renderManaged();
    await waitFor(() => expect(getManagedListings).toHaveBeenCalled());
    // Let the rejection settle into the query's error state.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(result.current.isResolving).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it("stops resolving once data is present, even when a later refetch fails", async () => {
    state.demoMode = false;
    state.loggedIn = true;
    const items = [DEMO_MANAGED_LISTINGS[0]];
    getManagedListings.mockResolvedValueOnce(items);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useManagedListings(), { wrapper });
    await waitFor(() => expect(result.current.items).toEqual(items));
    getManagedListings.mockRejectedValue(new Error("network"));
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ["listings", "managed"] });
    });
    expect(result.current.isResolving).toBe(false);
    expect(result.current.items).toEqual(items);
  });
});

describe("DEMO_MANAGED_LISTINGS", () => {
  it("is sorted by name, as the endpoint sorts it", () => {
    const names = DEMO_MANAGED_LISTINGS.map((item) => item.name);
    expect(names).toEqual(
      [...names].sort((first, second) => first.localeCompare(second)),
    );
  });

  it("gives a meeting point only to a mobile listing", () => {
    for (const item of DEMO_MANAGED_LISTINGS) {
      if (item.meetingPoint) expect(item.kind).toBe("mobile");
    }
    expect(DEMO_MANAGED_LISTINGS.some((item) => item.meetingPoint)).toBe(true);
  });
});
