import { describe, expect, it } from "vitest";
import {
  buildMessageRows,
  estimateRowHeight,
  messageIdentity,
  type MessageRow,
} from "./messageRows";
import type { ChatMessage } from "./data";

/**
 * `buildMessageRows` flattens pre-grouped day buckets into the virtualizer's
 * row list. These cases cover its own job: placing a day separator per given
 * group, inserting the one-time unread divider immediately before its anchor's
 * run, breaking system messages into their own pill rows, and never inserting
 * a divider when there is nothing unread to mark. The LOCAL-day grouping
 * itself (which messages land in which day bucket) is `groupMessages`'s job,
 * covered in `api/messages.adapters.inbox.test.ts`.
 */

let nextId = 0;
function chatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  nextId += 1;
  return {
    from: "them",
    text: `message ${nextId}`,
    id: `m${nextId}`,
    ...overrides,
  };
}

describe("buildMessageRows: day separators", () => {
  it("puts one day separator at the head of each given group, in order", () => {
    const today = [chatMessage()];
    const yesterday = [chatMessage()];
    const rows = buildMessageRows(
      [
        { day: "Today", items: today },
        { day: "Yesterday", items: yesterday },
      ],
      undefined,
      undefined,
      false,
      false,
    );
    const separators = rows.filter((row) => row.kind === "daySeparator");
    expect(separators).toHaveLength(2);
    expect(separators.map((row) => row.day)).toEqual(["Today", "Yesterday"]);
    // Each separator immediately precedes its own group's content.
    expect(rows[0]).toMatchObject({ kind: "daySeparator", day: "Today" });
    const yesterdaySeparatorIndex = rows.findIndex(
      (row) => row.kind === "daySeparator" && row.day === "Yesterday",
    );
    const nextRow = rows[yesterdaySeparatorIndex + 1];
    expect(nextRow?.kind).toBe("run");
    if (nextRow?.kind === "run")
      expect(nextRow.run.items[0]).toBe(yesterday[0]);
  });
});

describe("buildMessageRows: unread divider placement", () => {
  it("inserts the divider immediately before the run headed by the anchor", () => {
    const first = chatMessage({ id: "m0" });
    const second = chatMessage({ id: "m1" });
    const third = chatMessage({ id: "m2" });
    const anchorKey = messageIdentity(second, 1);
    const rows = buildMessageRows(
      [{ day: "Today", items: [first, second, third] }],
      anchorKey,
      undefined,
      false,
      false,
    );
    const dividerIndex = rows.findIndex((row) => row.kind === "unreadDivider");
    expect(dividerIndex).toBeGreaterThan(-1);
    const rowAfterDivider = rows[dividerIndex + 1];
    expect(rowAfterDivider?.kind).toBe("run");
    if (rowAfterDivider?.kind === "run") {
      expect(rowAfterDivider.run.items[0]).toBe(second);
    }
    // The anchor forces a run break, so the message before it stays in its
    // own, earlier, separate run from the anchor's run.
    const rowBeforeDivider = rows[dividerIndex - 1];
    expect(rowBeforeDivider?.kind).toBe("run");
    if (rowBeforeDivider?.kind === "run") {
      expect(rowBeforeDivider.run.items).toEqual([first]);
    }
  });

  it("never inserts a divider when the anchor key matches nothing loaded", () => {
    const rows = buildMessageRows(
      [{ day: "Today", items: [chatMessage(), chatMessage()] }],
      "some-message-id-not-in-this-group",
      undefined,
      false,
      false,
    );
    expect(rows.some((row) => row.kind === "unreadDivider")).toBe(false);
  });
});

describe("buildMessageRows: system pill rows", () => {
  it("gives a system message its own row and breaks the surrounding runs", () => {
    const before = chatMessage();
    const systemMessage = chatMessage({ kind: "system" });
    const after = chatMessage();
    const rows = buildMessageRows(
      [{ day: "Today", items: [before, systemMessage, after] }],
      undefined,
      undefined,
      false,
      false,
    );
    const systemRow = rows.find((row) => row.kind === "system");
    expect(systemRow).toBeDefined();
    if (systemRow?.kind === "system") {
      expect(systemRow.message).toBe(systemMessage);
    }
    // The system pill sits strictly between two separate, unmerged runs.
    const runRows = rows.filter(
      (row): row is Extract<MessageRow, { kind: "run" }> => row.kind === "run",
    );
    expect(runRows).toHaveLength(2);
    expect(runRows[0]!.run.items).toEqual([before]);
    expect(runRows[1]!.run.items).toEqual([after]);
  });
});

describe("buildMessageRows: no divider when nothing is unread", () => {
  it("produces no unreadDivider row when no anchor key is given", () => {
    const rows = buildMessageRows(
      [{ day: "Today", items: [chatMessage(), chatMessage()] }],
      undefined,
      undefined,
      false,
      false,
    );
    expect(rows.some((row) => row.kind === "unreadDivider")).toBe(false);
  });
});

describe("estimateRowHeight: virtualizer size estimate per row kind", () => {
  it("falls back to 56 for an undefined row (not-yet-loaded index)", () => {
    expect(estimateRowHeight(undefined)).toBe(56);
  });

  it("gives each non-run kind its own fixed estimate", () => {
    expect(
      estimateRowHeight({ kind: "daySeparator", key: "d", day: "Today" }),
    ).toBe(32);
    expect(estimateRowHeight({ kind: "unreadDivider", key: "u" })).toBe(28);
    expect(estimateRowHeight({ kind: "groupSeenBy", key: "g" })).toBe(22);
    expect(
      estimateRowHeight({
        kind: "system",
        key: "s",
        day: "Today",
        message: chatMessage(),
      }),
    ).toBe(36);
  });

  it("grows a run's estimate with each additional bubble it holds", () => {
    const oneBubble: MessageRow = {
      kind: "run",
      key: "r1",
      day: "Today",
      run: { from: "them", items: [chatMessage()] },
    };
    const threeBubbles: MessageRow = {
      kind: "run",
      key: "r2",
      day: "Today",
      run: {
        from: "them",
        items: [chatMessage(), chatMessage(), chatMessage()],
      },
    };
    expect(estimateRowHeight(oneBubble)).toBe(56);
    expect(estimateRowHeight(threeBubbles)).toBe(56 + 2 * 40);
  });
});
