import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import {
  deleteCreatorDraft,
  getCreatorDraft,
  saveCreatorDraft,
} from "./creatorDrafts.api";
import { CREATOR_DRAFT_QUERY_ROOT } from "./creatorDraftQueryKeys";
import {
  clearCreatorDraftDemoStore,
  demoGetCreatorDraft,
} from "./creatorDrafts.demoStore";
import type {
  CreatorDraftResponse,
  CreatorDraftSaved,
} from "./creatorDrafts.types";
import {
  CreatorDraftDiscardError,
  useCreatorDraftAutosave,
} from "./useCreatorDraftAutosave";

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

const EVENT_SLOT = { kind: "event", listingRef: null } as const;
const SAVED_AT = "2026-10-19T10:01:00.000Z";

function eventKey(demoMode: boolean) {
  return ["creator-draft", "event", "", demoMode];
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/** What AuthProvider's signOut does to creator drafts, in its order. */
function signOutDrafts(client: QueryClient) {
  client.removeQueries({ queryKey: [CREATOR_DRAFT_QUERY_ROOT] });
  clearCreatorDraftDemoStore();
}

interface AutosaveProps {
  payload: Record<string, unknown> | null;
  isEnabled?: boolean;
}

function renderAutosave(
  initialProps: AutosaveProps,
  client: QueryClient = createClient(),
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={client}>{children}</TestProviders>
  );
  const rendered = renderHook(
    (props: AutosaveProps) =>
      useCreatorDraftAutosave({
        slot: EVENT_SLOT,
        payload: props.payload,
        progress: null,
        missing: null,
        isEnabled: props.isEnabled ?? true,
      }),
    { initialProps, wrapper },
  );
  return { ...rendered, client };
}

type RenderedAutosave = ReturnType<typeof renderAutosave>;

/** Unmounts one editor and mounts the next on the same client in one act. */
function remountInOneAct(
  first: RenderedAutosave,
  nextProps: AutosaveProps,
): RenderedAutosave {
  const box: { second?: RenderedAutosave } = {};
  act(() => {
    first.unmount();
    box.second = renderAutosave(nextProps, first.client);
  });
  if (box.second === undefined)
    throw new Error("The next editor did not mount");
  return box.second;
}

function conflictError(revision: number | null, savedAt: string | null) {
  return new ApiError(409, "Draft changed", {
    code: "creator_draft_revision_conflict",
    message: "Draft changed",
    revision,
    savedAt,
  });
}

function sentBodies() {
  return vi.mocked(saveCreatorDraft).mock.calls.map((call) => call[1]);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockDemoMode.current = false;
  clearCreatorDraftDemoStore();
  vi.mocked(getCreatorDraft).mockReset();
  vi.mocked(saveCreatorDraft).mockReset();
  vi.mocked(deleteCreatorDraft).mockReset();
  vi.mocked(deleteCreatorDraft).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCreatorDraftAutosave saving", () => {
  it("waits 1500 ms after the last change, then saves once on the loaded revision", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue({
      payload: { title: "A" },
      payloadVersion: 1,
      revision: 2,
      savedAt: "2026-10-19T10:00:00.000Z",
    });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 3,
      savedAt: SAVED_AT,
    });
    const { result, rerender } = renderAutosave({ payload: { title: "Ab" } });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Abc" } });
    // 1400 and 1600 ms leave room for the real time shouldAdvanceTime adds.
    await act(() => vi.advanceTimersByTimeAsync(1400));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveCreatorDraft).mock.calls[0]?.[1]).toMatchObject({
      payload: { title: "Abc" },
      baseRevision: 2,
      payloadVersion: 1,
    });
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
  });

  it("sends the next save on the revision the last save answered", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT })
      .mockResolvedValueOnce({
        revision: 2,
        savedAt: "2026-10-19T10:02:00.000Z",
      });
    const { rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    rerender({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(sentBodies().map((body) => body.baseRevision)).toEqual([null, 1]);
  });

  it("keeps one save in flight and sends the newest payload after it", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let releaseFirstSave: (saved: CreatorDraftSaved) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((resolve) => {
            releaseFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce({
        revision: 2,
        savedAt: "2026-10-19T10:02:00.000Z",
      });
    const { rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    rerender({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    rerender({ payload: { title: "ABC" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    await act(async () => {
      releaseFirstSave({ revision: 1, savedAt: SAVED_AT });
      await Promise.resolve();
    });
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "ABC" },
      baseRevision: 1,
    });
  });

  it("waits for the first read before any save", async () => {
    vi.mocked(getCreatorDraft).mockReturnValue(
      new Promise<CreatorDraftResponse | null>(() => undefined),
    );
    const { result } = renderAutosave({ payload: { title: "Early" } });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    expect(result.current.isServerDraftLoading).toBe(true);
  });

  it("saves a pending change at once when the page hides", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender } = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Leaving" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));
    expect(sentBodies()[0]).toMatchObject({ payload: { title: "Leaving" } });
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("writes no draft content to browser storage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result } = renderAutosave({ payload: { title: "Secret words" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    expect(
      setItemSpy.mock.calls.some((call) =>
        String(call[1]).includes("Secret words"),
      ),
    ).toBe(false);
    setItemSpy.mockRestore();
  });

  it("ages the save line from this device's clock and keeps the server time in the cache", async () => {
    const localNow = Date.parse("2026-10-19T12:00:00.000Z");
    vi.setSystemTime(localNow);
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    // The server clock runs two hours behind this device.
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: "2026-10-19T10:00:00.000Z",
    });
    const { result, client } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    const { status } = result.current;
    if (status.kind !== "saved") throw new Error("The save did not land");
    const lineSavedAtMs = Date.parse(status.savedAt);
    expect(lineSavedAtMs).toBeGreaterThanOrEqual(localNow);
    expect(lineSavedAtMs).toBeLessThanOrEqual(Date.now());
    expect(
      client.getQueryData<CreatorDraftResponse>(eventKey(false))?.savedAt,
    ).toBe("2026-10-19T10:00:00.000Z");
  });
});

