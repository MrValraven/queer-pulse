import { describe, expect, it } from "vitest";
import { encodedHostOf, socialProfileHref } from "./socialProfileLink";

describe("socialProfileHref", () => {
  it.each([
    ["https://instagram.com/ana", "https://instagram.com/ana"],
    ["http://example.org/ana", "http://example.org/ana"],
    ["instagram.com/ana", "https://instagram.com/ana"],
    ["www.tiktok.com/@ana?lang=pt", "https://www.tiktok.com/@ana?lang=pt"],
    [
      "bsky.app/profile/ana.bsky.social",
      "https://bsky.app/profile/ana.bsky.social",
    ],
    ["  https://instagram.com/ana  ", "https://instagram.com/ana"],
    ["HTTPS://Instagram.com/ana", "https://instagram.com/ana"],
  ])("links %s", (raw, expected) => {
    expect(socialProfileHref(raw)).toBe(expected);
  });

  it.each([
    ["javascript:alert(1)"],
    ["JavaScript:alert(1)"],
    ["data:text/html,<script>alert(1)</script>"],
    ["//evil.example/ana"],
    ["localhost:3000"],
    ["https://"],
    ["https://localhost/ana"],
    ["https://instagram.com@evil.example"],
    ["https://user:pw@instagram.com/ana"],
    ["https:/evil.com"],
    ["https:evil.com"],
    ["https:\\\\evil.com"],
    ["https://evil.com\\@x.com"],
    ["https://127.0.0.1/ana"],
    ["https://1.2/"],
    ["@ana"],
    ["ana on insta"],
    ["ana"],
    [""],
    ["   "],
  ])("keeps %s as plain text", (raw) => {
    expect(socialProfileHref(raw)).toBeNull();
  });

  it("returns null for null", () => {
    expect(socialProfileHref(null)).toBeNull();
  });
});

describe("encodedHostOf", () => {
  it("returns the punycode host of a look-alike domain", () => {
    expect(
      encodedHostOf(socialProfileHref("https://\u0456nstagram.com/ana")),
    ).toBe("xn--nstagram-shh.com");
  });

  it("returns null for a plain ASCII host", () => {
    expect(encodedHostOf("https://instagram.com/ana")).toBeNull();
  });

  it("returns null for null", () => {
    expect(encodedHostOf(null)).toBeNull();
  });

  it("returns null when the href does not parse", () => {
    expect(encodedHostOf("not a url")).toBeNull();
  });

  it("keeps a bare internationalised domain unlinked", () => {
    expect(socialProfileHref("b\u00fccher.de/ana")).toBeNull();
  });
});
