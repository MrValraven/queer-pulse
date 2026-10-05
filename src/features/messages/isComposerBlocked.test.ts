import { describe, expect, it } from "vitest";
import type { Conversation } from "./data";
import { isComposerBlocked, isOfficialReadOnly } from "./isComposerBlocked";

const officialThread = {
  id: "team",
  name: "QueerPulse Team",
  initials: "QP",
  tint: "plum",
  official: true,
} as Conversation;

describe("the official thread's composer", () => {
  it("stays severed while the server keeps replies closed", () => {
    expect(isOfficialReadOnly(officialThread)).toBe(true);
    expect(isComposerBlocked(officialThread, false)).toBe(true);
  });

  it("opens once the server opens replies", () => {
    const replyOpen = { ...officialThread, isOfficialReplyOpen: true };
    expect(isOfficialReadOnly(replyOpen)).toBe(false);
    expect(isComposerBlocked(replyOpen, false)).toBe(false);
  });

  it("never treats an ordinary thread as official", () => {
    expect(isOfficialReadOnly({ official: false })).toBe(false);
    expect(isOfficialReadOnly({})).toBe(false);
  });
});
