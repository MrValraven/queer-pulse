import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { forumDraftQueryKey, type ForumDraft } from "./api/forumDrafts.api";
import { useForumComposerDraft } from "./useForumComposerDraft";

/**
 * ENG-421 and ENG-422: the forum composer's autosave recovers from a version
 * conflict (the tab being typed in wins), says so when a save still fails and
 * tries again later, runs one save at a time so newer text lands last, writes
 * a save still waiting on its debounce when the composer unmounts or the page
 * is hidden, and never writes one back after `clearDraft`.
 *
 * Live mode throughout, with the drafts API mocked at the module edge so each
 * test scripts the server's answers in order.
 */

const mocks = vi.hoisted(() => ({
  getForumDraft: vi.fn(),
  createForumDraft: vi.fn(),
  updateForumDraft: vi.fn(),
  deleteForumDraft: vi.fn(),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../../app/providers/useStorageScope", () => ({
  useStorageScope: () => "member-1",
}));

vi.mock("../../shared/observability/logger", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../shared/observability/logger")
  >()),
  logError: vi.fn(),
}));

vi.mock("./api/forumDrafts.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/forumDrafts.api")>()),
  getForumDraft: mocks.getForumDraft,
  createForumDraft: mocks.createForumDraft,
  updateForumDraft: mocks.updateForumDraft,
  deleteForumDraft: mocks.deleteForumDraft,
}));

const DRAFT_ID = "forum-reply-test-thread";
const AUTOSAVE_DELAY_MS = 1500;
const AUTOSAVE_RETRY_MS = 10000;

function storedDraft(version: number, desc = ""): ForumDraft {
  return {
    id: DRAFT_ID,
    kind: "REPLY",
    kindVariant: "post",
    title: "Reply",
    desc,
    progress: 0,
    category: "posts",
    version,
  };
}

function conflict(currentVersion?: number) {
  return new ApiError(
    409,
    "This draft changed since you loaded it.",
    currentVersion === undefined ? { message: "conflict" } : { currentVersion },
  );
}

/** A promise the test settles by hand, to hold a request on the network. */
function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<Value>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function renderDraftHook(initialBody: string) {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const rendered = renderHook(
    ({ body }: { body: string }) =>
      useForumComposerDraft({
        draftId: DRAFT_ID,
        body,
        onRestore: () => undefined,
        title: "Reply",
        href: "/forum/test-thread",
        kind: "REPLY",
      }),
    { wrapper, initialProps: { body: initialBody } },
  );
  return { ...rendered, queryClient };
}

/** Lets the async restore settle before any debounce is timed. */
async function settleRestore() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useForumComposerDraft conflict recovery", () => {
  it("recovers from a create 409 by adopting the stored version", async () => {
    // The restore read failed to find the row (or failed outright), so the
    // composer believes there is nothing to patch and tries a create.
    mocks.getForumDraft
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(storedDraft(4, "text from another tab"));
    mocks.createForumDraft.mockRejectedValueOnce(conflict());
    mocks.updateForumDraft.mockResolvedValueOnce(storedDraft(5, "Hello"));

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);

    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.getForumDraft).toHaveBeenCalledTimes(2);
    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.updateForumDraft).toHaveBeenNthCalledWith(
      1,
      DRAFT_ID,
      expect.objectContaining({ body: "Hello" }),
      4,
    );
    expect(result.current.status).toBe("saved");
  });

  it("recovers from a stale version using currentVersion", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(storedDraft(2, "older text"));
    mocks.updateForumDraft
      .mockRejectedValueOnce(conflict(7))
      .mockResolvedValueOnce(storedDraft(8, "Hello"));

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);

    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(2);
    expect(mocks.updateForumDraft).toHaveBeenNthCalledWith(
      1,
      DRAFT_ID,
      expect.anything(),
      2,
    );
    expect(mocks.updateForumDraft).toHaveBeenNthCalledWith(
      2,
      DRAFT_ID,
      expect.anything(),
      7,
    );
    // The 409 carried the version, so no extra read was needed.
    expect(mocks.getForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.createForumDraft).not.toHaveBeenCalled();
    expect(result.current.status).toBe("saved");
  });

  it("shows unsaved after a second failure and retries later", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(storedDraft(2));
    mocks.updateForumDraft
      .mockRejectedValueOnce(conflict(3))
      .mockRejectedValueOnce(conflict(4))
      .mockResolvedValueOnce(storedDraft(5, "Hello"));

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);

    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("unsaved");

    await advance(AUTOSAVE_RETRY_MS + AUTOSAVE_DELAY_MS);

    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(3);
    // The second 409's version was kept, so the retry starts from it.
    expect(mocks.updateForumDraft).toHaveBeenNthCalledWith(
      3,
      DRAFT_ID,
      expect.objectContaining({ body: "Hello" }),
      4,
    );
    expect(result.current.status).toBe("saved");
  });

  it("stops retrying on its own after a permanent refusal", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(storedDraft(2));
    mocks.updateForumDraft.mockRejectedValueOnce(
      new ApiError(400, "Bad request"),
    );

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);
    expect(result.current.status).toBe("unsaved");

    await advance((AUTOSAVE_RETRY_MS + AUTOSAVE_DELAY_MS) * 2);

    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("unsaved");
  });

  it("runs one save at a time so the newer text lands last", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(storedDraft(2));
    const firstWrite = deferred<ForumDraft>();
    mocks.updateForumDraft
      .mockReturnValueOnce(firstWrite.promise)
      .mockResolvedValueOnce(storedDraft(4, "Hello there"));

    const { rerender, unmount } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);
    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(1);

    // Newer text, then leaving: the flushed save waits behind the first.
    rerender({ body: "Hello there" });
    unmount();
    await advance(0);
    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstWrite.resolve(storedDraft(3, "Hello"));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mocks.updateForumDraft).toHaveBeenCalledTimes(2);
    expect(mocks.updateForumDraft).toHaveBeenNthCalledWith(
      2,
      DRAFT_ID,
      expect.objectContaining({ body: "Hello there" }),
      3,
    );
  });
});

