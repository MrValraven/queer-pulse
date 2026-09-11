import { describe, expect, it } from "vitest";
import { isPastableImageUrl, pastedImageUrlProblem } from "./listBusiness.data";

describe("isPastableImageUrl", () => {
  it("accepts https links on the hosts the backend trusts", () => {
    expect(
      isPastableImageUrl("https://images.unsplash.com/photo-1?w=800"),
    ).toBe(true);
    expect(isPastableImageUrl("  https://plus.unsplash.com/a.jpg  ")).toBe(
      true,
    );
    expect(isPastableImageUrl("https://lh3.googleusercontent.com/abc")).toBe(
      true,
    );
    expect(isPastableImageUrl("https://image.mux.com/id/thumbnail.jpg")).toBe(
      true,
    );
  });
  it("rejects empty, whitespace, and everything the backend refuses", () => {
    expect(isPastableImageUrl("")).toBe(false);
    expect(isPastableImageUrl("   ")).toBe(false);
    // http is a mixed-content downgrade; data:/blob: are stored-XSS vectors.
    // The backend's @IsImageReference refuses all three, so the paste field
    // must too (otherwise the value 400s the whole listing save).
    expect(isPastableImageUrl("http://images.unsplash.com/a.jpg")).toBe(false);
    expect(isPastableImageUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(isPastableImageUrl("blob:https://app/uuid")).toBe(false);
    expect(isPastableImageUrl("javascript:alert(1)")).toBe(false);
    expect(isPastableImageUrl("not a url")).toBe(false);
    // Any other https host is refused by the backend's host allowlist.
    expect(isPastableImageUrl("https://example.com/a.jpg")).toBe(false);
  });
});

describe("pastedImageUrlProblem", () => {
  it("names the reason a link is refused", () => {
    expect(pastedImageUrlProblem("not a url")).toBe("notUrl");
    expect(pastedImageUrlProblem("http://images.unsplash.com/a.jpg")).toBe(
      "notHttps",
    );
    expect(pastedImageUrlProblem("https://example.com/a.jpg")).toBe(
      "hostNotAllowed",
    );
    expect(pastedImageUrlProblem("https://images.unsplash.com/a.jpg")).toBe(
      null,
    );
  });
  it("matches the parsed host, never a substring", () => {
    expect(
      pastedImageUrlProblem("https://evil.example/?x=images.unsplash.com"),
    ).toBe("hostNotAllowed");
    expect(
      pastedImageUrlProblem("https://images.unsplash.com@evil.example/pixel"),
    ).toBe("hostNotAllowed");
    expect(pastedImageUrlProblem("https://notunsplash.com/a.jpg")).toBe(
      "hostNotAllowed",
    );
  });
});
