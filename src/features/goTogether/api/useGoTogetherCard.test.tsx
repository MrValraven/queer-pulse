import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import { demoCard } from "../goTogether.mock";
import { retryGoTogetherQuery } from "./goTogether.api";
import { useGoTogetherCard } from "./useGoTogetherCard";
import type { GoTogetherCardDTO } from "./goTogether.types";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.doUnmock("./goTogether.api");
  vi.doUnmock("../../../app/providers/authContext");
});

describe("useGoTogetherCard", () => {
  it("answers from the demo registry in demo mode and never fetches", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { result } = renderHook(() => useGoTogetherCard("pride-picnic"), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders>{children}</TestProviders>
      ),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual(demoCard("pride-picnic"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the card endpoint with the slug in live mode", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");
    vi.stubEnv("VITE_DEMO", "");

    const liveCard: GoTogetherCardDTO = {
      ...demoCard("pride-picnic"),
      state: "waiting",
    };
    const getGoTogetherCard = vi.fn((_slug: string) =>
      Promise.resolve(liveCard),
    );
    vi.doMock("./goTogether.api", async () => ({
      ...(await vi.importActual("./goTogether.api")),
      getGoTogetherCard,
    }));
    // A settled, active session without the real AuthProvider, which would
    // fire the session requests this hook has no need of.
    vi.doMock("../../../app/providers/authContext", () => ({
      useAuth: () => ({ loggedIn: true, checking: false, status: "active" }),
    }));

    const { useGoTogetherCard: useLiveCard } =
      await import("./useGoTogetherCard");
    const { DemoModeProvider } =
      await import("../../../app/providers/DemoModeProvider");
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useLiveCard("pride-picnic"), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
          <DemoModeProvider>{children}</DemoModeProvider>
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(getGoTogetherCard).toHaveBeenCalledWith("pride-picnic");
    expect(result.current.data).toEqual(liveCard);
  });
});

type LiveApiErrorClass = typeof ApiError;

/**
 * Live mode with `getGoTogetherCard` answering through the fetch that
 * `makeFetch` builds. Modules are reset first, so the error class has to
 * come from the same fresh module graph the hook reads: `makeFetch` gets
 * that `ApiError`, and the result carries that graph's `isGoTogetherOff`.
 * The client has no retry delay, so the hook's own retry rule runs at once.
 */
async function renderLiveCard(
  makeFetch: (
    LiveApiError: LiveApiErrorClass,
  ) => (slug: string) => Promise<unknown>,
) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");
  const { ApiError: LiveApiError } = await import("../../../shared/api/client");
  const fetchCard = vi.fn(makeFetch(LiveApiError));
  vi.doMock("./goTogether.api", async () => ({
    ...(await vi.importActual("./goTogether.api")),
    getGoTogetherCard: fetchCard,
  }));
  vi.doMock("../../../app/providers/authContext", () => ({
    useAuth: () => ({ loggedIn: true, checking: false, status: "active" }),
  }));
  const { useGoTogetherCard: useLiveCard } =
    await import("./useGoTogetherCard");
  const { isGoTogetherOff: isLiveGoTogetherOff } =
    await import("./goTogether.api");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  const rendered = renderHook(() => useLiveCard("pride-picnic"), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <DemoModeProvider>{children}</DemoModeProvider>
      </QueryClientProvider>
    ),
  });
  return { ...rendered, fetchCard, isLiveGoTogetherOff };
}

describe("useGoTogetherCard failures", () => {
  it("does not retry a 404, which means Go together is off", async () => {
    const { result, fetchCard, isLiveGoTogetherOff } = await renderLiveCard(
      (LiveApiError) => () => Promise.reject(new LiveApiError(404, "Gone")),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchCard).toHaveBeenCalledTimes(1);
    expect(isLiveGoTogetherOff(result.current.error)).toBe(true);
  });

  it("retries a server error twice before it reports the failure", async () => {
    const { result, fetchCard, isLiveGoTogetherOff } = await renderLiveCard(
      (LiveApiError) => () =>
        Promise.reject(new LiveApiError(500, "Server error")),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchCard).toHaveBeenCalledTimes(3);
    expect(isLiveGoTogetherOff(result.current.error)).toBe(false);
  });

  it("recovers when a retry succeeds after a network drop", async () => {
    const liveCard = { ...demoCard("pride-picnic"), state: "waiting" };
    let callCount = 0;
    const { result, fetchCard } = await renderLiveCard(() => () => {
      callCount += 1;
      return callCount === 1
        ? Promise.reject(new TypeError("Failed to fetch"))
        : Promise.resolve(liveCard);
    });

    await waitFor(() => expect(result.current.data).toEqual(liveCard));
    expect(fetchCard).toHaveBeenCalledTimes(2);
  });
});

describe("retryGoTogetherQuery", () => {
  it("retries a network drop, a 5xx and a 408 timeout up to twice", () => {
    for (const error of [
      new TypeError("Failed to fetch"),
      new ApiError(502, "Bad gateway"),
      new ApiError(408, "Timed out"),
    ]) {
      expect(retryGoTogetherQuery(0, error)).toBe(true);
      expect(retryGoTogetherQuery(1, error)).toBe(true);
      expect(retryGoTogetherQuery(2, error)).toBe(false);
    }
  });

  it("never retries any other 4xx", () => {
    for (const status of [400, 401, 403, 404, 409, 429]) {
      expect(retryGoTogetherQuery(0, new ApiError(status, "Client"))).toBe(
        false,
      );
    }
  });
});
