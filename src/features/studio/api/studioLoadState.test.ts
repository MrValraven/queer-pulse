import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { queryClient } from "../../../shared/api/queryClient";
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

const withdrawnBody = {
  statusCode: 410,
  code: "studio_release_withdrawn",
  message: "This release was withdrawn.",
  error: "Gone",
};

describe("studioLoadStateOf: withdrawn releases", () => {
  it("reads a 410 studio_release_withdrawn as withdrawn", () => {
    const state = studioLoadStateOf(
      {
        ...base,
        errorUpdateCount: 1,
        error: new ApiError(410, "Gone", withdrawnBody),
      },
      false,
    );
    expect(state).toMatchObject({
      isWithdrawn: true,
      isNotFound: false,
      isError: false,
      isLoading: false,
    });
  });

  it("treats a 410 without the Studio code as a failure with Retry", () => {
    const state = studioLoadStateOf(
      { ...base, errorUpdateCount: 1, error: new ApiError(410, "Gone") },
      false,
    );
    expect(state).toMatchObject({ isWithdrawn: false, isError: true });
  });

  it("keeps a 404 as not found", () => {
    const state = studioLoadStateOf(
      { ...base, errorUpdateCount: 1, error: new ApiError(404, "Not found") },
      false,
    );
    expect(state).toMatchObject({ isNotFound: true, isWithdrawn: false });
  });

  it("keeps a loaded release on screen when a refetch answers 410", () => {
    const state = studioLoadStateOf(
      {
        ...base,
        errorUpdateCount: 1,
        error: new ApiError(410, "Gone", withdrawnBody),
      },
      true,
    );
    expect(state.isWithdrawn).toBe(false);
  });

  it("never retries a withdrawn or missing release", () => {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    if (typeof retry !== "function") throw new Error("expected a retry rule");
    expect(retry(0, new ApiError(410, "Gone", withdrawnBody))).toBe(false);
    expect(retry(0, new ApiError(404, "Not found"))).toBe(false);
  });
});

describe("studioLoadStateOf, Studio safety", () => {
  it("names a withheld track apart from a withdrawn release and an error", () => {
    const state = studioLoadStateOf(
      {
        ...base,
        errorUpdateCount: 1,
        error: new ApiError(410, "Gone", {
          statusCode: 410,
          code: "studio_track_withheld",
          message: "This track is unavailable.",
          error: "Gone",
        }),
      },
      false,
    );
    expect(state).toMatchObject({
      isTrackWithheld: true,
      isWithdrawn: false,
      isNotFound: false,
      isError: false,
    });
  });
});
