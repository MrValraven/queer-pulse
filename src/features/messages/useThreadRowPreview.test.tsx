import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useThreadRowPreview } from "./useThreadRowPreview";
import type { ConversationWithPreview } from "./api/messages.adapters";

/**
 * ENG-253: `useThreadRowPreview`'s row draft preview now reads a LIVE list
 * row's trimmed `draftPreview`, gated by `hasDraft`, rather than the full
 * `draft` string it no longer carries. See this build's report and the
 * hook's own doc for the `hasDraft === undefined` legacy-DEMO-row fallback
 * these specs cover.
 */

function baseThread(
  overrides: Partial<ConversationWithPreview>,
): ConversationWithPreview {
  return {
    id: "c1",
    initials: "AB",
    tint: "coral",
    name: "Ana Beatriz",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    preview: "hey!",
    unread: false,
    // A row's grouped message log is irrelevant to the draft-preview specs
    // below; an empty log still completes the required `Conversation` shape
    // rather than leaving it a partial fixture.
    messages: [],
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("useThreadRowPreview: draft source (ENG-253)", () => {
  it("reads a LIVE row's trimmed draftPreview when hasDraft is true", () => {
    const thread = baseThread({
      hasDraft: true,
      draftPreview: "Hey, are we still on for",
      // A LIVE row never carries the full legacy `draft` any more. Setting a
      // DIFFERENT string on it here proves the hook reads `draftPreview`
      // once `hasDraft` is defined, ignoring `draft` entirely.
      draft: "this legacy field must be ignored",
    });
    const { result } = renderHook(() => useThreadRowPreview(thread, false), {
      wrapper: TestProviders,
    });
    expect(result.current.draftText).toBe("Hey, are we still on for");
  });

  it("shows no draft when a LIVE row's hasDraft is false, even if a stale legacy draft string is present", () => {
    const thread = baseThread({
      hasDraft: false,
      draftPreview: null,
      draft: "stale, must not surface",
    });
    const { result } = renderHook(() => useThreadRowPreview(thread, false), {
      wrapper: TestProviders,
    });
    expect(result.current.draftText).toBe("");
  });

  it("falls back to the legacy draft field for a DEMO row (hasDraft undefined)", () => {
    const thread = baseThread({
      draft: "Draft typed in the demo mock",
      // Deliberately no `hasDraft`/`draftPreview` at all, matching a plain
      // seeded demo `Conversation` that never routes through
      // `conversationToView`.
    });
    const { result } = renderHook(() => useThreadRowPreview(thread, false), {
      wrapper: TestProviders,
    });
    expect(result.current.draftText).toBe("Draft typed in the demo mock");
  });

  it("never shows a draft for the currently open thread, regardless of source", () => {
    const thread = baseThread({
      hasDraft: true,
      draftPreview: "Should stay hidden while open",
    });
    const { result } = renderHook(() => useThreadRowPreview(thread, true), {
      wrapper: TestProviders,
    });
    expect(result.current.draftText).toBe("");
  });
});
