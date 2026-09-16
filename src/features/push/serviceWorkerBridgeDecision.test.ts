import { describe, expect, it } from "vitest";
import {
  isMessagesRoute,
  isViewingConversation,
  toInAppNavigationTarget,
} from "./serviceWorkerBridgeDecision";

const ORIGIN = "https://queerpulse.example";

describe("isMessagesRoute", () => {
  it("matches the messages route and paths beneath it", () => {
    expect(isMessagesRoute("/messages")).toBe(true);
    expect(isMessagesRoute("/messages/requests")).toBe(true);
  });

  it("refuses other routes, including look-alike prefixes", () => {
    expect(isMessagesRoute("/")).toBe(false);
    expect(isMessagesRoute("/feed")).toBe(false);
    expect(isMessagesRoute("/messagesboard")).toBe(false);
  });
});

describe("isViewingConversation", () => {
  const viewing = {
    conversationId: "conversation-1",
    activeConversationId: "conversation-1",
    pathname: "/messages",
    visibilityState: "visible" as DocumentVisibilityState,
  };

  it("is true for a visible tab on the messages route with that thread open", () => {
    expect(isViewingConversation(viewing)).toBe(true);
  });

  it("is false when the tab is hidden", () => {
    expect(
      isViewingConversation({ ...viewing, visibilityState: "hidden" }),
    ).toBe(false);
  });

  it("is false when a different thread is open", () => {
    expect(
      isViewingConversation({
        ...viewing,
        activeConversationId: "conversation-2",
      }),
    ).toBe(false);
  });

  it("is false when no thread was requested", () => {
    expect(
      isViewingConversation({ ...viewing, activeConversationId: null }),
    ).toBe(false);
  });

  it("is false when the requested thread outlived the Messages page", () => {
    expect(isViewingConversation({ ...viewing, pathname: "/feed" })).toBe(
      false,
    );
  });
});

describe("toInAppNavigationTarget", () => {
  it("keeps the path, query and hash of a relative url", () => {
    expect(toInAppNavigationTarget("/messages?c=abc#end", ORIGIN)).toBe(
      "/messages?c=abc#end",
    );
  });

  it("accepts an absolute url on the same origin", () => {
    expect(toInAppNavigationTarget(`${ORIGIN}/notifications`, ORIGIN)).toBe(
      "/notifications",
    );
  });

  it("refuses another origin, including a protocol-relative url", () => {
    expect(
      toInAppNavigationTarget("https://elsewhere.example/x", ORIGIN),
    ).toBeNull();
    expect(toInAppNavigationTarget("//elsewhere.example/x", ORIGIN)).toBeNull();
  });
});