describe("useCreatorDraftAutosave conflicts", () => {
  it("pauses on a conflict and sends nothing more until the creator chooses", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockRejectedValue(
      conflictError(5, "2026-10-19T10:03:00.000Z"),
    );
    const { result, rerender } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    expect(result.current.conflict).toEqual({
      revision: 5,
      savedAt: "2026-10-19T10:03:00.000Z",
    });
    rerender({ payload: { title: "Mine, still typing" } });
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("keeps this version by resending the latest payload on the server's revision", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(5, "2026-10-19T10:03:00.000Z"))
      .mockResolvedValueOnce({
        revision: 6,
        savedAt: "2026-10-19T10:04:00.000Z",
      });
    const { result, rerender } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    rerender({ payload: { title: "Mine, still typing" } });
    act(() => result.current.keepThisVersion());
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(2);
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Mine, still typing" },
      baseRevision: 5,
    });
    expect(result.current.conflict).toBeNull();
    expect(result.current.isConflictBusy).toBe(false);
  });

  it("keeps this version on an emptied slot by resending with a null base", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue({
      payload: { title: "Before" },
      payloadVersion: 1,
      revision: 4,
      savedAt: "2026-10-19T09:00:00.000Z",
    });
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(null, null))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { result } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() =>
      expect(result.current.conflict).toEqual({
        revision: null,
        savedAt: null,
      }),
    );
    act(() => result.current.keepThisVersion());
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    expect(sentBodies()[0]?.baseRevision).toBe(4);
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Mine" },
      baseRevision: null,
    });
    expect(result.current.conflict).toBeNull();
  });

  it("loads the newer draft on request and hands it to the editor", async () => {
    const newerDraft: CreatorDraftResponse = {
      payload: { title: "Other tab" },
      payloadVersion: 1,
      revision: 6,
      savedAt: "2026-10-19T10:05:00.000Z",
    };
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(newerDraft);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(6, newerDraft.savedAt))
      .mockResolvedValueOnce({
        revision: 7,
        savedAt: "2026-10-19T10:06:00.000Z",
      });
    const { result, rerender } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    let loaded: CreatorDraftResponse | null = null;
    await act(async () => {
      loaded = await result.current.loadNewer();
    });
    expect(loaded).toEqual(newerDraft);
    expect(result.current.conflict).toBeNull();
    rerender({ payload: { title: "Other tab, edited" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(2);
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Other tab, edited" },
      baseRevision: 6,
    });
  });

  it("keeps the typed payload when the newer draft turns out to be gone", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(null, null))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { result } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    await act(async () => {
      await expect(result.current.loadNewer()).resolves.toBeNull();
    });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Mine" },
      baseRevision: null,
    });
  });
});

