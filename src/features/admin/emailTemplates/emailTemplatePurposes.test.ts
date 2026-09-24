import { describe, expect, it } from "vitest";
import {
  formatEmailDate,
  sampleValuesFor,
  unknownPlaceholders,
} from "./emailTemplatePurposes";

describe("emailTemplatePurposes", () => {
  it("lists tokens a purpose does not allow, ignoring CSS braces", () => {
    expect(
      unknownPlaceholders(
        "{name} p{margin:0} {firstName} {name}",
        "invite_approved",
      ),
    ).toEqual(["firstName"]);
    expect(unknownPlaceholders("Hi {name}", "general")).toEqual(["name"]);
  });

  it("formats dates in long form per language", () => {
    const date = new Date("2026-10-01T12:00:00Z");
    expect(formatEmailDate(date, "en")).toBe("October 1, 2026");
    expect(formatEmailDate(date, "pt")).toBe("1 de outubro de 2026");
  });

  it("builds sample values seven days ahead", () => {
    const values = sampleValuesFor("en", new Date("2026-09-24T12:00:00Z"));
    expect(values.name).toBe("Alex");
    expect(values.inviteLink).toMatch(/\/SAMPLE$/);
    expect(values.expiresOn).toBe("October 1, 2026");
  });
});
