import { describe, expect, it } from "vitest";
import type { Conversation } from "./data";
import {
  mergeInboxThreads,
  withoutListedExtraThreads,
} from "./useMessageThreadList";

// V4: a session copy in `extraThreads` used to win the inbox dedupe for good,
// so after one local group action every later remote rename, photo, pin,
// mute, unread bump or preview stayed invisible on that row until a reload.

const GROUP_ID = "11111111-1111-1111-1111-111111111111";
const NEW_THREAD_ID = "22222222-2222-2222-2222-222222222222";
const OLDER_THREAD_ID = "33333333-3333-3333-3333-333333333333";

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: GROUP_ID,
    initials: "PB",
    tint: "plum",
    name: "Pride Brunch",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

const NO_DETAILS: ReadonlyMap<string, Conversation> = new Map();

function merge(
  input: Partial<Parameters<typeof mergeInboxThreads>[0]>,
): Conversation[] {
  return mergeInboxThreads({
    extraThreads: [],
    baseThreads: [],
    detailThreadsById: NO_DETAILS,
    shouldPreferCachedRows: true,
    locallyDeletedIds: new Set(),
    ...input,
  });
}

describe("mergeInboxThreads (live)", () => {
  it("shows the list row over a session copy of the same thread", () => {
    const sessionCopy = conversation({ name: "Brunch Crew", preview: "old" });
    const listRow = conversation({
      name: "Sunday Brunch",
      preview: "see you there",
      unread: true,
      pinnedAt: "2026-09-14T10:00:00Z",
    });
    const merged = merge({
      extraThreads: [sessionCopy],
      baseThreads: [listRow],
    });
    expect(merged).toEqual([listRow]);
  });

  it("keeps a just-created thread the list does not hold yet, first", () => {
    const created = conversation({ id: NEW_THREAD_ID, name: "New Group" });
    const listRow = conversation();
    const merged = merge({ extraThreads: [created], baseThreads: [listRow] });
    expect(merged.map((thread) => thread.id)).toEqual([
      NEW_THREAD_ID,
      GROUP_ID,
    ]);
    expect(merged[0]).toBe(created);
  });

  it("shows the cached detail read for a session row past the loaded pages", () => {
    const sessionCopy = conversation({ id: OLDER_THREAD_ID, name: "Old" });
    const detail = conversation({ id: OLDER_THREAD_ID, name: "Renamed" });
    const merged = merge({
      extraThreads: [sessionCopy],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(merged).toEqual([detail]);
  });

  it("lays the last activity of a strictly newer session copy over the cached detail read", () => {
    const sessionCopy = conversation({
      id: OLDER_THREAD_ID,
      preview: "just now",
      time: "11:00",
      updatedAt: "2026-09-14T11:00:00Z",
      lastMessageSenderHandle: "jordan",
      lastMessageBody: "just now",
      lastMessageIsSystem: false,
    });
    const detail = conversation({
      id: OLDER_THREAD_ID,
      preview: "an hour ago",
      time: "10:00",
      updatedAt: "2026-09-14T10:00:00Z",
      lastMessageSenderHandle: "sam",
      lastMessageBody: "an hour ago",
      lastMessageStaffFirstName: "Sam",
      lastMessageIsSentByViewer: false,
    });
    const merged = merge({
      extraThreads: [sessionCopy],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      preview: "just now",
      time: "11:00",
      updatedAt: "2026-09-14T11:00:00Z",
      lastMessageSenderHandle: "jordan",
      lastMessageBody: "just now",
      lastMessageIsSystem: false,
    });
    // The newer message carries no mailbox side, so the older one's clears.
    expect(merged[0]?.lastMessageStaffFirstName).toBeUndefined();
    expect(merged[0]?.lastMessageIsSentByViewer).toBeUndefined();
  });

  it("keeps a rename on the detail read beside a newer session message", () => {
    const sessionCopy = conversation({
      id: OLDER_THREAD_ID,
      name: "Old name",
      preview: "just now",
      updatedAt: "2026-09-14T11:00:00Z",
    });
    const detail = conversation({
      id: OLDER_THREAD_ID,
      name: "New name",
      preview: "an hour ago",
      updatedAt: "2026-09-14T10:00:00Z",
    });
    const [row] = merge({
      extraThreads: [sessionCopy],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(row).toMatchObject({
      name: "New name",
      preview: "just now",
      updatedAt: "2026-09-14T11:00:00Z",
    });
  });

  it("keeps a pin and a mute on the detail read beside a newer session message", () => {
    const sessionCopy = conversation({
      id: OLDER_THREAD_ID,
      preview: "just now",
      updatedAt: "2026-09-14T11:00:00Z",
    });
    const detail = conversation({
      id: OLDER_THREAD_ID,
      preview: "an hour ago",
      updatedAt: "2026-09-14T10:00:00Z",
      pinnedAt: "2026-09-14T10:30:00Z",
      muted: true,
    });
    const [row] = merge({
      extraThreads: [sessionCopy],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(row).toMatchObject({
      pinnedAt: "2026-09-14T10:30:00Z",
      muted: true,
      preview: "just now",
      updatedAt: "2026-09-14T11:00:00Z",
    });
  });

  it("gives a tie on updatedAt to the detail read, which carries a pin or a mute", () => {
    const sessionCopy = conversation({ id: OLDER_THREAD_ID });
    const detail = conversation({
      id: OLDER_THREAD_ID,
      pinnedAt: "2026-09-14T12:00:00Z",
    });
    const merged = merge({
      extraThreads: [sessionCopy],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(merged).toEqual([detail]);
  });

  it("keeps a picker placeholder that no cache can hold", () => {
    const placeholder = conversation({ id: "jordan-park", name: "Jordan" });
    expect(merge({ extraThreads: [placeholder] })).toEqual([placeholder]);
  });

  it("still hides a thread deleted this session", () => {
    const listRow = conversation();
    const merged = merge({
      extraThreads: [conversation({ name: "Session copy" })],
      baseThreads: [listRow],
      locallyDeletedIds: new Set([GROUP_ID]),
    });
    expect(merged).toEqual([]);
  });
});

describe("mergeInboxThreads (live ordering)", () => {
  it("places an older session row after the newer fetched rows", () => {
    const newest = conversation({
      id: "newest",
      updatedAt: "2026-09-14T12:00:00Z",
    });
    const older = conversation({
      id: "older",
      updatedAt: "2026-09-14T10:00:00Z",
    });
    const opened = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T11:00:00Z",
    });
    const merged = merge({
      extraThreads: [opened],
      baseThreads: [newest, older],
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      "newest",
      OLDER_THREAD_ID,
      "older",
    ]);
  });

  it("orders several session rows among the fetched rows by updatedAt", () => {
    const newest = conversation({
      id: "newest",
      updatedAt: "2026-09-14T12:00:00Z",
    });
    const older = conversation({
      id: "older",
      updatedAt: "2026-09-14T10:00:00Z",
    });
    const oldestSession = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T09:00:00Z",
    });
    const newerSession = conversation({
      id: NEW_THREAD_ID,
      updatedAt: "2026-09-14T11:00:00Z",
    });
    const merged = merge({
      extraThreads: [oldestSession, newerSession],
      baseThreads: [newest, older],
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      "newest",
      NEW_THREAD_ID,
      "older",
      OLDER_THREAD_ID,
    ]);
  });

  it("never makes a session row wait behind a fetched row with a bad updatedAt", () => {
    const badRow = conversation({
      id: "bad-row",
      updatedAt: "not-a-real-date",
    });
    const afterRow = conversation({
      id: "after-row",
      updatedAt: "2026-09-14T10:00:00Z",
    });
    const opened = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T01:00:00Z",
    });
    const merged = merge({
      extraThreads: [opened],
      baseThreads: [badRow, afterRow],
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      OLDER_THREAD_ID,
      "bad-row",
      "after-row",
    ]);
  });

  it("places a session row by its merged detail time", () => {
    const newest = conversation({
      id: "newest",
      updatedAt: "2026-09-14T12:00:00Z",
    });
    const older = conversation({
      id: "older",
      updatedAt: "2026-09-14T10:00:00Z",
    });
    const sessionCopy = conversation({
      id: OLDER_THREAD_ID,
      preview: "stale session copy",
      updatedAt: "2026-09-14T05:00:00Z",
    });
    const detail = conversation({
      id: OLDER_THREAD_ID,
      preview: "an hour before noon",
      updatedAt: "2026-09-14T10:30:00Z",
    });
    const merged = merge({
      extraThreads: [sessionCopy],
      baseThreads: [newest, older],
      detailThreadsById: new Map([[OLDER_THREAD_ID, detail]]),
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      "newest",
      OLDER_THREAD_ID,
      "older",
    ]);
    expect(merged[1]).toMatchObject({
      preview: "an hour before noon",
      updatedAt: "2026-09-14T10:30:00Z",
    });
  });

  it("keeps a session row with no readable updatedAt first", () => {
    const placeholder = conversation({
      id: "jordan-park",
      name: "Jordan",
      updatedAt: undefined,
    });
    const opened = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T09:00:00Z",
    });
    const listRow = conversation({ updatedAt: "2026-09-14T12:00:00Z" });
    const merged = merge({
      extraThreads: [opened, placeholder],
      baseThreads: [listRow],
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      "jordan-park",
      GROUP_ID,
      OLDER_THREAD_ID,
    ]);
  });

  it("leaves a row opened past the loaded pages in place once its page loads", () => {
    const firstPage = [
      conversation({ id: "newest", updatedAt: "2026-09-14T12:00:00Z" }),
      conversation({ id: "older", updatedAt: "2026-09-14T10:00:00Z" }),
    ];
    const opened = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T08:00:00Z",
    });
    const before = merge({ extraThreads: [opened], baseThreads: firstPage });
    expect(before.map((thread) => thread.id)).toEqual([
      "newest",
      "older",
      OLDER_THREAD_ID,
    ]);

    const grownThreads = [
      ...firstPage,
      conversation({ id: "between", updatedAt: "2026-09-14T09:00:00Z" }),
      conversation({ id: OLDER_THREAD_ID, updatedAt: "2026-09-14T08:00:00Z" }),
      conversation({ id: "oldest", updatedAt: "2026-09-14T07:00:00Z" }),
    ];
    const prunedExtraThreads = withoutListedExtraThreads(
      [opened],
      new Set(grownThreads.map((thread) => thread.id)),
      true,
    );
    const after = merge({
      extraThreads: prunedExtraThreads,
      baseThreads: grownThreads,
    });
    expect(after.map((thread) => thread.id)).toEqual([
      "newest",
      "older",
      "between",
      OLDER_THREAD_ID,
      "oldest",
    ]);
  });
});