describe("useCreatorDraftAutosave failures", () => {
  it("stops quietly on a feature-off 404", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockRejectedValue(
      new ApiError(404, "This feature is not available yet.", {
        message: "This feature is not available yet.",
      }),
    );
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(result.current.status).toEqual({ kind: "idle" });
    rerender({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    expect(result.current.status).toEqual({ kind: "idle" });
  });

  it("retries a network failure with growing delays and says so", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { result } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("retrying"));
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
  });

  it("keeps the retry backoff while the creator types and sends the newest body", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new ApiError(503, "Down"))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("retrying"));
    rerender({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(2_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(2);
    expect(sentBodies()[1]).toMatchObject({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(2);
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(3);
  });

  it("stops on a 413 until the payload changes", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(
        new ApiError(413, "Draft too large", {
          code: "creator_draft_too_large",
        }),
      )
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { result, rerender } = renderAutosave({
      payload: { title: "Huge" },
    });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("tooLarge"));
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    rerender({ payload: { title: "Smaller" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(2);
    expect(sentBodies()[1]).toMatchObject({ payload: { title: "Smaller" } });
  });
});

describe("useCreatorDraftAutosave clearing", () => {
  it("deletes the slot when the editor goes back to clean after a save", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        payload: { title: "A" },
        payloadVersion: 1,
        revision: 1,
        savedAt: SAVED_AT,
      });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(deleteCreatorDraft).toHaveBeenCalledTimes(1));
    expect(getCreatorDraft).toHaveBeenCalledTimes(2);
    expect(deleteCreatorDraft).toHaveBeenCalledWith(EVENT_SLOT);
  });

  it("leaves a clean editor's slot alone when another tab saved since", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        payload: { title: "Other tab" },
        payloadVersion: 1,
        revision: 9,
        savedAt: "2026-10-19T10:09:00.000Z",
      });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(getCreatorDraft).toHaveBeenCalledTimes(2));
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(deleteCreatorDraft).not.toHaveBeenCalled();
  });

  it("keeps quiet when the automatic delete of a clean editor fails", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        payload: { title: "A" },
        payloadVersion: 1,
        revision: 1,
        savedAt: SAVED_AT,
      });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    vi.mocked(deleteCreatorDraft).mockRejectedValue(new ApiError(500, "Down"));
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(deleteCreatorDraft).toHaveBeenCalledTimes(1));
    expect(result.current.status.kind).toBe("saved");
  });

  it("forgets after a publish with no request in live", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender, client } = renderAutosave({
      payload: { title: "Published soon" },
    });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    act(() => result.current.forget());
    expect(deleteCreatorDraft).not.toHaveBeenCalled();
    expect(client.getQueryData(["creator-draft", "event", "", false])).toBe(
      null,
    );
    rerender({ payload: { title: "After publish" }, isEnabled: false });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    expect(result.current.serverDraft).toBeNull();
  });

  it("discards the slot on request and saves the next change on a null base", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue({
      payload: { title: "Old" },
      payloadVersion: 1,
      revision: 3,
      savedAt: "2026-10-19T09:00:00.000Z",
    });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender, client } = renderAutosave({ payload: null });
    await waitFor(() => expect(result.current.serverDraft?.revision).toBe(3));
    await act(() => result.current.discard());
    expect(deleteCreatorDraft).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(["creator-draft", "event", "", false])).toBe(
      null,
    );
    expect(result.current.serverDraft).toBeNull();
    rerender({ payload: { title: "Fresh" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(sentBodies()[0]).toMatchObject({
      payload: { title: "Fresh" },
      baseRevision: null,
    });
  });

  it("saves to the demo store in demo with no request", async () => {
    mockDemoMode.current = true;
    const { result } = renderAutosave({ payload: { title: "Demo picnic" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
    await expect(demoGetCreatorDraft(EVENT_SLOT)).resolves.toMatchObject({
      revision: 1,
      payload: { title: "Demo picnic" },
    });
    act(() => result.current.forget());
    await waitFor(async () =>
      expect(await demoGetCreatorDraft(EVENT_SLOT)).toBeNull(),
    );
    expect(getCreatorDraft).not.toHaveBeenCalled();
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    expect(deleteCreatorDraft).not.toHaveBeenCalled();
  });
});

describe("useCreatorDraftAutosave pauses and backoff", () => {
  it("saves an edit typed while a 413 request was out", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let rejectFirstSave: (error: unknown) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((_resolve, reject) => {
            rejectFirstSave = reject;
          }),
      )
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const { rerender } = renderAutosave({ payload: { title: "Huge" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    rerender({ payload: { title: "Huge, trimmed" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    await act(async () => {
      rejectFirstSave(
        new ApiError(413, "Draft too large", {
          code: "creator_draft_too_large",
        }),
      );
      await Promise.resolve();
    });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Huge, trimmed" },
    });
  });

  it("sends nothing for a slot whose read met the feature-off 404", async () => {
    vi.mocked(getCreatorDraft).mockRejectedValue(
      new ApiError(404, "This feature is not available yet.", {
        message: "This feature is not available yet.",
      }),
    );
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    rerender({ payload: { title: "AB" } });
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    expect(result.current.status).toEqual({ kind: "idle" });
  });

  it("starts the retry backoff over after a conflict and Keep this version", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(conflictError(5, "2026-10-19T10:03:00.000Z"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ revision: 6, savedAt: SAVED_AT });
    const { result } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("retrying"));
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    act(() => result.current.keepThisVersion());
    await waitFor(() => expect(result.current.status.kind).toBe("retrying"));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(3);
    // The first step again (5 s), where a carried attempt count would wait 15 s.
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(result.current.status.kind).toBe("saved"));
  });
});

describe("useCreatorDraftAutosave sign-out and remounts", () => {
  it("keeps a pending live body out of the cache after sign-out", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const { result, rerender, unmount, client } = renderAutosave({
      payload: null,
    });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Pending words" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      signOutDrafts(client);
      unmount();
    });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
    expect(client.getQueryData(eventKey(false)) ?? null).toBeNull();
  });

  it("keeps a pending demo body out of the emptied demo store after sign-out", async () => {
    mockDemoMode.current = true;
    const { result, rerender, unmount, client } = renderAutosave({
      payload: null,
    });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Pending demo words" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      signOutDrafts(client);
      unmount();
    });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await expect(demoGetCreatorDraft(EVENT_SLOT)).resolves.toBeNull();
    expect(client.getQueryData(eventKey(true)) ?? null).toBeNull();
    expect(saveCreatorDraft).not.toHaveBeenCalled();
  });

  it("drops a live save that lands after sign-out", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let releaseSave: (saved: CreatorDraftSaved) => void = () => undefined;
    vi.mocked(saveCreatorDraft).mockImplementationOnce(
      () =>
        new Promise<CreatorDraftSaved>((resolve) => {
          releaseSave = resolve;
        }),
    );
    const { unmount, client } = renderAutosave({
      payload: { title: "On the wire" },
    });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    act(() => {
      signOutDrafts(client);
      unmount();
    });
    await act(async () => {
      releaseSave({ revision: 1, savedAt: SAVED_AT });
      await Promise.resolve();
    });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(client.getQueryData(eventKey(false)) ?? null).toBeNull();
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("reattaches after a remount mid-save and saves on the revision it answered", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let releaseFirstSave: (saved: CreatorDraftSaved) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((resolve) => {
            releaseFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce({ revision: 2, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    first.unmount();
    const second = renderAutosave({ payload: { title: "AB" } }, first.client);
    await waitFor(() =>
      expect(second.result.current.isServerDraftLoading).toBe(true),
    );
    await act(async () => {
      releaseFirstSave({ revision: 1, savedAt: SAVED_AT });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(second.result.current.serverDraft?.revision).toBe(1),
    );
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "AB" },
      baseRevision: 1,
    });
  });

  it("makes one flush attempt after unmount and schedules no retry", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    const { result, rerender, unmount } = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Leaving" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    unmount();
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));
    await act(() => vi.advanceTimersByTimeAsync(120_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("retires the live engine without sending when demo mode switches on", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    const { result, rerender } = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(result.current.isServerDraftLoading).toBe(false),
    );
    rerender({ payload: { title: "Typed live" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    mockDemoMode.current = true;
    rerender({ payload: { title: "Typed live" } });
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(saveCreatorDraft).not.toHaveBeenCalled();
  });
});

describe("useCreatorDraftAutosave discard failures", () => {
  it("rejects a failed discard, goes back to idle and saves on the kept revision", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue({
      payload: { title: "Old" },
      payloadVersion: 1,
      revision: 3,
      savedAt: "2026-10-19T09:00:00.000Z",
    });
    vi.mocked(deleteCreatorDraft).mockRejectedValue(new ApiError(500, "Down"));
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 4,
      savedAt: SAVED_AT,
    });
    const { result, rerender } = renderAutosave({ payload: null });
    await waitFor(() => expect(result.current.serverDraft?.revision).toBe(3));
    await act(async () => {
      await expect(result.current.discard()).rejects.toBeInstanceOf(
        CreatorDraftDiscardError,
      );
    });
    expect(result.current.status).toEqual({ kind: "idle" });
    rerender({ payload: { title: "Fresh" } });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    expect(sentBodies()[0]).toMatchObject({
      payload: { title: "Fresh" },
      baseRevision: 3,
    });
  });

  it("adopts the revision of a save that lands before a failed discard", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(deleteCreatorDraft).mockRejectedValue(new ApiError(500, "Down"));
    let releaseFirstSave: (saved: CreatorDraftSaved) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((resolve) => {
            releaseFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce({ revision: 5, savedAt: SAVED_AT });
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    let discarding: Promise<void> = Promise.resolve();
    act(() => {
      discarding = result.current.discard();
    });
    await act(async () => {
      releaseFirstSave({ revision: 4, savedAt: SAVED_AT });
      await expect(discarding).rejects.toBeInstanceOf(CreatorDraftDiscardError);
    });
    expect(deleteCreatorDraft).toHaveBeenCalledTimes(1);
    rerender({ payload: { title: "Next" } });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Next" },
      baseRevision: 4,
    });
  });
});

