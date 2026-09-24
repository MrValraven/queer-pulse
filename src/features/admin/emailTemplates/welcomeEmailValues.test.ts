import { describe, expect, it } from "vitest";
import { firstNameOf, welcomeEmailValues } from "./welcomeEmailValues";

describe("welcomeEmailValues", () => {
  it("uses the first name, the invite link and the long expiry date", () => {
    const values = welcomeEmailValues(
      {
        name: "  Kai Mendes ",
        inviteCode: "ABC123",
        inviteExpiresAt: "2026-10-01T12:00:00Z",
      },
      "pt",
    );
    expect(values.name).toBe("Kai");
    expect(values.inviteLink).toMatch(/ABC123$/);
    expect(values.expiresOn).toBe("1 de outubro de 2026");
  });

  it("reads naturally when the invite has no expiry", () => {
    const values = welcomeEmailValues(
      { name: "Ana", inviteCode: "X", inviteExpiresAt: null },
      "en",
    );
    expect(values.expiresOn).toBe("it is used");
  });

  it("keeps a one-word name whole", () => {
    expect(firstNameOf("Ana")).toBe("Ana");
  });
});
