import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { getCreatorDraft } from "./creatorDrafts.api";
import {
  clearCreatorDraftDemoStore,
  demoSaveCreatorDraft,
} from "./creatorDrafts.demoStore";
import { isCreatorDraftKindOff, useCreatorDraft } from "./useCreatorDraft";

const mockDemoMode = vi.hoisted(() => ({ current: false }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode.current }),
}));
vi.mock("./creatorDrafts.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./creatorDrafts.api")>()),
  getCreatorDraft: vi.fn(),
  saveCreatorDraft: vi.fn(),
  deleteCreatorDraft: vi.fn(),
}));

beforeEach(() => {
  mockDemoMode.current = false;
  clearCreatorDraftDemoStore();
  vi.mocked(getCreatorDraft).mockReset();
});

describe("useCreatorDraft", () => {
  it("reads the server draft for its slot under the contract key", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue({
      payload: { title: "Picnic" },
      payloadVersion: 1,
      revision: 3,
      savedAt: "2026-10-19T10:00:00.000Z",
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "event", listingRef: null }),
      {
        wrapper: ({ children }) => (
          <TestProviders queryClient={client}>{children}</TestProviders>
        ),
      },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.draft?.revision).toBe(3);
    expect(
      client.getQueryData(["creator-draft", "event", "", false]),
    ).toMatchObject({ revision: 3 });
  });

  it("reads a feature-off 404 as an empty slot with one request and no error", async () => {
    vi.mocked(getCreatorDraft).mockRejectedValue(
      new ApiError(404, "This feature is not available yet.", {
        message: "This feature is not available yet.",
      }),
    );
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "community", listingRef: null }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.draft).toBeNull();
    expect(getCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("remembers a feature-off kind for its query client so autosave stops", async () => {
    vi.mocked(getCreatorDraft).mockRejectedValue(
      new ApiError(404, "This feature is not available yet.", {
        message: "This feature is not available yet.",
      }),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "community", listingRef: null }),
      {
        wrapper: ({ children }) => (
          <TestProviders queryClient={client}>{children}</TestProviders>
        ),
      },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(isCreatorDraftKindOff(client, "community")).toBe(true);
    expect(isCreatorDraftKindOff(client, "event")).toBe(false);
    expect(isCreatorDraftKindOff(new QueryClient(), "community")).toBe(false);
  });

  it("reads and writes the demo store with no request", async () => {
    mockDemoMode.current = true;
    await demoSaveCreatorDraft(
      { kind: "community", listingRef: null },
      {
        payload: { draft: {} },
        payloadVersion: 1,
        baseRevision: null,
        progress: null,
        missing: null,
      },
    );
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "community", listingRef: null }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.draft?.revision).toBe(1));
    expect(getCreatorDraft).not.toHaveBeenCalled();
  });

  it("settles as an empty slot when the read fails", async () => {
    vi.mocked(getCreatorDraft).mockRejectedValue(new ApiError(500, "Down"));
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "event", listingRef: null }),
      { wrapper: TestProviders },
    );
    // The read retries once after react-query's one-second default delay.
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 4_000,
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.draft).toBeNull();
  });

  it("replaces the cached copy with a fresh read", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce({
        payload: { title: "Old" },
        payloadVersion: 1,
        revision: 1,
        savedAt: "2026-10-19T10:00:00.000Z",
      })
      .mockResolvedValueOnce({
        payload: { title: "New" },
        payloadVersion: 1,
        revision: 2,
        savedAt: "2026-10-19T10:05:00.000Z",
      });
    const { result } = renderHook(
      () => useCreatorDraft({ kind: "event", listingRef: null }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.draft?.revision).toBe(1));
    await expect(result.current.readFresh()).resolves.toMatchObject({
      revision: 2,
    });
    await waitFor(() => expect(result.current.draft?.revision).toBe(2));
  });
});