describe("useCreatorDraftAutosave editor handovers", () => {
  it("sends the old editor's pending body when the next one mounts in the same act", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const first = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(first.result.current.isServerDraftLoading).toBe(false),
    );
    first.rerender({ payload: { title: "Typed in the first editor" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    const second = remountInOneAct(first, { payload: null });
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));
    expect(sentBodies()[0]).toMatchObject({
      payload: { title: "Typed in the first editor" },
    });
    await waitFor(() =>
      expect(second.result.current.serverDraft?.payload).toEqual({
        title: "Typed in the first editor",
      }),
    );
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("carries the old editor's queued body past an in-flight save into the next resume", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let releaseFirstSave: (saved: CreatorDraftSaved) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((resolve) => {
            releaseFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce({ revision: 2, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: { title: "A1" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    first.rerender({ payload: { title: "A2" } });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    const second = remountInOneAct(first, { payload: null, isEnabled: false });
    await act(async () => {
      releaseFirstSave({ revision: 1, savedAt: SAVED_AT });
      await Promise.resolve();
    });
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "A2" },
      baseRevision: 1,
    });
    await waitFor(() =>
      expect(second.result.current.serverDraft?.payload).toEqual({
        title: "A2",
      }),
    );
  });

  it("shares the engine as it stands when a second editor mounts beside the first", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        payload: { title: "A" },
        payloadVersion: 1,
        revision: 1,
        savedAt: SAVED_AT,
      });
    vi.mocked(saveCreatorDraft).mockResolvedValue({
      revision: 1,
      savedAt: SAVED_AT,
    });
    const first = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(first.result.current.status.kind).toBe("saved"));
    const second = renderAutosave(
      { payload: null, isEnabled: false },
      first.client,
    );
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(first.result.current.isServerDraftLoading).toBe(false);
    expect(second.result.current.status.kind).toBe("saved");
    // The first editor still owns its save, so going clean deletes it.
    first.rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() => expect(deleteCreatorDraft).toHaveBeenCalledTimes(1));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });
});

