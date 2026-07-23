import { describe, expect, it } from "vitest";
import { buildRecipientConversation } from "./recipient";

describe("buildRecipientConversation", () => {
  it("derives id/slug/initials from the member", () => {
    const recipient = buildRecipientConversation("alina", "Alina C.");
    expect(recipient.id).toBe("alina");
    expect(recipient.slug).toBe("alina");
    expect(recipient.initials).toBe("AC");
    expect(recipient.messages).toEqual([]);
  });

  it("handles a single-word name", () => {
    expect(buildRecipientConversation("mara", "Mara").initials).toBe("M");
  });
});
