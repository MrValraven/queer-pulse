import { describe, expect, it } from "vitest";
import {
  initialsFromName,
  initialsFromParts,
  leadingInitials,
  orgBadgeInitials,
} from "./initials";

describe("initialsFromName", () => {
  it("takes the first and last words, uppercased", () => {
    expect(initialsFromName("Maria João Silva")).toBe("MS");
    expect(initialsFromName("ana costa")).toBe("AC");
  });
  it("returns a single letter for a one-word name", () => {
    expect(initialsFromName("Prince")).toBe("P");
  });
  it("collapses extra whitespace", () => {
    expect(initialsFromName("  Rui   Gomes  ")).toBe("RG");
  });
  it("returns the fallback for an empty or whitespace-only name", () => {
    expect(initialsFromName("")).toBe("");
    expect(initialsFromName("   ")).toBe("");
    expect(initialsFromName("", "?")).toBe("?");
  });
});

describe("leadingInitials", () => {
  it("takes the first two words by default", () => {
    expect(leadingInitials("Community Arts Space")).toBe("CA");
    expect(leadingInitials("Casa Trans")).toBe("CT");
  });
  it("honours a custom word count", () => {
    expect(leadingInitials("Casa Trans Lisboa", { wordCount: 3 })).toBe("CTL");
  });
  it("returns the fallback for an empty name", () => {
    expect(leadingInitials("")).toBe("");
    expect(leadingInitials("   ", { fallback: "•" })).toBe("•");
  });
});

describe("initialsFromParts", () => {
  it("uppercases the first letter of each name", () => {
    expect(initialsFromParts("inês", "santos")).toBe("IS");
  });
  it("tolerates empty parts", () => {
    expect(initialsFromParts("", "")).toBe("");
    expect(initialsFromParts("Ana", "")).toBe("A");
  });
});

describe("orgBadgeInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(orgBadgeInitials("Atelier Pulso")).toBe("AP");
  });
  it("pads a single-word name to two characters", () => {
    expect(orgBadgeInitials("Rádio")).toBe("RÁ");
  });
  it("returns the fallback for an empty name", () => {
    expect(orgBadgeInitials("   ")).toBe("QP");
    expect(orgBadgeInitials("   ", "?")).toBe("?");
  });
});
