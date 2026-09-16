import { describe, expect, it } from "vitest";
import {
  decideHuntStep,
  oldestMessageKey,
  MAX_HUNT_PAGES,
  type HuntProgress,
} from "./messageJumpHunt";
import type { MessageRow } from "./messageRows";
import type { ChatMessage } from "./data";

/**
 * `decideHuntStep` is the whole page-until-found decision engine for
 * search-jump/jump-to-message, factored out as a pure function of
 * (hunt progress, thread snapshot, now) precisely so it's testable without a
 * DOM, a virtualizer, or real timers. `createMessageJumpHunter` (the stateful
 * engine wrapping it) is thin orchestration over this: scheduling timers and
 * driving the scroll layer. It is exercised end-to-end by the messaging
 * integration suites instead of unit tests here.
 */

function chatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { from: "them", text: "hi", ...overrides };
}

function runRow(items: ChatMessage[], key = items[0]?.id ?? "run"): MessageRow {
  return { kind: "run", key, day: "Today", run: { from: "them", items } };
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

function baseSnapshot(rows: MessageRow[] = []) {
  return {
    rows,
    hasMoreOlder: true,
    isLoadingOlder: false,
    isHistorySettled: true,
    isHistoryError: false,
  };
}

describe("decideHuntStep: a loaded target always wins", () => {
  it("reveals immediately once the target message is among the loaded rows", () => {
    const rows = [runRow([chatMessage({ id: "target" })])];
    const decision = decideHuntStep(baseHunt(), baseSnapshot(rows), 0);
    expect(decision).toEqual({ kind: "reveal" });
  });

  it("reveals even while an older page is mid-flight, if the target already loaded", () => {
    const rows = [runRow([chatMessage({ id: "target" })])];
    const snapshot = { ...baseSnapshot(rows), isLoadingOlder: true };
    const decision = decideHuntStep(baseHunt(), snapshot, 0);
    expect(decision).toEqual({ kind: "reveal" });
  });
});

describe("decideHuntStep: waits out anything still loading", () => {
  it("waits while an older page is in flight", () => {
    const snapshot = { ...baseSnapshot(), isLoadingOlder: true };
    expect(decideHuntStep(baseHunt(), snapshot, 0)).toEqual({ kind: "wait" });
  });

  it("waits while page 0 itself hasn't settled yet", () => {
    const snapshot = { ...baseSnapshot(), isHistorySettled: false };
    expect(decideHuntStep(baseHunt(), snapshot, 0)).toEqual({ kind: "wait" });
  });

  it("waits during the pickup grace window right after requesting a page", () => {
    const hunt = baseHunt({
      isAwaitingPage: true,
      hasSeenLoading: false,
      requestedAt: 1000,
      oldestKeyAtRequest: "old-1",
    });
    const rows = [runRow([chatMessage({ id: "old-1" })])];
    // 500ms since the request, well inside the 1500ms pickup grace.
    const decision = decideHuntStep(hunt, baseSnapshot(rows), 1500);
    expect(decision).toEqual({ kind: "wait" });
  });
});

describe("decideHuntStep: hunts older pages until the target is found", () => {
  it("requests another page when the last one hasn't settled the hunt yet", () => {
    const rows = [runRow([chatMessage({ id: "some-other-message" })])];
    const decision = decideHuntStep(baseHunt(), baseSnapshot(rows), 0);
    expect(decision).toEqual({ kind: "requestPage" });
  });

  it("keeps requesting pages after a page landed with new (still not matching) history", () => {
    const hunt = baseHunt({
      isAwaitingPage: true,
      hasSeenLoading: true,
      requestedAt: 0,
      oldestKeyAtRequest: "old-1",
      pagesRequested: 1,
    });
    // The oldest loaded message moved past the requested page's oldest key,
    // so the page DID add new history, and the hunt should keep going.
    const rows = [runRow([chatMessage({ id: "old-2" })])];
    const decision = decideHuntStep(hunt, baseSnapshot(rows), 100_000);
    expect(decision).toEqual({ kind: "requestPage" });
  });
});

describe("decideHuntStep: stops once there are no more older pages", () => {
  it("gives up as not-found once history is exhausted and the target never appeared", () => {
    const snapshot = { ...baseSnapshot(), hasMoreOlder: false };
    const decision = decideHuntStep(baseHunt(), snapshot, 0);
    expect(decision).toEqual({ kind: "giveUp", phase: "notFound" });
  });

  it("gives up as not-found when a settled page added no new history and none remains", () => {
    const hunt = baseHunt({
      isAwaitingPage: true,
      hasSeenLoading: true,
      requestedAt: 0,
      oldestKeyAtRequest: "old-1",
    });
    const rows = [runRow([chatMessage({ id: "old-1" })])]; // unchanged oldest key
    const snapshot = { ...baseSnapshot(rows), hasMoreOlder: false };
    const decision = decideHuntStep(hunt, snapshot, 100_000);
    expect(decision).toEqual({ kind: "giveUp", phase: "notFound" });
  });

  it("gives up as a load failure when the oldest key didn't move but more pages remain", () => {
    const hunt = baseHunt({
      isAwaitingPage: true,
      hasSeenLoading: true,
      requestedAt: 0,
      oldestKeyAtRequest: "old-1",
    });
    const rows = [runRow([chatMessage({ id: "old-1" })])];
    const decision = decideHuntStep(hunt, baseSnapshot(rows), 100_000);
    expect(decision).toEqual({ kind: "giveUp", phase: "loadFailed" });
  });
});

describe("decideHuntStep: reports why the hunt could not reach the target", () => {
  it("reports loadFailed when page 0 itself errored", () => {
    const snapshot = { ...baseSnapshot(), isHistoryError: true };
    expect(decideHuntStep(baseHunt(), snapshot, 0)).toEqual({
      kind: "giveUp",
      phase: "loadFailed",
    });
  });

  it("reports tooFar once the page budget is exhausted without finding it", () => {
    const hunt = baseHunt({ pagesRequested: MAX_HUNT_PAGES });
    const decision = decideHuntStep(hunt, baseSnapshot(), 0);
    expect(decision).toEqual({ kind: "giveUp", phase: "tooFar" });
  });
});

describe("oldestMessageKey", () => {
  it("reads the identity of the first loaded run's first message", () => {
    const rows = [
      runRow([chatMessage({ id: "oldest" }), chatMessage({ id: "next" })]),
    ];
    expect(oldestMessageKey(rows)).toBe("oldest");
  });

  it("reads a system row's own message id when it is the first row", () => {
    const systemMessage = chatMessage({ id: "sys-1", kind: "system" });
    const rows: MessageRow[] = [
      { kind: "system", key: "sys-1", day: "Today", message: systemMessage },
      runRow([chatMessage({ id: "next" })]),
    ];
    expect(oldestMessageKey(rows)).toBe("sys-1");
  });

  it("is undefined when nothing is loaded", () => {
    expect(oldestMessageKey([])).toBeUndefined();
  });

  it("skips non-message rows (day separators, dividers) to find the first real message", () => {
    const rows: MessageRow[] = [
      { kind: "daySeparator", key: "d", day: "Today" },
      { kind: "unreadDivider", key: "u" },
      runRow([chatMessage({ id: "first-real" })]),
    ];
    expect(oldestMessageKey(rows)).toBe("first-real");
  });
});
