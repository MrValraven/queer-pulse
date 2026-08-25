import { describe, expect, it } from "vitest";
import { socialDisplayLabel, socialHref } from "./socialLinks.data";

describe("socialHref", () => {
  it("prefixes a bare handle", () => {
    expect(socialHref("github", "ruimarcal")).toBe(
      "https://github.com/ruimarcal",
    );
    expect(socialHref("instagram", "@joao")).toBe("https://instagram.com/joao");
    expect(socialHref("letterboxd", "joao")).toBe(
      "https://letterboxd.com/joao",
    );
    expect(socialHref("backloggd", "joao")).toBe(
      "https://backloggd.com/u/joao",
    );
  });

  it("does not double the host when the value already carries it", () => {
    expect(socialHref("github", "github.com/ruimarcal")).toBe(
      "https://github.com/ruimarcal",
    );
    expect(socialHref("letterboxd", "letterboxd.com/joao")).toBe(
      "https://letterboxd.com/joao",
    );
    expect(socialHref("backloggd", "backloggd.com/u/joao")).toBe(
      "https://backloggd.com/u/joao",
    );
    expect(socialHref("tiktok", "www.tiktok.com/@joao")).toBe(
      "https://tiktok.com/@joao",
    );
  });

  it("passes a full URL through untouched", () => {
    expect(socialHref("github", "https://github.com/ruimarcal")).toBe(
      "https://github.com/ruimarcal",
    );
  });

  it("adds a scheme to a bare domain on prefix-less platforms", () => {
    expect(socialHref("goodreads", "goodreads.com/user/show/1-joao")).toBe(
      "https://goodreads.com/user/show/1-joao",
    );
    expect(socialHref("website", "joaoribeiro.pt")).toBe(
      "https://joaoribeiro.pt",
    );
  });

  it("builds a mailto for email", () => {
    expect(socialHref("email", "you@email.com")).toBe("mailto:you@email.com");
    expect(socialHref("email", "mailto:you@email.com")).toBe(
      "mailto:you@email.com",
    );
  });

  it("returns undefined when the value can't be a link", () => {
    expect(socialHref("mastodon", "@you@instance.social")).toBeUndefined();
    expect(socialHref("website", "   ")).toBeUndefined();
  });
});

describe("socialDisplayLabel", () => {
  it("shows only the handle for handle platforms", () => {
    expect(socialDisplayLabel("github", "https://github.com/MrValraven")).toBe(
      "MrValraven",
    );
    expect(socialDisplayLabel("github", "github.com/MrValraven")).toBe(
      "MrValraven",
    );
    expect(socialDisplayLabel("instagram", "@mrvalraven")).toBe("mrvalraven");
    expect(socialDisplayLabel("instagram", "mrvalraven")).toBe("mrvalraven");
    expect(socialDisplayLabel("tiktok", "www.tiktok.com/@joao")).toBe("joao");
  });

  it("shows only the domain for a website", () => {
    expect(
      socialDisplayLabel("website", "https://www.tiagocostadev.com/#/"),
    ).toBe("tiagocostadev.com");
    expect(socialDisplayLabel("website", "tiagocostadev.com")).toBe(
      "tiagocostadev.com",
    );
  });

  it("strips mailto for email and leaves a Mastodon address whole", () => {
    expect(socialDisplayLabel("email", "mailto:you@email.com")).toBe(
      "you@email.com",
    );
    expect(socialDisplayLabel("mastodon", "@you@instance.social")).toBe(
      "@you@instance.social",
    );
  });
});
