import { describe, expect, it } from "vitest";
import { buildVCard, escapeVCard } from "./vcard";
import { personaShareUrl } from "./personaLinks.data";
import { toAbsoluteUrl } from "../../shared/seo";
import { socialHref } from "../../shared/social/socialPlatforms";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The vCard builder is pure + synchronous (called straight from a click handler
 * with no loading state), so it's tested without any providers. The escaping is
 * the security-sensitive part — RFC 6350 reserves backslash, comma, semicolon
 * and newline, and the backslash MUST be escaped first or every other escape is
 * double-escaped. `buildVCard`'s line set + CRLF framing is asserted against the
 * same helpers the builder uses (`personaShareUrl`/`toAbsoluteUrl`/`socialHref`)
 * so the test tracks the real derivation rather than hardcoding a host.
 */

function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-vcard",
    kind: "musician",
    slug: "nightform",
    handle: "nightform",
    displayName: "NIGHTFORM",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "unlinked",
    status: "published",
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...overrides,
  };
}

describe("escapeVCard", () => {
  it("escapes each reserved character", () => {
    expect(escapeVCard("a\\b")).toBe("a\\\\b"); // backslash doubled
    expect(escapeVCard("a,b")).toBe("a\\,b");
    expect(escapeVCard("a;b")).toBe("a\\;b");
    expect(escapeVCard("a\nb")).toBe("a\\nb");
    expect(escapeVCard("a\r\nb")).toBe("a\\nb");
  });

  it("escapes the backslash first so other escapes are not double-escaped", () => {
    // Input is a backslash followed by a comma: `\,`. Backslash-first order
    // yields three backslashes + comma (`\\` + `\,`); a comma-first order would
    // wrongly produce `\\\\,`.
    expect(escapeVCard("\\,")).toBe("\\\\\\,");
  });
});

describe("buildVCard", () => {
  it("frames a VERSION:3.0 card with CRLF line breaks", () => {
    const card = buildVCard(makeView());
    expect(card.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(card.endsWith("\r\nEND:VCARD")).toBe(true);
  });

  it("emits FN/N/TITLE/URL/PHOTO and each resolvable social link, escaping text", () => {
    const view = makeView({
      displayName: "NIGHTFORM",
      tagline: "After-hours electronics",
      avatarUrl: "https://img.test/a.jpg",
      bio: "Producer, DJ",
      socialLinks: [
        { platform: "instagram", urlOrHandle: "@nightform" },
        { platform: "email", urlOrHandle: "hi@nightform.test" },
      ],
    });
    const card = buildVCard(view);
    const lines = card.split("\r\n");

    expect(lines).toContain("FN:NIGHTFORM");
    expect(lines).toContain("N:NIGHTFORM;;;;");
    expect(lines).toContain("TITLE:After-hours electronics");
    expect(lines).toContain(`URL:${personaShareUrl(view)}`);
    expect(lines).toContain(
      `PHOTO;VALUE=URI:${toAbsoluteUrl("https://img.test/a.jpg")}`,
    );
    // Instagram resolves to a full URL line.
    expect(lines).toContain(`URL:${socialHref("instagram", "@nightform")}`);
    // Email yields both a URL (mailto:) and a dedicated EMAIL line.
    expect(lines).toContain("URL:mailto:hi@nightform.test");
    expect(lines).toContain("EMAIL:hi@nightform.test");
    // Bio (with its comma) is escaped in the NOTE line.
    expect(lines).toContain("NOTE:Producer\\, DJ");
  });

  it("omits optional lines that have no value", () => {
    const card = buildVCard(makeView({ tagline: "", avatarUrl: null, bio: "" }));
    const lines = card.split("\r\n");
    expect(lines.some((line) => line.startsWith("TITLE:"))).toBe(false);
    expect(lines.some((line) => line.startsWith("PHOTO"))).toBe(false);
    expect(lines.some((line) => line.startsWith("NOTE:"))).toBe(false);
  });
});
