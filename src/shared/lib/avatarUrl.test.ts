import { describe, expect, it } from "vitest";
import { resolveAvatarSrc } from "./avatarUrl";

describe("resolveAvatarSrc", () => {
  it("returns undefined/empty input untouched", () => {
    expect(resolveAvatarSrc(undefined)).toBeUndefined();
    expect(resolveAvatarSrc("")).toBe("");
  });

  it("leaves non-Google/non-Unsplash hosts alone", () => {
    const src = "https://cdn.example.com/photo.jpg?w=100";
    expect(resolveAvatarSrc(src, 900)).toBe(src);
  });

  describe("Google avatars", () => {
    it("rewrites the trailing size directive to the requested px", () => {
      expect(
        resolveAvatarSrc("https://lh3.googleusercontent.com/a/ABC=s96-c", 256),
      ).toBe("https://lh3.googleusercontent.com/a/ABC=s256");
    });

    it("rewrites the compound place-photo directive", () => {
      expect(
        resolveAvatarSrc(
          "https://lh3.googleusercontent.com/p/XYZ=s680-w680-h510-rw",
          900,
        ),
      ).toBe("https://lh3.googleusercontent.com/p/XYZ=s900");
    });

    it("rewrites the legacy ?sz= query param", () => {
      expect(
        resolveAvatarSrc("https://lh3.googleusercontent.com/a/ABC?sz=96", 200),
      ).toBe("https://lh3.googleusercontent.com/a/ABC?sz=200");
    });

    it("appends a size directive when the URL has none (avoids Google's small default)", () => {
      expect(
        resolveAvatarSrc("https://lh3.googleusercontent.com/a/ACg8ocKf123", 900),
      ).toBe("https://lh3.googleusercontent.com/a/ACg8ocKf123=s900");
    });

    it("does not append a directive when a query string is present", () => {
      const src = "https://lh3.googleusercontent.com/a/ACg8ocKf123?foo=bar";
      expect(resolveAvatarSrc(src, 900)).toBe(src);
    });
  });

  describe("Unsplash images", () => {
    // The bug: a small authored width fed a large slot → upscaled → blurry.
    it("raises a small authored width up to the requested px", () => {
      const out = resolveAvatarSrc(
        "https://images.unsplash.com/photo-123?q=80&w=600&auto=format&fit=crop",
        900,
      );
      const url = new URL(out!);
      expect(url.searchParams.get("w")).toBe("900");
      // other params are preserved
      expect(url.searchParams.get("q")).toBe("80");
      expect(url.searchParams.get("fit")).toBe("crop");
    });

    it("also handles the plus.unsplash.com host", () => {
      const out = resolveAvatarSrc(
        "https://plus.unsplash.com/premium_photo-1?q=80&w=800&auto=format&fit=crop",
        900,
      );
      expect(new URL(out!).searchParams.get("w")).toBe("900");
    });

    it("never DOWN-sizes an already-generous width (raise-only)", () => {
      const src =
        "https://images.unsplash.com/photo-1?q=80&w=1170&auto=format&fit=crop";
      // A caller passing the small default must not soften this.
      expect(new URL(resolveAvatarSrc(src, 256)!).searchParams.get("w")).toBe(
        "1170",
      );
    });

    it("adds a width when the URL has none", () => {
      const out = resolveAvatarSrc(
        "https://images.unsplash.com/photo-1?q=80&fit=crop",
        512,
      );
      expect(new URL(out!).searchParams.get("w")).toBe("512");
    });

    it("raises height too, but only when the URL already constrains it", () => {
      const withH = resolveAvatarSrc(
        "https://images.unsplash.com/photo-1?w=200&h=200&fit=crop",
        400,
      );
      const withHUrl = new URL(withH!);
      expect(withHUrl.searchParams.get("w")).toBe("400");
      expect(withHUrl.searchParams.get("h")).toBe("400");

      const widthOnly = resolveAvatarSrc(
        "https://images.unsplash.com/photo-1?w=200&fit=crop",
        400,
      );
      // width-only URLs stay width-bound (aspect ratio preserved)
      expect(new URL(widthOnly!).searchParams.has("h")).toBe(false);
    });
  });
});
