import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./data";
import {
  sessionSendsForThreadWindow,
  useThreadWindowSends,
} from "./useThreadWindowSends";

// PRD-401: a send or a retry from the open thread leaves a detached history
// window for the live tail first, which also bumps the thread window's
// cancel count so a jump hunt still on its way ends quietly.

function buildSending(calls: string[]) {
  const record = (name: string) =>
    vi.fn(() => {
      calls.push(name);
    });
  return {
    send: record("send"),
    sendGif: record("sendGif"),
    sendSticker: record("sendSticker"),
    sendImage: record("sendImage"),
    sendDocument: record("sendDocument"),
    retrySend: record("retrySend"),
  };
}

const FAILED_MESSAGE: ChatMessage = {
  from: "me",
  text: "hello",
  time: "now",
  status: "failed",
  localId: "local-1",
};

describe("useThreadWindowSends", () => {
  it("returns to the latest message before a retry re-sends the failed bubble", () => {
    const calls: string[] = [];
    const sending = buildSending(calls);
    const returnToLatest = vi.fn(() => {
      calls.push("returnToLatest");
    });
    const { result } = renderHook(() =>
      useThreadWindowSends(sending, returnToLatest),
    );

    result.current.retrySend(FAILED_MESSAGE);

    expect(calls).toEqual(["returnToLatest", "retrySend"]);
    expect(sending.retrySend).toHaveBeenCalledWith(FAILED_MESSAGE);
  });

  it("returns to the latest message before every composer send", () => {
    const calls: string[] = [];
    const sending = buildSending(calls);
    const returnToLatest = vi.fn(() => {
      calls.push("returnToLatest");
    });
    const { result } = renderHook(() =>
      useThreadWindowSends(sending, returnToLatest),
    );

    result.current.send("hi");
    result.current.sendGif({} as never);
    result.current.sendSticker({} as never);
    result.current.sendImage({} as never);
    result.current.sendDocument({} as never);

    expect(calls).toEqual([
      "returnToLatest",
      "send",
      "returnToLatest",
      "sendGif",
      "returnToLatest",
      "sendSticker",
      "returnToLatest",
      "sendImage",
      "returnToLatest",
      "sendDocument",
    ]);
  });

  it("keeps the retry wrapper's identity while its inputs hold still", () => {
    const sending = buildSending([]);
    const returnToLatest = vi.fn();
    const { result, rerender } = renderHook(() =>
      useThreadWindowSends(sending, returnToLatest),
    );
    const firstRetry = result.current.retrySend;

    rerender();

    expect(result.current.retrySend).toBe(firstRetry);
  });
});

describe("sessionSendsForThreadWindow", () => {
  const sessionSends = { "conv-1": [FAILED_MESSAGE] };

  it("hands the live tail its session sends", () => {
    expect(sessionSendsForThreadWindow(sessionSends, false)).toBe(sessionSends);
  });

  it("hands a detached window no session sends", () => {
    expect(sessionSendsForThreadWindow(sessionSends, true)).toEqual({});
  });
});
