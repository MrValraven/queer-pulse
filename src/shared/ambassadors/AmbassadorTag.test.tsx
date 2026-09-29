import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { AmbassadorTag } from "./AmbassadorTag";
import { DEMO_AMBASSADORS } from "./ambassadorRegistry.data";
import type { AmbassadorIdentity } from "./ambassadors.api";
import { useAmbassadorMap } from "./useAmbassadorMap";

const mockAuth = vi.hoisted(() => ({ loggedIn: true }));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => mockAuth,
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

/** Mid-month and midday UTC, so no runner time zone moves it to another month. */
const HOUSING_AMBASSADOR: AmbassadorIdentity = {
  focusArea: "housing",
  since: "2026-09-15T12:00:00.000Z",
};

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
}

describe("AmbassadorTag", () => {
  it("shows the short label at sm, with the long label as its title", async () => {
    render(<AmbassadorTag identity={HOUSING_AMBASSADOR} size="sm" />, {
      wrapper: Providers,
    });
    const tag = await screen.findByText("Ambassador");
    expect(tag).toHaveAttribute("title", "QueerPulse Ambassador");
    expect(screen.queryByText(/Since/)).not.toBeInTheDocument();
  });

  it("shows the long label and a visible since and focus line at lg", async () => {
    render(<AmbassadorTag identity={HOUSING_AMBASSADOR} size="lg" />, {
      wrapper: Providers,
    });
    expect(
      await screen.findByText("QueerPulse Ambassador"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Since September 2026 · Housing"),
    ).toBeInTheDocument();
  });

  it("is inert text with a decorative icon", async () => {
    render(<AmbassadorTag identity={HOUSING_AMBASSADOR} />, {
      wrapper: Providers,
    });
    const tag = await screen.findByText("Ambassador");
    expect(tag.tagName).toBe("SPAN");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(tag.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("useAmbassadorMap", () => {
  it("returns the demo roster to a signed-in viewer", async () => {
    mockAuth.loggedIn = true;
    const { result } = renderHook(() => useAmbassadorMap(), {
      wrapper: Providers,
    });
    await waitFor(() => expect(result.current).toEqual(DEMO_AMBASSADORS));
  });

  it("returns an empty map to a signed-out viewer", () => {
    mockAuth.loggedIn = false;
    const { result } = renderHook(() => useAmbassadorMap(), {
      wrapper: Providers,
    });
    expect(result.current).toEqual({});
  });
});
