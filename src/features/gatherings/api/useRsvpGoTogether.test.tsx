import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { goTogetherKeys } from "../../goTogether/api/goTogetherKeys";
import { useRsvp, useUnrsvp } from "./useEventMutations";

/**
 * The Go together card only shows to members who are going, so an RSVP change
 * has to refresh it. Live mode invalidates the card once the server has the
 * new standing; demo mode has no server and leaves the cache alone.
 */

const { demoState } = vi.hoisted(() => ({ demoState: { demoMode: false } }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoState.demoMode }),
}));

vi.mock("./events.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./events.api")>()),
  rsvpEvent: vi.fn(() => Promise.resolve()),
  unrsvpEvent: vi.fn(() => Promise.resolve()),
}));

afterEach(() => {
  demoState.demoMode = false;
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidateSpy, wrapper };
}

function invalidatedCardRoot(
  invalidateSpy: ReturnType<typeof setup>["invalidateSpy"],
) {
  return invalidateSpy.mock.calls.some(
    ([filters]) =>
      JSON.stringify(filters?.queryKey) ===
      JSON.stringify(goTogetherKeys.cardRoot),
  );
}

describe("RSVP changes refresh the Go together card", () => {
  it("invalidates the card after a live RSVP settles", async () => {
    const { invalidateSpy, wrapper } = setup();
    const { result } = renderHook(() => useRsvp("pride-picnic"), { wrapper });

    await result.current.mutateAsync("going");

    await waitFor(() => expect(invalidatedCardRoot(invalidateSpy)).toBe(true));
  });

  it("invalidates the card after a live un-RSVP settles", async () => {
    const { invalidateSpy, wrapper } = setup();
    const { result } = renderHook(() => useUnrsvp("pride-picnic"), {
      wrapper,
    });

    await result.current.mutateAsync();

    await waitFor(() => expect(invalidatedCardRoot(invalidateSpy)).toBe(true));
  });

  it("leaves the card alone in demo mode", async () => {
    demoState.demoMode = true;
    const { invalidateSpy, wrapper } = setup();
    const { result } = renderHook(() => useRsvp("pride-picnic"), { wrapper });

    await result.current.mutateAsync("going");

    expect(invalidatedCardRoot(invalidateSpy)).toBe(false);
  });
});
