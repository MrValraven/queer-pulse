import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import type { Virtualizer } from "@tanstack/react-virtual";
import {
  createMessageJumpHunter,
  decideHuntStep,
  type HuntProgress,
  type JumpThreadSnapshot,
  type MessageJumpHunter,
} from "./messageJumpHunt";
import type { MessageRow } from "./messageRows";
import type { ChatMessage } from "./data";
import type { ThreadWindowOutcome } from "./threadWindowTypes";
import { revealMessageRow } from "./revealMessageRow";
import { showMessageJumpStatus } from "./messageJumpStore";

vi.mock("./revealMessageRow", () => ({
  revealMessageRow: vi.fn(() => () => {}),
}));
vi.mock("./messageJumpStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./messageJumpStore")>();
  return {
    ...actual,
    showMessageJumpStatus: vi.fn(),
    clearMessageJumpStatus: vi.fn(),
  };
});

/**
 * PRD-401: a jump to a message past the loaded pages asks the thread for a
 * history window around it (one request) and reveals the message once the
 * window renders. The page-back hunt stays only for a thread without a window.
 */

function chatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { from: "them", text: "hi", ...overrides };
}

function runRow(items: ChatMessage[]): MessageRow {
  return {
    kind: "run",
    key: items[0]?.id ?? "run",
    day: "Today",
    run: { from: "them", items },
  };
}

function baseHunt(overrides: Partial<HuntProgress> = {}): HuntProgress {
  return {
    messageId: "target",
    conversationId: "c1",
    pagesRequested: 0,
    isAwaitingPage: false,
    hasSeenLoading: false,
    requestedAt: 0,
    oldestKeyAtRequest: undefined,
    ...overrides,
  };
}

const liveRows = [runRow([chatMessage({ id: "recent" })])];
const windowRows = [
  runRow([chatMessage({ id: "before-target" })]),
  runRow([chatMessage({ id: "target" })]),
];

function decisionSnapshot(
  overrides: Partial<Parameters<typeof decideHuntStep>[1]> = {},
) {
  return {
    rows: liveRows,
    hasMoreOlder: true,
    isLoadingOlder: false,
    isHistorySettled: true,
    isHistoryError: false,
    threadWindow: {
      anchorMessageId: null,
      openWindowAround: (): Promise<ThreadWindowOutcome> =>
        Promise.resolve("ready"),
      showWindow: () => true,
      readCancelCount: () => 0,
    },
    ...overrides,
  };
}

describe("decideHuntStep: the history window path", () => {
  it("asks for a window around the message once the loaded history is current and lacks it", () => {
    expect(decideHuntStep(baseHunt(), decisionSnapshot(), 0)).toEqual({
      kind: "requestWindow",
    });
  });

  it("waits for page 0 to settle before asking for a window", () => {
    const snapshot = decisionSnapshot({ isHistorySettled: false });
    expect(decideHuntStep(baseHunt(), snapshot, 0)).toEqual({ kind: "wait" });
  });

  it("waits while the window request is in flight", () => {
    const hunt = baseHunt({ windowRequest: "pending" });
    expect(decideHuntStep(hunt, decisionSnapshot(), 0)).toEqual({
      kind: "wait",
    });
  });

  it("waits for the commit that renders the window it was promised", () => {
    const hunt = baseHunt({ windowRequest: "detached" });
    expect(decideHuntStep(hunt, decisionSnapshot(), 0)).toEqual({
      kind: "wait",
    });
  });

  it("reveals the message once the window rows hold it", () => {
    const hunt = baseHunt({ windowRequest: "detached" });
    const snapshot = decisionSnapshot({
      rows: windowRows,
      threadWindow: {
        anchorMessageId: "target",
        openWindowAround: (): Promise<ThreadWindowOutcome> =>
          Promise.resolve("ready"),
        showWindow: () => true,
        readCancelCount: () => 0,
      },
    });
    expect(decideHuntStep(hunt, snapshot, 0)).toEqual({ kind: "reveal" });
  });

  it("reports not found when the rendered window no longer holds the message", () => {
    const hunt = baseHunt({ windowRequest: "detached" });
    const snapshot = decisionSnapshot({
      rows: liveRows,
      threadWindow: {
        anchorMessageId: "target",
        openWindowAround: (): Promise<ThreadWindowOutcome> =>
          Promise.resolve("ready"),
        showWindow: () => true,
        readCancelCount: () => 0,
      },
    });
    expect(decideHuntStep(hunt, snapshot, 0)).toEqual({
      kind: "giveUp",
      phase: "notFound",
    });
  });

  it("keeps the page-back hunt for a thread without a window", () => {
    const snapshot = decisionSnapshot({ threadWindow: undefined });
    expect(decideHuntStep(baseHunt(), snapshot, 0)).toEqual({
      kind: "requestPage",
    });
  });
});