describe("useCreatorDraftAutosave stale status lines", () => {
  it("clears retrying when the retry finds a clean editor", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    const { result, rerender } = renderAutosave({ payload: { title: "A" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("retrying"));
    rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    await waitFor(() =>
      expect(result.current.status).toEqual({ kind: "idle" }),
    );
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("clears too large when the editor goes back to clean", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft).mockRejectedValueOnce(
      new ApiError(413, "Draft too large", { code: "creator_draft_too_large" }),
    );
    const { result, rerender } = renderAutosave({ payload: { title: "Huge" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("tooLarge"));
    rerender({ payload: null });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() =>
      expect(result.current.status).toEqual({ kind: "idle" }),
    );
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
  });
});

describe("useCreatorDraftAutosave carried body outcomes", () => {
  it("holds a carried body behind a failed in-flight save until the backoff ends", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    let rejectFirstSave: (error: unknown) => void = () => undefined;
    vi.mocked(saveCreatorDraft)
      .mockImplementationOnce(
        () =>
          new Promise<CreatorDraftSaved>((_resolve, reject) => {
            rejectFirstSave = reject;
          }),
      )
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: { title: "A1" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    first.rerender({ payload: { title: "A2" } });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    const second = remountInOneAct(first, { payload: null, isEnabled: false });
    await act(async () => {
      rejectFirstSave(new TypeError("Failed to fetch"));
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(second.result.current.status.kind).toBe("retrying"),
    );
    await act(() => vi.advanceTimersByTimeAsync(4_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(1_500));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "A2" },
      baseRevision: null,
    });
    await waitFor(() =>
      expect(second.result.current.serverDraft?.payload).toEqual({
        title: "A2",
      }),
    );
  });

  it("retries a carried save that met a network failure after its backoff", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(first.result.current.isServerDraftLoading).toBe(false),
    );
    first.rerender({ payload: { title: "Typed in A" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    const second = remountInOneAct(first, { payload: null, isEnabled: false });
    await waitFor(() =>
      expect(second.result.current.status.kind).toBe("retrying"),
    );
    await act(() => vi.advanceTimersByTimeAsync(4_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(1_500));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Typed in A" },
    });
    await waitFor(() =>
      expect(second.result.current.serverDraft?.payload).toEqual({
        title: "Typed in A",
      }),
    );
  });

  it("keeps a carried body through a 409 and sends it on Keep this version", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(7, "2026-10-19T10:07:00.000Z"))
      .mockResolvedValueOnce({ revision: 8, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(first.result.current.isServerDraftLoading).toBe(false),
    );
    first.rerender({ payload: { title: "Mine in A" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    const second = remountInOneAct(first, { payload: null, isEnabled: false });
    await waitFor(() =>
      expect(second.result.current.status.kind).toBe("conflict"),
    );
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    act(() => second.result.current.keepThisVersion());
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Mine in A" },
      baseRevision: 7,
    });
    await waitFor(() =>
      expect(second.result.current.status.kind).toBe("saved"),
    );
  });

  it("keeps a stopped carried save's line until the next editor types", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(null);
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(new ApiError(403, "Forbidden"))
      .mockResolvedValueOnce({ revision: 1, savedAt: SAVED_AT });
    const first = renderAutosave({ payload: null });
    await waitFor(() =>
      expect(first.result.current.isServerDraftLoading).toBe(false),
    );
    first.rerender({ payload: { title: "Typed in A" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    const second = remountInOneAct(first, { payload: null, isEnabled: false });
    await waitFor(() =>
      expect(second.result.current.status.kind).toBe("notSaved"),
    );
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(second.result.current.status.kind).toBe("notSaved");
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    second.rerender({ payload: { title: "New edit in B" } });
    await waitFor(() =>
      expect(second.result.current.status.kind).not.toBe("notSaved"),
    );
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "New edit in B" },
    });
  });
});