describe("mergeInboxThreads (demo)", () => {
  it("keeps the session copy on top, since demo group changes live there alone", () => {
    const simulated = conversation({ name: "Renamed in demo" });
    const detail = conversation({ name: "Never read in demo" });
    const merged = merge({
      extraThreads: [simulated],
      baseThreads: [conversation()],
      detailThreadsById: new Map([[GROUP_ID, detail]]),
      shouldPreferCachedRows: false,
    });
    expect(merged).toEqual([simulated]);
  });

  it("keeps an older session row above the seeded list", () => {
    const opened = conversation({
      id: OLDER_THREAD_ID,
      updatedAt: "2026-09-14T08:00:00Z",
    });
    const merged = merge({
      extraThreads: [opened],
      baseThreads: [conversation({ updatedAt: "2026-09-14T12:00:00Z" })],
      shouldPreferCachedRows: false,
    });
    expect(merged.map((thread) => thread.id)).toEqual([
      OLDER_THREAD_ID,
      GROUP_ID,
    ]);
  });
});

describe("withoutListedExtraThreads", () => {
  it("drops the session rows the list pages now hold", () => {
    const listed = conversation();
    const unlisted = conversation({ id: NEW_THREAD_ID });
    const pruned = withoutListedExtraThreads(
      [unlisted, conversation({ name: "Session copy" })],
      new Set([listed.id]),
      true,
    );
    expect(pruned).toEqual([unlisted]);
  });

  it("returns the same array when nothing is listed, so no render is spent", () => {
    const extraThreads = [conversation({ id: NEW_THREAD_ID })];
    expect(
      withoutListedExtraThreads(extraThreads, new Set([GROUP_ID]), true),
    ).toBe(extraThreads);
  });

  it("leaves demo session rows alone", () => {
    const extraThreads = [conversation({ name: "Renamed in demo" })];
    expect(
      withoutListedExtraThreads(extraThreads, new Set([GROUP_ID]), false),
    ).toBe(extraThreads);
  });
});