describe("createMessageJumpHunter: the history window path", () => {
  let hunter: MessageJumpHunter;
  let windowRequests: {
    messageId: string;
    resolve: (outcome: ThreadWindowOutcome) => void;
  }[];
  let openWindowAround: (messageId: string) => Promise<ThreadWindowOutcome>;
  let showWindow: Mock<(messageId: string) => boolean>;
  let onLoadOlder: Mock<() => void>;

  function threadWindow(anchorMessageId: string | null = null) {
    return {
      anchorMessageId,
      openWindowAround,
      showWindow,
      readCancelCount: () => 0,
    };
  }

  function threadSnapshot(
    overrides: Partial<JumpThreadSnapshot> = {},
  ): JumpThreadSnapshot {
    return {
      conversationId: "c1",
      rows: liveRows,
      rowVirtualizer: {} as Virtualizer<HTMLDivElement, Element>,
      hasMoreOlder: true,
      isLoadingOlder: false,
      isHistorySettled: true,
      isHistoryError: false,
      onLoadOlder,
      threadWindow: threadWindow(),
      scroll: {
        beginProgrammaticJump: vi.fn(),
        endProgrammaticJump: vi.fn(),
        cancelUnreadLanding: vi.fn(),
        armHistoryPageAnchor: vi.fn(),
      },
      ...overrides,
    };
  }

  async function settleWindowRequest(
    messageId: string,
    outcome: ThreadWindowOutcome,
  ) {
    const request = windowRequests.find(
      (candidate) => candidate.messageId === messageId,
    );
    request?.resolve(outcome);
    await Promise.resolve();
    await Promise.resolve();
  }

  beforeEach(() => {
    vi.mocked(revealMessageRow).mockClear();
    vi.mocked(showMessageJumpStatus).mockClear();
    windowRequests = [];
    openWindowAround = vi.fn(
      (messageId: string) =>
        new Promise<ThreadWindowOutcome>((resolve) => {
          windowRequests.push({ messageId, resolve });
        }),
    );
    showWindow = vi.fn<(messageId: string) => boolean>(() => true);
    onLoadOlder = vi.fn<() => void>();
    hunter = createMessageJumpHunter();
  });

  afterEach(() => {
    hunter.dispose();
    vi.useRealTimers();
  });

  it("reveals a loaded message without asking for a window", () => {
    hunter.sync(threadSnapshot({ rows: windowRows }));

    expect(hunter.jump("target")).toBe(true);
    expect(openWindowAround).not.toHaveBeenCalled();
    expect(revealMessageRow).toHaveBeenCalledTimes(1);
  });

  it("asks once for a window around an unloaded message, and never pages back", () => {
    hunter.sync(threadSnapshot());

    expect(hunter.jump("target")).toBe(false);
    hunter.sync(threadSnapshot());

    expect(openWindowAround).toHaveBeenCalledTimes(1);
    expect(openWindowAround).toHaveBeenCalledWith("target");
    expect(onLoadOlder).not.toHaveBeenCalled();
    expect(showWindow).not.toHaveBeenCalled();
  });

  it("shows the loaded window, then reveals the message with an instant landing once it renders", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    await settleWindowRequest("target", "ready");
    expect(showWindow).toHaveBeenCalledWith("target");
    expect(revealMessageRow).not.toHaveBeenCalled();

    hunter.sync(
      threadSnapshot({
        rows: windowRows,
        threadWindow: threadWindow("target"),
      }),
    );

    expect(revealMessageRow).toHaveBeenCalledTimes(1);
    const [, , messageId, shouldAllowGlide] =
      vi.mocked(revealMessageRow).mock.calls[0]!;
    expect(messageId).toBe("target");
    expect(shouldAllowGlide).toBe(false);
  });

  it("never shows the window of a jump superseded by a jump to a loaded message", async () => {
    const rowsWithLoaded = [
      ...liveRows,
      runRow([chatMessage({ id: "loaded" })]),
    ];
    hunter.sync(threadSnapshot({ rows: rowsWithLoaded }));
    hunter.jump("target");
    expect(hunter.jump("loaded")).toBe(true);

    await settleWindowRequest("target", "ready");

    expect(showWindow).not.toHaveBeenCalled();
    expect(revealMessageRow).toHaveBeenCalledTimes(1);
    expect(vi.mocked(revealMessageRow).mock.calls[0]![2]).toBe("loaded");
  });

  it("shows only the latest of two far jumps, whichever answer lands last", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");
    hunter.jump("other-far");

    await settleWindowRequest("other-far", "ready");
    await settleWindowRequest("target", "ready");

    expect(showWindow).toHaveBeenCalledTimes(1);
    expect(showWindow).toHaveBeenCalledWith("other-far");
  });

  it("ends quietly when a send or a pill tap cancelled the loading window", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    await settleWindowRequest("target", "cancelled");

    expect(showWindow).not.toHaveBeenCalled();
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "notFound");
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "loadFailed");
    expect(revealMessageRow).not.toHaveBeenCalled();
  });

  it("ends quietly when the thread refuses to show a window that is no longer current", async () => {
    showWindow.mockReturnValue(false);
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    await settleWindowRequest("target", "ready");
    hunter.sync(threadSnapshot());

    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "notFound");
    expect(revealMessageRow).not.toHaveBeenCalled();
  });

  it("never shows a window whose answer lands after the deadline reported a failure", async () => {
    vi.useFakeTimers();
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    vi.advanceTimersByTime(15_000);
    expect(showMessageJumpStatus).toHaveBeenCalledWith("c1", "loadFailed");

    await settleWindowRequest("target", "ready");
    expect(showWindow).not.toHaveBeenCalled();
  });

  it("says not found when the server refuses the message", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    await settleWindowRequest("target", "notFound");

    expect(showMessageJumpStatus).toHaveBeenCalledWith("c1", "notFound");
    expect(revealMessageRow).not.toHaveBeenCalled();
  });

  it("reports a load failure when the window request fails", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");

    await settleWindowRequest("target", "failed");

    expect(showMessageJumpStatus).toHaveBeenCalledWith("c1", "loadFailed");
  });

  it("waits for page 0 to settle before asking for a window", () => {
    hunter.sync(threadSnapshot({ isHistorySettled: false }));
    hunter.jump("target");
    expect(openWindowAround).not.toHaveBeenCalled();

    hunter.sync(threadSnapshot());
    expect(openWindowAround).toHaveBeenCalledTimes(1);
  });

  it("ignores a window answer that lands after the reader switched threads", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");
    hunter.sync(threadSnapshot({ conversationId: "c2" }));

    await settleWindowRequest("target", "ready");

    expect(showWindow).not.toHaveBeenCalled();
  });
});

