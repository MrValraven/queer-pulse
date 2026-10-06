import { describe, expect, it } from "vitest";
import { DEMO_DUPLICATE_CALL_LINK, THREADS } from "./forum.data";
import { FORUM_TAG_CATEGORIES, FORUM_TAG_OPTIONS } from "./forumTags.data";

const calls = THREADS.filter((thread) => thread.kind === "call");

describe("demo open calls", () => {
  it("cover every call state the views filter on", () => {
    const states = new Set(calls.map((thread) => thread.funding?.callState));
    expect(calls).toHaveLength(5);
    expect(states).toEqual(new Set(["open", "closing", "closed"]));
    expect(calls.some((thread) => thread.funding?.deadline === null)).toBe(
      true,
    );
  });

  it("live in Funding & Grants and carry the server-owned tag", () => {
    for (const thread of calls) {
      expect(thread.category).toBe("funding");
      expect(thread.tags).toContain("open-call");
    }
  });

  it("give the duplicate lookup an open call to find", () => {
    const match = calls.find(
      (thread) => thread.funding?.linkUrl === DEMO_DUPLICATE_CALL_LINK,
    );
    expect(match?.funding?.callState).toBe("open");
  });

  it("keep open-call browsable and out of the tag picker", () => {
    expect(FORUM_TAG_OPTIONS).not.toContain("open-call");
    expect(FORUM_TAG_CATEGORIES.flatMap((category) => category.tags)).toContain(
      "open-call",
    );
  });
});