describe("useCreatorDraftAutosave unreadable newer drafts", () => {
  it("keeps the pause and the conflict when the newer draft is unreadable", async () => {
    vi.mocked(getCreatorDraft)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        payload: { unexpected: ["shape"] },
        payloadVersion: 1,
        revision: 6,
        savedAt: "2026-10-19T10:05:00.000Z",
      });
    vi.mocked(saveCreatorDraft)
      .mockRejectedValueOnce(conflictError(5, "2026-10-19T10:03:00.000Z"))
      .mockResolvedValueOnce({ revision: 7, savedAt: SAVED_AT });
    const { result } = renderAutosave({ payload: { title: "Mine" } });
    await act(() => vi.advanceTimersByTimeAsync(1500));
    await waitFor(() => expect(result.current.status.kind).toBe("conflict"));
    const isReadable = vi.fn(
      (payload: Record<string, unknown>) => typeof payload.title === "string",
    );
    await act(async () => {
      await expect(
        result.current.loadNewer({ isReadable }),
      ).resolves.toBeNull();
    });
    expect(isReadable).toHaveBeenCalledWith({ unexpected: ["shape"] });
    expect(result.current.status).toEqual({ kind: "conflict" });
    expect(result.current.conflict).toEqual({
      revision: 5,
      savedAt: "2026-10-19T10:03:00.000Z",
    });
    expect(result.current.isConflictBusy).toBe(false);
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(saveCreatorDraft).toHaveBeenCalledTimes(1);
    act(() => result.current.keepThisVersion());
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({
      payload: { title: "Mine" },
      baseRevision: 5,
    });
  });
});