describe("useForumComposerDraft flush on leave", () => {
  it("saves the pending text when the composer unmounts", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(null);
    mocks.createForumDraft.mockResolvedValueOnce(storedDraft(1, "Hello there"));

    const { rerender, unmount } = renderDraftHook("Hello");
    await settleRestore();
    // Well inside the debounce window, and with text newer than the save that
    // was first scheduled, so a stale closure would send "Hello".
    await advance(AUTOSAVE_DELAY_MS / 3);
    rerender({ body: "Hello there" });
    await advance(AUTOSAVE_DELAY_MS / 3);
    expect(mocks.createForumDraft).not.toHaveBeenCalled();

    unmount();
    await advance(0);

    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.createForumDraft).toHaveBeenNthCalledWith(
      1,
      DRAFT_ID,
      expect.objectContaining({ body: "Hello there" }),
    );
  });

  it("saves the pending text when the page is hidden", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(null);
    mocks.createForumDraft.mockResolvedValueOnce(storedDraft(1, "Hello"));

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS / 3);
    expect(mocks.createForumDraft).not.toHaveBeenCalled();

    await act(async () => {
      window.dispatchEvent(new Event("pagehide"));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.createForumDraft).toHaveBeenNthCalledWith(
      1,
      DRAFT_ID,
      expect.objectContaining({ body: "Hello" }),
    );
    expect(result.current.status).toBe("saved");
    // The debounce it replaced never fires a second write.
    await advance(AUTOSAVE_DELAY_MS * 2);
    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);
  });

  it("clearDraft cancels a pending save", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(null);

    const { result, unmount } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS / 3);

    await act(async () => {
      await result.current.clearDraft();
    });
    await advance(AUTOSAVE_DELAY_MS * 2);
    unmount();
    await advance(0);

    expect(mocks.createForumDraft).not.toHaveBeenCalled();
    expect(mocks.updateForumDraft).not.toHaveBeenCalled();
  });

  it("a save that fails after clearDraft leaves the composer idle", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(null);
    const write = deferred<ForumDraft>();
    mocks.createForumDraft.mockReturnValueOnce(write.promise);

    const { result } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);
    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.clearDraft();
    });
    await act(async () => {
      write.reject(new ApiError(500, "Server error"));
      await vi.advanceTimersByTimeAsync(0);
    });
    await advance((AUTOSAVE_RETRY_MS + AUTOSAVE_DELAY_MS) * 2);

    expect(result.current.status).toBe("idle");
    expect(mocks.createForumDraft).toHaveBeenCalledTimes(1);
    expect(mocks.updateForumDraft).not.toHaveBeenCalled();
  });

  it("a write that lands after clearDraft is deleted again", async () => {
    mocks.getForumDraft.mockResolvedValueOnce(null);
    const write = deferred<ForumDraft>();
    mocks.createForumDraft.mockReturnValueOnce(write.promise);
    mocks.deleteForumDraft.mockResolvedValue(undefined);

    const { result, queryClient } = renderDraftHook("Hello");
    await settleRestore();
    await advance(AUTOSAVE_DELAY_MS);

    await act(async () => {
      await result.current.clearDraft();
    });
    await act(async () => {
      write.resolve(storedDraft(1, "Hello"));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mocks.deleteForumDraft).toHaveBeenCalledWith(DRAFT_ID);
    expect(queryClient.getQueryData(forumDraftQueryKey(DRAFT_ID))).toBeNull();
    expect(result.current.status).toBe("idle");
  });
});
