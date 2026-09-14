import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { useCommunity } from "./useCommunity";

/**
 * `useCommunity` reads the `COMMUNITY_MEMBERS_ONLY` 403 (Task 2's backend
 * refusal for a non-member of a `request`/`invite`/`private` community) and
 * resolves it into `gated: true` instead of rethrowing it as a query error.
 * The suite mocks `getCommunity` directly (no MSW, no network) so each case is
 * a plain "what does the hook do with this rejection" assertion, and forces
 * `useDemoMode` to `false` so the hook's live branch actually runs. Demo mode
 * has no server to refuse anything, so it is out of scope here (a later task
 * computes the demo gate elsewhere).
 */

const getCommunityMock = vi.hoisted(() => vi.fn());

vi.mock("./communities.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getCommunity: getCommunityMock,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({ demoMode: false, setDemoMode: vi.fn() }),
}));

// `TestProviders` mints a fresh, retry-free `QueryClient` per render (see its
// own doc comment), which is required here: with retries on, the rejected
// queries above would retry and the `waitFor` calls below would time out.
const wrapper = TestProviders;

describe("useCommunity (live mode, members-only gate)", () => {
  it("resolves a members-only 403 into gated, without an error state", async () => {
    getCommunityMock.mockRejectedValue(
      new ApiError(403, "Members only", { code: "COMMUNITY_MEMBERS_ONLY" }),
    );

    const { result } = renderHook(() => useCommunity("closed-one"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.gated).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.notFound).toBe(false);
    expect(result.current.community).toBeNull();
  });

  it("leaves an uncoded 403 as an error rather than a gate", async () => {
    getCommunityMock.mockRejectedValue(new ApiError(403, "Forbidden", {}));

    const { result } = renderHook(() => useCommunity("closed-one"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.gated).toBe(false);
  });

  it("keeps a 404 on the not-found path", async () => {
    getCommunityMock.mockRejectedValue(new ApiError(404, "Not found", {}));

    const { result } = renderHook(() => useCommunity("ghost"), { wrapper });

    await waitFor(() => expect(result.current.notFound).toBe(true));
    expect(result.current.gated).toBe(false);
  });
});
