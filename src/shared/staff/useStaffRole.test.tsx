import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useStaffBadgedRoles, useStaffRole } from "./useStaffRole";

const mockAuth = vi.hoisted(() => ({ loggedIn: true }));
const mockDemo = vi.hoisted(() => ({ demoMode: true }));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => mockAuth,
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => mockDemo,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useStaffRole", () => {
  it("resolves an admin from the demo registry", async () => {
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole("tiago"), { wrapper });
    await waitFor(() => expect(result.current).toBe("admin"));
  });

  it("resolves a moderator from the demo registry", async () => {
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole("mariana"), { wrapper });
    await waitFor(() => expect(result.current).toBe("moderator"));
  });

  it("returns null for a member who is not staff", async () => {
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole("sofia"), { wrapper });
    await waitFor(() => expect(result.current).toBeNull());
  });

  it("keeps a grant off the tier answer", async () => {
    // A grant is not an account tier. Inês runs the housing queue on the
    // ordinary member tier, so this hook stays null for her and the grants come
    // back from `useStaffBadgedRoles` instead.
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole("ines"), { wrapper });
    await waitFor(() => expect(result.current).toBeNull());
  });

  it("resolves the badged grants a member holds", async () => {
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffBadgedRoles("ines"), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toEqual(["housing_moderator"]));
  });

  it("leaves an unbadged grant out of the badged grants", async () => {
    // `partnerships` decides about organisations and about third-party
    // changemaker nominations, so it earns no badge; Ana is on the roster for
    // her moderator tier alone.
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffBadgedRoles("ana"), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toEqual([]));
  });

  it("returns null for an undefined slug", async () => {
    mockAuth.loggedIn = true;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole(undefined), { wrapper });
    await waitFor(() => expect(result.current).toBeNull());
  });

  it("returns null when logged out, even for a real staff slug", async () => {
    mockAuth.loggedIn = false;
    mockDemo.demoMode = true;
    const { result } = renderHook(() => useStaffRole("tiago"), { wrapper });
    await waitFor(() => expect(result.current).toBeNull());
  });
});
