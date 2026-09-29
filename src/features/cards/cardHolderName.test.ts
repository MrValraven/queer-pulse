import { describe, expect, it } from "vitest";
import { cardHolderName } from "./cardHolderName";

// Echoes the key, so each case shows which catalog entry it would print.
const translate = (key: string) => key;

describe("cardHolderName", () => {
  it("prints the name the backend sent", () => {
    expect(cardHolderName("Rita Valente", translate)).toBe("Rita Valente");
  });

  it("prints the localized fallback for a holder with no name", () => {
    expect(cardHolderName(null, translate)).toBe("cards:holder.fallbackName");
  });

  it("prints the localized fallback for a blank name", () => {
    expect(cardHolderName("   ", translate)).toBe("cards:holder.fallbackName");
  });
});
