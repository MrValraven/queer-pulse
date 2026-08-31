import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMemberContact } from "./useMemberContact";

const openConnect = vi.fn();
const navigate = vi.fn();
let connectedSlugs: string[] = [];
let incomingSlugs: string[] = [];

vi.mock("../../app/providers/useConnect", () => ({
  useConnect: () => ({ openConnect }),
}));
vi.mock("../../app/providers/useConnections", () => ({
  useConnectionsHydrated: () => ({
    isConnected: (slug: string) => connectedSlugs.includes(slug),
    isIncoming: (slug: string) => incomingSlugs.includes(slug),
  }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));

describe("useMemberContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the connect modal when not connected", () => {
    connectedSlugs = [];
    incomingSlugs = [];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.connected).toBe(false);
    result.current.contact({ slug: "alina", name: "Alina C." }, "custom:hi");
    expect(openConnect).toHaveBeenCalledWith("alina", "custom:hi");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("deep-links to messages when connected", () => {
    connectedSlugs = ["alina"];
    incomingSlugs = [];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.connected).toBe(true);
    result.current.contact({ slug: "alina", name: "Alina C." });
    expect(navigate).toHaveBeenCalledWith("/messages", {
      state: { to: { slug: "alina", name: "Alina C." } },
    });
    expect(openConnect).not.toHaveBeenCalled();
  });

  // PRD-03. A request already waiting from this member is a different state
  // from "stranger", and the call sites that render a hero branch on it to
  // offer an answer rather than another "Say hello".
  it("reports an incoming request instead of a plain reach-out", () => {
    connectedSlugs = [];
    incomingSlugs = ["alina"];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.connected).toBe(false);
    expect(result.current.hasIncomingRequest).toBe(true);
  });

  // Once the pair is connected the request is answered, so the older signal
  // must never outrank it.
  it("prefers connected over a stale incoming flag", () => {
    connectedSlugs = ["alina"];
    incomingSlugs = ["alina"];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.hasIncomingRequest).toBe(false);
  });
});
