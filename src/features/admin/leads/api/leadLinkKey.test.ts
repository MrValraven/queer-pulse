import { describe, expect, it } from "vitest";
import { LEAD_SOCIAL_HOSTS, leadLinkKey } from "./leadLinkKey";

describe("leadLinkKey", () => {
  it.each([
    ["https://www.Instagram.com/Ana.Dj/?igsh=abc", "instagram.com/Ana.Dj"],
    ["http://instagram.com/Ana.Dj", "instagram.com/Ana.Dj"],
    ["https://example.org/press?id=4#top", "example.org/press?id=4"],
    ["https://open.spotify.com/artist/7x?si=1", "open.spotify.com/artist/7x"],
    ["https://www.youtube.com/watch?v=abc&t=10", "youtube.com/watch?v=abc"],
    ["https://example.org:8443/", "example.org:8443"],
    ["https://example.org/", "example.org"],
  ])("keys %s as %s", (link, key) => {
    expect(leadLinkKey(link)).toBe(key);
  });

  it.each([
    "instagram.com/ana",
    "ftp://example.org",
    "mailto:a@b.c",
    "https://",
    "",
  ])("refuses %s", (link) => {
    expect(leadLinkKey(link)).toBeNull();
  });

  it("trims the text before reading it", () => {
    expect(leadLinkKey("  https://cave23.example/  ")).toBe("cave23.example");
  });

  it("keeps the path case and drops the tracking query on a subdomain", () => {
    expect(leadLinkKey("https://m.facebook.com/Cave23?ref=share")).toBe(
      "m.facebook.com/Cave23",
    );
  });

  it("drops the query of a YouTube page that is no watch page", () => {
    expect(leadLinkKey("https://youtube.com/@cave23?si=1")).toBe(
      "youtube.com/@cave23",
    );
  });

  it("keys a YouTube watch page with no video as the bare page", () => {
    expect(leadLinkKey("https://www.youtube.com/watch?t=10")).toBe(
      "youtube.com/watch",
    );
  });

  it("lists the fourteen social hosts of the contract", () => {
    expect(LEAD_SOCIAL_HOSTS).toHaveLength(14);
  });
});
