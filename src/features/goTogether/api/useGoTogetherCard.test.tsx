import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { demoCard } from "../goTogether.mock";
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
