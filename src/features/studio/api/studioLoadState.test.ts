import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioLoadStateOf } from "./studioLoadState";

const base = {
  errorUpdateCount: 0,
  isFetching: false,
  error: null as unknown,
  refetch: vi.fn(() => Promise.resolve()),
};

describe("studioLoadStateOf", () => {
  it("is loading before any answer", () => {
    const state = studioLoadStateOf({ ...base, isFetching: true }, false);
    expect(state).toMatchObject({
      isLoading: true,
      isError: false,
      isNotFound: false,
    });
  });

  it("keeps a loaded list on screen when a later page failed", () => {
    const state = studioLoadStateOf(
      { ...base, errorUpdateCount: 1, error: new ApiError(500, "boom") },
      true,
    );
    expect(state.isError).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("keeps the error panel mounted while a Retry of a never-loaded query runs", () => {
    // React Query resets a never-loaded failed query to pending on refetch;
    // errorUpdateCount survives that reset, so the panel stays put.
    const state = studioLoadStateOf(
      { ...base, errorUpdateCount: 1, isFetching: true, error: null },
      false,
    );
    expect(state).toMatchObject({
      isError: true,
      isRetrying: true,
      isLoading: false,
    });
  });

  it("reports a 404 as not found", () => {
    const state = studioLoadStateOf(
      { ...base, errorUpdateCount: 1, error: new ApiError(404, "Not found") },
      false,
    );
    expect(state).toMatchObject({ isNotFound: true, isError: false });
  });

  it("retries through refetch", () => {
    const refetch = vi.fn(() => Promise.resolve());
    studioLoadStateOf({ ...base, refetch }, false).retry();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
