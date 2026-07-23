import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMemberContact } from "./useMemberContact";

const openConnect = vi.fn();
const navigate = vi.fn();
let connectedSlugs: string[] = [];

vi.mock("../../app/providers/ConnectProvider", () => ({
  useConnect: () => ({ openConnect }),
}));
vi.mock("../../app/providers/ConnectionsProvider", () => ({
  useConnectionsHydrated: () => ({
    isConnected: (slug: string) => connectedSlugs.includes(slug),
  }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));

describe("useMemberContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the connect modal when not connected", () => {
    connectedSlugs = [];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.connected).toBe(false);
    result.current.contact({ slug: "alina", name: "Alina C." }, "custom:hi");
    expect(openConnect).toHaveBeenCalledWith("alina", "custom:hi");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("deep-links to messages when connected", () => {
    connectedSlugs = ["alina"];
    const { result } = renderHook(() => useMemberContact("alina"));
    expect(result.current.connected).toBe(true);
    result.current.contact({ slug: "alina", name: "Alina C." });
    expect(navigate).toHaveBeenCalledWith("/messages", {
      state: { to: { slug: "alina", name: "Alina C." } },
    });
    expect(openConnect).not.toHaveBeenCalled();
  });
});
