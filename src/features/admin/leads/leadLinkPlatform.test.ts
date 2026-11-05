import { describe, expect, it } from "vitest";
import { LEAD_SOCIAL_HOSTS } from "./api/leadLinkKey";
import {
  LEAD_LINK_PLATFORMS,
  LEAD_WEBSITE_PLATFORM,
} from "./leadLinkPlatform.data";
import { leadLinkHost, leadLinkPlatform } from "./leadLinkPlatform";

describe("leadLinkPlatform", () => {
  it.each([
    ["https://www.instagram.com/x", "instagram"],
    ["https://m.facebook.com/x", "facebook"],
    ["https://artist.bandcamp.com", "bandcamp"],
    ["https://youtu.be/abc", "youtube"],
    ["https://twitter.com/x", "x"],
    ["https://ra.co/dj/x", "residentAdvisor"],
    ["https://example.org", "website"],
    ["not a link", "website"],
  ])("detects %s as %s", (link, platformId) => {
    expect(leadLinkPlatform(link).id).toBe(platformId);
  });

  it("does not take a host that only ends with a platform's letters", () => {
    expect(leadLinkPlatform("https://notinstagram.com/x").id).toBe("website");
  });

  it("gives every platform a label and an icon", () => {
    for (const platform of [...LEAD_LINK_PLATFORMS, LEAD_WEBSITE_PLATFORM]) {
      expect(platform.labelKey).toBe(`admin:leads.platform.${platform.id}`);
      expect(typeof platform.icon).toBe("function");
    }
  });

  it("covers every social host the link key knows", () => {
    const platformHosts = LEAD_LINK_PLATFORMS.flatMap(
      (platform) => platform.hosts,
    );
    expect([...platformHosts].sort()).toEqual([...LEAD_SOCIAL_HOSTS].sort());
  });

  it("reads the host for display", () => {
    expect(leadLinkHost("https://www.cave23.example/agenda")).toBe(
      "cave23.example",
    );
    expect(leadLinkHost("not a link")).toBeNull();
  });
});