describe("createMessageJumpHunter: a send or pill tap during the hunt", () => {
  let hunter: MessageJumpHunter;
  let windowRequests: {
    messageId: string;
    resolve: (outcome: ThreadWindowOutcome) => void;
  }[];
  let openWindowAround: Mock<
    (messageId: string) => Promise<ThreadWindowOutcome>
  >;
  let showWindow: Mock<(messageId: string) => boolean>;
  // Stands in for the thread's cancel count: each send or pill tap bumps it.
  let cancelCount: number;

  function threadSnapshot(
    overrides: Partial<JumpThreadSnapshot> = {},
  ): JumpThreadSnapshot {
    return {
      conversationId: "c1",
      rows: liveRows,
      rowVirtualizer: {} as Virtualizer<HTMLDivElement, Element>,
      hasMoreOlder: true,
      isLoadingOlder: false,
      isHistorySettled: true,
      isHistoryError: false,
      onLoadOlder: vi.fn(),
      threadWindow: {
        anchorMessageId: null,
        openWindowAround,
        showWindow,
        readCancelCount: () => cancelCount,
      },
      scroll: {
        beginProgrammaticJump: vi.fn(),
        endProgrammaticJump: vi.fn(),
        cancelUnreadLanding: vi.fn(),
        armHistoryPageAnchor: vi.fn(),
      },
      ...overrides,
    };
  }

  function returnToLatest() {
    cancelCount += 1;
  }

  async function settleWindowRequest(outcome: ThreadWindowOutcome) {
    windowRequests[0]?.resolve(outcome);
    await Promise.resolve();
    await Promise.resolve();
  }

  beforeEach(() => {
    vi.mocked(revealMessageRow).mockClear();
    vi.mocked(showMessageJumpStatus).mockClear();
    windowRequests = [];
    openWindowAround = vi.fn(
      (messageId: string) =>
        new Promise<ThreadWindowOutcome>((resolve) => {
          windowRequests.push({ messageId, resolve });
        }),
    );
    showWindow = vi.fn<(messageId: string) => boolean>(() => true);
    cancelCount = 0;
    hunter = createMessageJumpHunter();
  });

  afterEach(() => {
    hunter.dispose();
    vi.useRealTimers();
  });

  it("ends quietly when the reader sends while page 0 is still loading", () => {
    vi.useFakeTimers();
    hunter.sync(threadSnapshot({ isHistorySettled: false }));
    hunter.jump("target");

    returnToLatest();
    hunter.sync(threadSnapshot());
    vi.advanceTimersByTime(15_000);

    expect(openWindowAround).not.toHaveBeenCalled();
    expect(showWindow).not.toHaveBeenCalled();
    expect(showMessageJumpStatus).not.toHaveBeenCalled();
  });

  it("stays silent at the deadline when the reader sent and no commit followed", () => {
    vi.useFakeTimers();
    hunter.sync(threadSnapshot({ isHistorySettled: false }));
    hunter.jump("target");

    returnToLatest();
    vi.advanceTimersByTime(15_000);

    expect(showMessageJumpStatus).not.toHaveBeenCalled();
  });

  it("never shows a window that answers ready after the reader sent", async () => {
    hunter.sync(threadSnapshot());
    hunter.jump("target");
    expect(openWindowAround).toHaveBeenCalledTimes(1);

    returnToLatest();
    await settleWindowRequest("ready");

    expect(showWindow).not.toHaveBeenCalled();
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "loadFailed");
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "notFound");
  });

  it("ends quietly when the reader sends after the window was shown and before the reveal", async () => {
    vi.useFakeTimers();
    hunter.sync(threadSnapshot());
    hunter.jump("target");
    await settleWindowRequest("ready");
    expect(showWindow).toHaveBeenCalledWith("target");

    // The send drops the window: the next commit shows the live tail again.
    returnToLatest();
    hunter.sync(threadSnapshot());
    vi.advanceTimersByTime(15_000);

    expect(revealMessageRow).not.toHaveBeenCalled();
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "loadFailed");
    expect(showMessageJumpStatus).not.toHaveBeenCalledWith("c1", "notFound");
  });

  it("keeps a hunt going after a send made before it started", () => {
    returnToLatest();
    hunter.sync(threadSnapshot());
    hunter.jump("target");
    hunter.sync(threadSnapshot());

    expect(openWindowAround).toHaveBeenCalledTimes(1);
    expect(openWindowAround).toHaveBeenCalledWith("target");
  });
});
