import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./data";
import {
  clearOutboxForScope,
  peekOutbox,
  saveOutbox,
  setMessageOutboxScope,
} from "./outbox";

// ENG-404: an explicit sign-out wipes the signing-out member's unsent outbox
// straight from `AuthProvider`, so the wipe keys off the scope it is handed
// and works whichever scope the module currently points at. Every localId is
// minted fresh because `outbox.ts` keeps a module-level set of known ids.

const BASE_KEY = "qp.messages.outbox.v1";

let idSequence = 0;
function uniqueId(prefix: string): string {
  idSequence += 1;
  return `${prefix}-${idSequence}`;
}

function buildMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "me",
    text: "unsent",
    localId: uniqueId("signout-msg"),
    status: "failed",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  setMessageOutboxScope(null);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  setMessageOutboxScope(null);
});

describe("clearOutboxForScope", () => {
  it("removes the given member's outbox while the store points elsewhere", () => {
    saveOutbox(
      {
        "conversation-1": [buildMessage({ text: "unsent to Sam" })],
        "conversation-2": [buildMessage({ text: "unsent to Rui" })],
      },
      "member-a",
    );

    clearOutboxForScope("member-a");

    expect(window.localStorage.getItem(`${BASE_KEY}.u.member-a`)).toBeNull();
    expect(peekOutbox("member-a")).toEqual({});
  });

  it("also removes the un-suffixed base key", () => {
    saveOutbox({ "conversation-1": [buildMessage()] }, null);

    clearOutboxForScope("member-a");

    expect(window.localStorage.getItem(BASE_KEY)).toBeNull();
  });

  it("leaves another member's bucket in place", () => {
    saveOutbox({ "conversation-1": [buildMessage()] }, "member-b");

    clearOutboxForScope("member-a");

    expect(Object.keys(peekOutbox("member-b"))).toEqual(["conversation-1"]);
  });

  it("clears the demo outbox for the demo scope", () => {
    saveOutbox(
      { "conversation-1": [buildMessage({ status: "sent" })] },
      "demo",
    );

    clearOutboxForScope("demo");

    expect(window.localStorage.getItem(BASE_KEY)).toBeNull();
  });

  it("does not throw when storage is blocked, and still tries every key", () => {
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });

    expect(() => clearOutboxForScope("member-a")).not.toThrow();
    expect(removeItem).toHaveBeenCalledWith(`${BASE_KEY}.u.member-a`);
    expect(removeItem).toHaveBeenCalledWith(BASE_KEY);
  });
});
