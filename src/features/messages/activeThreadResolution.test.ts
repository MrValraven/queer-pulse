import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { Conversation } from "./data";
import {
  describeRequestedRead,
  requestedDetailConversationId,
  resolveActiveThread,
  shouldDefaultSelectFirstThread,
} from "./activeThreadResolution";

// ENG-403: a requested conversation id resolves to its own thread only. The
// old fallback opened the first inbox row for any id past the loaded pages,
// with the composer addressed to that other conversation.

const FIRST_ID = "11111111-1111-1111-1111-111111111111";
const SECOND_ID = "22222222-2222-2222-2222-222222222222";
const OLDER_ID = "33333333-3333-3333-3333-333333333333";

function thread(id: string, overrides: Partial<Conversation> = {}) {
  return { id, name: `Thread ${id.slice(0, 4)}`, ...overrides } as Conversation;
}

const loadedInbox = [thread(FIRST_ID), thread(SECOND_ID)];

function resolveLive(
  overrides: Partial<Parameters<typeof resolveActiveThread>[0]> = {},
) {
  return resolveActiveThread({
    activeId: OLDER_ID,
    allThreads: loadedInbox,
    requestedThread: undefined,
    requestedReadState: "refused",
    isInboxLoading: false,
    isDeepLinkPending: false,
    demoMode: false,
    ...overrides,
  });
}

describe("resolveActiveThread", () => {
  it("reports none when nothing is requested", () => {
    expect(resolveLive({ activeId: "" })).toEqual({
      thread: null,
      status: "none",
    });
  });

  it("reports loading while a pending ?c= link holds the default select", () => {
    expect(resolveLive({ activeId: "", isDeepLinkPending: true })).toEqual({
      thread: null,
      status: "loading",
    });
  });

  it("resolves a thread from the loaded inbox pages", () => {
    const result = resolveLive({ activeId: SECOND_ID });
    expect(result.status).toBe("ready");
    expect(result.thread?.id).toBe(SECOND_ID);
  });

  it("holds a thread past the loaded pages on loading while its by-id read runs", () => {
    const result = resolveLive({ requestedReadState: "pending" });
    expect(result).toEqual({ thread: null, status: "loading" });
  });

  it("resolves a thread past the loaded pages from its by-id read", () => {
    const olderThread = thread(OLDER_ID);
    const result = resolveLive({ requestedThread: olderThread });
    expect(result).toEqual({ thread: olderThread, status: "ready" });
  });

  it("shows unavailable when the server refuses the by-id read", () => {
    const result = resolveLive({ requestedReadState: "refused" });
    expect(result).toEqual({ thread: null, status: "unavailable" });
  });

  it("shows the retryable failed state for a transient read failure", () => {
    const result = resolveLive({ requestedReadState: "failed" });
    expect(result).toEqual({ thread: null, status: "failed" });
  });

  it("never resolves to the first inbox row for an unknown id", () => {
    for (const requestedReadState of [
      "pending",
      "refused",
      "failed",
      "settled",
    ] as const) {
      const result = resolveLive({ requestedReadState });
      expect(result.thread).toBeNull();
    }
  });

  it("ignores a by-id read answered for another conversation", () => {
    const result = resolveLive({
      requestedThread: thread(FIRST_ID),
      requestedReadState: "settled",
    });
    expect(result).toEqual({ thread: null, status: "unavailable" });
  });

  it("waits on the inbox's own first load before calling a thread unavailable", () => {
    expect(resolveLive({ allThreads: [], isInboxLoading: true })).toEqual({
      thread: null,
      status: "loading",
    });
    expect(
      resolveLive({ allThreads: [], isInboxLoading: true, demoMode: true }),
    ).toEqual({ thread: null, status: "loading" });
  });

  it("shows unavailable for a non-server id missing from the inbox", () => {
    const result = resolveLive({
      activeId: "some-member-handle",
      requestedReadState: "pending",
    });
    expect(result).toEqual({ thread: null, status: "unavailable" });
  });

  describe("demo mode", () => {
    it("resolves a seeded thread from the loaded inbox", () => {
      const result = resolveLive({ activeId: FIRST_ID, demoMode: true });
      expect(result.status).toBe("ready");
      expect(result.thread?.id).toBe(FIRST_ID);
    });

    it("shows unavailable for a thread the demo inbox does not hold", () => {
      const result = resolveLive({
        demoMode: true,
        requestedThread: thread(OLDER_ID),
        requestedReadState: "pending",
      });
      expect(result).toEqual({ thread: null, status: "unavailable" });
    });
  });
});

describe("describeRequestedRead", () => {
  const idle = { isPending: false, isFetching: false, isError: false };

  it("reads a first fetch in flight as pending", () => {
    expect(
      describeRequestedRead({ ...idle, isPending: true, error: null }),
    ).toBe("pending");
  });

  it("reads a resolved read as settled", () => {
    expect(describeRequestedRead({ ...idle, error: null })).toBe("settled");
  });

  it("reads a 404 or 403 as refused, even while it refetches", () => {
    for (const status of [404, 403]) {
      const error = new ApiError(status, "No access");
      expect(describeRequestedRead({ ...idle, isError: true, error })).toBe(
        "refused",
      );
      expect(
        describeRequestedRead({
          ...idle,
          isError: true,
          isFetching: true,
          error,
        }),
      ).toBe("refused");
    }
  });

  it("reads a 5xx or a network fault as failed, and its retry as pending", () => {
    for (const error of [
      new ApiError(503, "Unavailable"),
      new TypeError("Failed to fetch"),
    ]) {
      expect(describeRequestedRead({ ...idle, isError: true, error })).toBe(
        "failed",
      );
      expect(
        describeRequestedRead({
          ...idle,
          isError: true,
          isFetching: true,
          error,
        }),
      ).toBe("pending");
    }
  });
});

describe("shouldDefaultSelectFirstThread", () => {
  it("picks the first row when nothing is open and no link is pending", () => {
    expect(shouldDefaultSelectFirstThread("", null, 3)).toBe(true);
  });

  it("never picks the first row while a ?c= link is pending", () => {
    expect(shouldDefaultSelectFirstThread("", OLDER_ID, 3)).toBe(false);
  });

  it("keeps an open thread and waits for an inbox row", () => {
    expect(shouldDefaultSelectFirstThread(SECOND_ID, null, 3)).toBe(false);
    expect(shouldDefaultSelectFirstThread("", null, 0)).toBe(false);
  });
});

describe("requestedDetailConversationId", () => {
  it("reads the listed thread's server id", () => {
    expect(
      requestedDetailConversationId(FIRST_ID, thread(FIRST_ID), false),
    ).toBe(FIRST_ID);
  });

  it("reads the requested id itself for a thread past the loaded pages", () => {
    expect(requestedDetailConversationId(OLDER_ID, undefined, false)).toBe(
      OLDER_ID,
    );
  });

  it("skips a just-picked placeholder, whose id is the member's slug", () => {
    const placeholder = thread("sam-rivera", { slug: "sam-rivera" });
    expect(
      requestedDetailConversationId("sam-rivera", placeholder, false),
    ).toBeNull();
    expect(
      requestedDetailConversationId("sam-rivera", undefined, false),
    ).toBeNull();
  });

  it("stays null in demo mode and when nothing is requested", () => {
    expect(requestedDetailConversationId(OLDER_ID, undefined, true)).toBeNull();
    expect(requestedDetailConversationId("", undefined, false)).toBeNull();
  });
});
