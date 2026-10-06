import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_DUPLICATE_CALL_LINK } from "../forum.data";
import { lookupFundingLink } from "../api/forum.api";
import type { FundingLookupResult } from "./funding.types";
import { useFundingLinkLookup } from "./useFundingLinkLookup";

const { demoModeState } = vi.hoisted(() => ({
  demoModeState: { isDemoMode: false },
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.isDemoMode,
    available: false,
    setDemoMode: vi.fn(),
  }),
}));
vi.mock("../api/forum.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  lookupFundingLink: vi.fn(),
}));

const LINK_A = "https://example.org/calls/a";
const LINK_B = "https://example.org/calls/b";
const MATCH: FundingLookupResult = {
  slug: "maré-2026",
  title: "Maré 2026",
  deadline: null,
};
const lookupMock = vi.mocked(lookupFundingLink);

describe("useFundingLinkLookup", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = false;
    lookupMock.mockReset();
  });

  // The demo case spies on the global fetch; later files must get it back.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("holds a found duplicate until the member chooses to post anyway", async () => {
    lookupMock.mockResolvedValue(MATCH);
    const { result } = renderHook(() => useFundingLinkLookup(LINK_A));
    act(() => result.current.check(LINK_A));
    await waitFor(() => expect(result.current.status).toBe("found"));
    expect(result.current.isDuplicateUnconfirmed).toBe(true);
    act(() => result.current.dismiss());
    expect(result.current.isDuplicateUnconfirmed).toBe(false);
  });

  it("shows nothing and blocks nothing when the lookup fails", async () => {
    lookupMock.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useFundingLinkLookup(LINK_A));
    act(() => result.current.check(LINK_A));
    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.match).toBeNull();
    expect(result.current.isDuplicateUnconfirmed).toBe(false);
  });

  it("ignores a slow answer for a link the member already changed", async () => {
    let resolveFirst: (value: FundingLookupResult | null) => void = () => {};
    lookupMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(null);
    const { result, rerender } = renderHook(
      ({ link }) => useFundingLinkLookup(link),
      { initialProps: { link: LINK_A } },
    );
    act(() => result.current.check(LINK_A));
    expect(result.current.status).toBe("checking");
    rerender({ link: LINK_B });
    act(() => result.current.check(LINK_B));
    await waitFor(() => expect(result.current.status).toBe("clear"));
    await act(async () => resolveFirst(MATCH));
    expect(result.current.status).toBe("clear");
    expect(result.current.isDuplicateUnconfirmed).toBe(false);
  });

  it("reads as unchecked once the field holds a different link", async () => {
    lookupMock.mockResolvedValue(MATCH);
    const { result, rerender } = renderHook(
      ({ link }) => useFundingLinkLookup(link),
      { initialProps: { link: LINK_A } },
    );
    act(() => result.current.check(LINK_A));
    await waitFor(() => expect(result.current.status).toBe("found"));
    rerender({ link: LINK_B });
    expect(result.current.status).toBe("idle");
    expect(result.current.isDuplicateUnconfirmed).toBe(false);
  });

  it("finds the demo duplicate without any request", () => {
    demoModeState.isDemoMode = true;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() =>
      useFundingLinkLookup(DEMO_DUPLICATE_CALL_LINK),
    );
    act(() => result.current.check(DEMO_DUPLICATE_CALL_LINK));
    expect(result.current.status).toBe("found");
    expect(result.current.match?.slug).toBe("30");
    expect(lookupMock).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
