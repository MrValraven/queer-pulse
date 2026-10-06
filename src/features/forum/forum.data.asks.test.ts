import { describe, expect, it } from "vitest";
import { currentUser } from "../members/data/members";
import { THREADS } from "./forum.data";
import { isAllowedFundraisingHost } from "./funding/fundingLink";

const asks = THREADS.filter((thread) => thread.kind === "ask");

describe("demo fundraisers", () => {
  it("has two approved, active fundraisers on allow-listed hosts", () => {
    expect(asks).toHaveLength(2);
    for (const thread of asks) {
      expect(thread.category).toBe("funding");
      expect(thread.funding?.askState).toBe("active");
      expect(thread.funding?.approvedAt).not.toBeNull();
      expect(isAllowedFundraisingHost(thread.funding?.linkUrl ?? "")).toBe(
        true,
      );
      expect(thread.isAnonymous).not.toBe(true);
    }
  });

  it("includes one by the demo persona, so the author's controls show", () => {
    expect(asks.some((thread) => thread.author.slug === currentUser.slug)).toBe(
      true,
    );
  });
});
