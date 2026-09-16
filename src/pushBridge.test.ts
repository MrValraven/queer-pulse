import { describe, expect, it } from "vitest";
import {
  PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
  PUSH_BRIDGE_NAVIGATE,
  type PushBridgeMessageTarget,
  isIsViewingConversationReply,
  isIsViewingConversationRequest,
  isNavigateReply,
  isNavigateRequest,
  requestPushBridgeReply,
} from "./pushBridge";

describe("pushBridge request guards", () => {
  it("accepts a well-formed is-viewing request", () => {
    expect(
      isIsViewingConversationRequest({
        type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
        conversationId: "conv-1",
      }),
    ).toBe(true);
  });

  it("rejects an is-viewing request with the wrong type or no conversation", () => {
    expect(
      isIsViewingConversationRequest({
        type: PUSH_BRIDGE_NAVIGATE,
        conversationId: "conv-1",
      }),
    ).toBe(false);
    expect(
      isIsViewingConversationRequest({
        type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
        conversationId: "",
      }),
    ).toBe(false);
    expect(
      isIsViewingConversationRequest({
        type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
      }),
    ).toBe(false);
    expect(isIsViewingConversationRequest(null)).toBe(false);
    expect(isIsViewingConversationRequest("qp:is-viewing-conversation")).toBe(
      false,
    );
  });

  it("accepts a well-formed navigate request", () => {
    expect(
      isNavigateRequest({ type: PUSH_BRIDGE_NAVIGATE, url: "/messages?c=c1" }),
    ).toBe(true);
  });

  it("rejects a navigate request with the wrong type or a non-string url", () => {
    expect(
      isNavigateRequest({
        type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
        url: "/messages",
      }),
    ).toBe(false);
    expect(isNavigateRequest({ type: PUSH_BRIDGE_NAVIGATE, url: 42 })).toBe(
      false,
    );
    expect(isNavigateRequest({ type: PUSH_BRIDGE_NAVIGATE, url: "" })).toBe(
      false,
    );
    expect(isNavigateRequest([PUSH_BRIDGE_NAVIGATE])).toBe(false);
  });
});

describe("pushBridge reply guards", () => {
  it("accepts boolean replies only", () => {
    expect(isIsViewingConversationReply({ isViewing: true })).toBe(true);
    expect(isIsViewingConversationReply({ isViewing: false })).toBe(true);
    expect(isIsViewingConversationReply({ isViewing: "true" })).toBe(false);
    expect(isIsViewingConversationReply({})).toBe(false);
    expect(isIsViewingConversationReply(undefined)).toBe(false);

    expect(isNavigateReply({ isHandled: true })).toBe(true);
    expect(isNavigateReply({ isHandled: false })).toBe(true);
    expect(isNavigateReply({ isHandled: 1 })).toBe(false);
    expect(isNavigateReply(null)).toBe(false);
  });
});

/** A target that answers every request on the transferred port. */
function answeringTarget(reply: unknown): PushBridgeMessageTarget {
  return {
    postMessage(_message, transfer) {
      const port = transfer[0];
      if (port instanceof MessagePort) port.postMessage(reply);
    },
  };
}

describe("requestPushBridgeReply", () => {
  const request = {
    type: PUSH_BRIDGE_IS_VIEWING_CONVERSATION,
    conversationId: "conv-1",
  } as const;

  it("resolves with a reply that passes the guard", async () => {
    await expect(
      requestPushBridgeReply(
        answeringTarget({ isViewing: true }),
        request,
        isIsViewingConversationReply,
      ),
    ).resolves.toEqual({ isViewing: true });
  });

  it("resolves null for a reply the guard refuses", async () => {
    await expect(
      requestPushBridgeReply(
        answeringTarget({ isViewing: "yes" }),
        request,
        isIsViewingConversationReply,
      ),
    ).resolves.toBeNull();
  });

  it("resolves null when the target never answers", async () => {
    const silentTarget: PushBridgeMessageTarget = { postMessage() {} };
    await expect(
      requestPushBridgeReply(
        silentTarget,
        request,
        isIsViewingConversationReply,
        20,
      ),
    ).resolves.toBeNull();
  });

  it("resolves null when postMessage throws", async () => {
    const closedTarget: PushBridgeMessageTarget = {
      postMessage() {
        throw new Error("client is gone");
      },
    };
    await expect(
      requestPushBridgeReply(
        closedTarget,
        request,
        isIsViewingConversationReply,
      ),
    ).resolves.toBeNull();
  });

  it("sends the request itself as the message", async () => {
    let receivedMessage: unknown;
    const recordingTarget: PushBridgeMessageTarget = {
      postMessage(message, transfer) {
        receivedMessage = message;
        const port = transfer[0];
        if (port instanceof MessagePort) port.postMessage({ isHandled: true });
      },
    };
    const navigateRequest = {
      type: PUSH_BRIDGE_NAVIGATE,
      url: "/messages?c=conv-1",
    } as const;
    await expect(
      requestPushBridgeReply(recordingTarget, navigateRequest, isNavigateReply),
    ).resolves.toEqual({ isHandled: true });
    expect(receivedMessage).toEqual(navigateRequest);
  });
});
