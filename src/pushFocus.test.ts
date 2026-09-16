import { describe, expect, it } from "vitest";
import {
  PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
  type PushBridgeMessageTarget,
} from "./pushBridge";
import { isAnyWindowViewingConversation, isViewingTarget } from "./pushFocus";

/** A window double that answers the bridge with `reply`, or stays silent. */
function bridgeWindow(
  reply: unknown,
  receivedMessages: unknown[] = [],
): PushBridgeMessageTarget {
  return {
    postMessage(message, transfer) {
      receivedMessages.push(message);
      const port = transfer[0];
      if (reply !== undefined && port instanceof MessagePort) {
        port.postMessage(reply);
      }
    },
  };
}

describe("isAnyWindowViewingConversation", () => {
  it("is false with no focused windows", async () => {
    await expect(isAnyWindowViewingConversation([], "conv-1")).resolves.toBe(
      false,
    );
  });

  it("is true when any focused window reports the conversation on screen", async () => {
    await expect(
      isAnyWindowViewingConversation(
        [bridgeWindow({ isViewing: false }), bridgeWindow({ isViewing: true })],
        "conv-1",
      ),
    ).resolves.toBe(true);
  });

  it("is false when every window says no", async () => {
    await expect(
      isAnyWindowViewingConversation(
        [bridgeWindow({ isViewing: false })],
        "conv-1",
      ),
    ).resolves.toBe(false);
  });

  it("counts a silent window and a malformed reply as not viewing", async () => {
    await expect(
      isAnyWindowViewingConversation(
        [bridgeWindow(undefined), bridgeWindow({ isViewing: "yes" })],
        "conv-1",
        20,
      ),
    ).resolves.toBe(false);
  });

  it("asks each window about the push's conversation", async () => {
    const receivedMessages: unknown[] = [];
    await isAnyWindowViewingConversation(
      [bridgeWindow({ isViewing: false }, receivedMessages)],
      "conv-7",
    );
    expect(receivedMessages).toEqual([
      { type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION, conversationId: "conv-7" },
    ]);
  });
});

describe("isViewingTarget", () => {
  it("matches when the focused window is on the exact same conversation", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-1",
        "/messages?c=conv-1",
      ),
    ).toBe(true);
  });

  it("does not match a different conversation on the same page", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-2",
        "/messages?c=conv-1",
      ),
    ).toBe(false);
  });

  it("does not match the bare conversation list (no conversation open)", () => {
    expect(
      isViewingTarget("https://app.example.com/messages", "/messages?c=conv-1"),
    ).toBe(false);
  });

  it("does not match a different page entirely", () => {
    expect(
      isViewingTarget("https://app.example.com/feed", "/messages?c=conv-1"),
    ).toBe(false);
  });

  it("does not match across a different origin", () => {
    // The push target is the app's own absolute URL; the open window is on a
    // foreign origin showing the same path. Origins differ → never suppress.
    // (A *relative* dataUrl has no inherent origin — it resolves against the
    // client — so an absolute target is how a cross-origin mismatch is
    // expressed; in the real service worker `clients.matchAll()` only ever
    // returns same-origin windows, so this is defence-in-depth.)
    expect(
      isViewingTarget(
        "https://evil.example/messages?c=conv-1",
        "https://app.example.com/messages?c=conv-1",
      ),
    ).toBe(false);
  });

  it("resolves an absolute data URL the same way as a relative path", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-1",
        "https://app.example.com/messages?c=conv-1",
      ),
    ).toBe(true);
  });

  it("returns false rather than throwing on a malformed client URL", () => {
    expect(isViewingTarget("not-a-url", "/messages?c=conv-1")).toBe(false);
  });

  it("returns false when either argument is empty", () => {
    expect(isViewingTarget("", "/messages?c=conv-1")).toBe(false);
    expect(isViewingTarget("https://app.example.com/messages", "")).toBe(false);
  });
});
