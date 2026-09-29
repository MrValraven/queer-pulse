import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { MessageHistoryWindow } from "./messages.api";
import { useThreadWindow } from "./useThreadWindow";

const apiMocks = vi.hoisted(() => ({
  getMessagesAround: vi.fn(),
}));

vi.mock("./messages.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./messages.api")>()),
  ...apiMocks,
}));

/**
 * PRD-401: loading a history window and showing it are two steps, so only
 * the current request can ever detach the thread. A newer request or a
 * return to the latest message (a send, a pill tap) cancels one still
 * loading.
 */

const CONVERSATION_ID = "c1";

function windowResponse(): MessageHistoryWindow {
  return {
    data: [],
    // Newer history remains, so the window stays shown (a window that
    // already reaches the tail merges straight into the live thread).
    pageInfo: {
      nextCursor: null,
      hasMore: false,
      hasNewer: true,
      newerAfter: "2026-03-10T12:00:00.000001Z",
      newerAfterId: "0b000000-0000-4000-8000-000000000001",
    },
  };
}

function deferredWindow() {
  let resolve: (value: MessageHistoryWindow) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<MessageHistoryWindow>((settle, fail) => {
    resolve = settle;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function renderThreadWindow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useThreadWindow(CONVERSATION_ID, false), {
    wrapper,
  });
}

describe("useThreadWindow: loading and showing a window", () => {
  beforeEach(() => {
    apiMocks.getMessagesAround.mockReset();
  });

  it("loads a window without showing it, and shows it through showWindow", async () => {
    apiMocks.getMessagesAround.mockResolvedValue(windowResponse());
    const { result } = renderThreadWindow();

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.controls.openWindowAround("target");
    });
    expect(outcome).toBe("ready");
    expect(result.current.controls.anchorMessageId).toBeNull();

    let isShown = false;
    act(() => {
      isShown = result.current.controls.showWindow("target");
    });
    expect(isShown).toBe(true);
    expect(result.current.controls.anchorMessageId).toBe("target");
  });

  it("cancels a window still loading when the reader returns to the latest message", async () => {
    const pending = deferredWindow();
    apiMocks.getMessagesAround.mockReturnValue(pending.promise);
    const { result } = renderThreadWindow();

    let outcomePromise: Promise<string> = Promise.resolve("");
    act(() => {
      outcomePromise = result.current.controls.openWindowAround("target");
    });
    act(() => {
      result.current.controls.onReturnToLatest();
    });
    await act(async () => {
      pending.resolve(windowResponse());
      await outcomePromise;
    });

    expect(await outcomePromise).toBe("cancelled");
    let isShown = true;
    act(() => {
      isShown = result.current.controls.showWindow("target");
    });
    expect(isShown).toBe(false);
    expect(result.current.controls.anchorMessageId).toBeNull();
  });

  it("lets a newer request supersede an older one, whichever answers first", async () => {
    const older = deferredWindow();
    const newer = deferredWindow();
    apiMocks.getMessagesAround
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    const { result } = renderThreadWindow();

    let olderOutcome: Promise<string> = Promise.resolve("");
    let newerOutcome: Promise<string> = Promise.resolve("");
    act(() => {
      olderOutcome = result.current.controls.openWindowAround("first");
      newerOutcome = result.current.controls.openWindowAround("second");
    });
    await act(async () => {
      newer.resolve(windowResponse());
      older.resolve(windowResponse());
      await Promise.all([olderOutcome, newerOutcome]);
    });

    expect(await olderOutcome).toBe("cancelled");
    expect(await newerOutcome).toBe("ready");
    act(() => {
      expect(result.current.controls.showWindow("first")).toBe(false);
    });
    act(() => {
      expect(result.current.controls.showWindow("second")).toBe(true);
    });
    expect(result.current.controls.anchorMessageId).toBe("second");
  });

  it("reads a 404 as not found", async () => {
    apiMocks.getMessagesAround.mockRejectedValue(
      new ApiError(404, "Message not found"),
    );
    const { result } = renderThreadWindow();

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.controls.openWindowAround("missing");
    });

    expect(outcome).toBe("notFound");
    expect(result.current.controls.anchorMessageId).toBeNull();
  });
});

describe("useThreadWindow: the cancel count a jump hunt reads", () => {
  beforeEach(() => {
    apiMocks.getMessagesAround.mockReset();
  });

  it("counts a return to the latest message on the live tail, with no render and no generation bump", () => {
    const { result } = renderThreadWindow();
    const controlsBefore = result.current.controls;
    expect(controlsBefore.readCancelCount()).toBe(0);

    act(() => {
      result.current.controls.onReturnToLatest();
    });
    act(() => {
      result.current.controls.onReturnToLatest();
    });

    expect(result.current.controls.readCancelCount()).toBe(2);
    expect(result.current.controls.returnToLatestGeneration).toBe(0);
    // No state changed, so the scroll layer sees the very same controls.
    expect(result.current.controls).toBe(controlsBefore);
  });

  it("counts a return that cancels a window still loading", async () => {
    const pending = deferredWindow();
    apiMocks.getMessagesAround.mockReturnValue(pending.promise);
    const { result } = renderThreadWindow();

    let outcomePromise: Promise<string> = Promise.resolve("");
    act(() => {
      outcomePromise = result.current.controls.openWindowAround("target");
    });
    act(() => {
      result.current.controls.onReturnToLatest();
    });
    await act(async () => {
      pending.resolve(windowResponse());
      await outcomePromise;
    });

    expect(result.current.controls.readCancelCount()).toBe(1);
    expect(result.current.controls.returnToLatestGeneration).toBe(0);
  });

  it("counts a return that drops a shown window, and bumps the generation once", async () => {
    apiMocks.getMessagesAround.mockResolvedValue(windowResponse());
    const { result } = renderThreadWindow();
    await act(async () => {
      await result.current.controls.openWindowAround("target");
    });
    act(() => {
      result.current.controls.showWindow("target");
    });
    expect(result.current.controls.readCancelCount()).toBe(0);

    act(() => {
      result.current.controls.onReturnToLatest();
    });

    expect(result.current.controls.anchorMessageId).toBeNull();
    expect(result.current.controls.readCancelCount()).toBe(1);
    expect(result.current.controls.returnToLatestGeneration).toBe(1);
  });

  it("leaves the count alone when a newer request supersedes an older one", async () => {
    apiMocks.getMessagesAround.mockResolvedValue(windowResponse());
    const { result } = renderThreadWindow();

    await act(async () => {
      await Promise.all([
        result.current.controls.openWindowAround("first"),
        result.current.controls.openWindowAround("second"),
      ]);
    });
    act(() => {
      result.current.controls.showWindow("second");
    });

    expect(result.current.controls.readCancelCount()).toBe(0);
  });
});
