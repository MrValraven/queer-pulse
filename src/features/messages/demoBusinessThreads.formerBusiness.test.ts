import { afterEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../../shared/i18n/locale";
import { formerBusinessConversation } from "./demoBusinessThreads.data";

afterEach(() => {
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("demo former-business row", () => {
  it("names the deleted business in English with no initials, like the live row", () => {
    window.localStorage.setItem(STORAGE_KEY, "en");
    expect(formerBusinessConversation.name).toBe("Former business");
    expect(formerBusinessConversation.initials).toBe("");
  });

  it("names it in Portuguese for a Portuguese reader, and follows a language switch", () => {
    window.localStorage.setItem(STORAGE_KEY, "pt");
    expect(formerBusinessConversation.name).toBe("Antigo negócio");
    expect({ ...formerBusinessConversation }.name).toBe("Antigo negócio");
    window.localStorage.setItem(STORAGE_KEY, "en");
    expect(formerBusinessConversation.name).toBe("Former business");
  });
});
