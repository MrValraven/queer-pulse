import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudioAccess } from "./useStudioAccess";
import { studioKeys } from "./studioQueryKeys";

let demoMode = false;
let loggedIn = true;
let checking = false;
const getStudioMe = vi.fn();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({
    loggedIn,
    checking,
    user: loggedIn ? { id: "user-1" } : null,
  }),
}));
vi.mock("./studio.api", () => ({ getStudioMe: () => getStudioMe() }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  demoMode = false;
  loggedIn = true;
  checking = false;
  getStudioMe.mockReset();
});

describe("useStudioAccess", () => {
  it("is pending while GET /studio/me is in flight", () => {
    getStudioMe.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useStudioAccess(), { wrapper });
    expect(result.current).toMatchObject({
      status: "pending",
      isPending: true,
      hasAccess: false,
    });
  });

  it("grants with the uploadable personas the server lists", async () => {
    getStudioMe.mockResolvedValue({
      hasAccess: true,
      uploadablePersonas: [
        {
          id: "p1",
          handle: "nightform",
          name: "NIGHTFORM",
          kind: "musician",
          avatarUrl: null,
        },
      ],
    });
    const { result } = renderHook(() => useStudioAccess(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("granted"));
    expect(
      result.current.uploadablePersonas.map((persona) => persona.name),
    ).toEqual(["NIGHTFORM"]);
  });

  it("denies a member the server says has no grant", async () => {
    getStudioMe.mockResolvedValue({ hasAccess: false, uploadablePersonas: [] });
    const { result } = renderHook(() => useStudioAccess(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("denied"));
  });

  it("denies a signed-out visitor without asking the server", () => {
    loggedIn = false;
    const { result } = renderHook(() => useStudioAccess(), { wrapper });
    expect(result.current.status).toBe("denied");
    expect(getStudioMe).not.toHaveBeenCalled();
  });

  it("grants every demo visitor without a request", () => {
    demoMode = true;
    const { result } = renderHook(() => useStudioAccess(), { wrapper });
    expect(result.current.status).toBe("granted");
    expect(result.current.uploadablePersonas.length).toBeGreaterThan(0);
    expect(getStudioMe).not.toHaveBeenCalled();
  });

  it("marks the query silent so a /studio/me blip raises no toast", async () => {
    getStudioMe.mockResolvedValue({ hasAccess: true, uploadablePersonas: [] });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const sharedWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useStudioAccess(), {
      wrapper: sharedWrapper,
    });
    await waitFor(() => expect(result.current.status).toBe("granted"));
    const query = client
      .getQueryCache()
      .find({ queryKey: studioKeys.me(false, "user-1") });
    expect(query?.meta?.silentError).toBe(true);
  });
});
